/**
 * Rule-based outfit recommender. Uses ONLY items that exist in the user's closet.
 * Every suggestion carries plain-language reasons. Feedback (thumbs up/down) shifts future scores.
 */
import { COLORS, colorInfo, isNeutral } from './taxonomy';
import type { Category, FeedbackEntry, Item, Occasion, Outfit, Profile, Season } from './types';

export interface RecRequest {
  anchorIds?: string[];
  season?: Season;
  occasion?: Occasion;
  colors?: string[];
  aesthetics?: string[];
  count?: number;
  stretch?: boolean;
  seed?: number;
  today?: string;
}

export interface Suggestion {
  key: string;
  itemIds: string[];
  score: number;
  reasons: string[];
  stretch: boolean;
}

export interface RecResult { suggestions: Suggestion[]; problems: string[] }

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const keyOf = (ids: string[]) => [...ids].sort().join('|');

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
}

export function seasonOk(item: Item, season?: Season) {
  return !season || item.seasons.length === 0 || item.seasons.includes(season);
}

export function isCompleteOutfit(items: Pick<Item, 'category'>[]) {
  const has = (c: Category) => items.some((i) => i.category === c);
  return has('Dresses') || (has('Tops') && has('Bottoms'));
}

export function pairFeedback(feedback: FeedbackEntry[]) {
  const map = new Map<string, number>();
  for (const f of feedback) {
    const ids = [...new Set(f.itemIds)].sort();
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const k = `${ids[i]}|${ids[j]}`;
      map.set(k, (map.get(k) ?? 0) + (f.verdict === 'up' ? 1 : -1.5));
    }
  }
  return map;
}

interface Ctx {
  req: RecRequest; profile: Profile; pairs: Map<string, number>; saved: Set<string>; today: string; rand: () => number;
}

function itemPrior(it: Item, c: Ctx): { s: number; why?: string } {
  let s = 0; let why: string | undefined;
  if (c.req.occasion && it.occasions.includes(c.req.occasion)) s += 2;
  if (it.favorite) s += 1;
  const aest = c.req.aesthetics?.length ? c.req.aesthetics : c.profile.aesthetics;
  s += Math.min(2, it.styleTags.filter((t) => aest.includes(t)).length);
  if (it.colors.some((col) => c.profile.favoriteColors.includes(col))) s += 0.75;
  if (c.req.colors?.length && it.colors.some((col) => c.req.colors!.includes(col))) s += 2.5;
  if (it.lastWorn && daysBetween(it.lastWorn, c.today) <= 3) s -= 1.5;
  if (it.wearCount === 0 || (it.lastWorn && daysBetween(it.lastWorn, c.today) > 30)) { s += 0.5; why = 'rediscover'; }
  return { s: s + c.rand() * 0.6, why };
}

function scoreOutfit(items: Item[], c: Ctx): { score: number; reasons: string[]; stretch: boolean } {
  const parts: { pts: number; text?: string }[] = [];
  // color harmony
  const primaries = items.map((i) => i.colors[0]).filter(Boolean);
  const accents = [...new Set(primaries.filter((p) => !isNeutral(p)).map((p) => colorInfo(p)?.family ?? p))];
  if (accents.length === 0) {
    const fams = new Set(primaries.map((p) => colorInfo(p)?.family));
    parts.push(fams.size === 1 ? { pts: 2.5, text: `Tonal ${primaries[0].toLowerCase()} look` } : { pts: 1.5, text: 'Easy neutral palette' });
  } else if (accents.length === 1) {
    const accent = primaries.find((p) => !isNeutral(p))!;
    parts.push({ pts: 2, text: `${accent} accent on a neutral base` });
  } else if (accents.length === 2) parts.push({ pts: -0.5 });
  else parts.push({ pts: -2.5 });
  // pattern balance
  const patterned = items.filter((i) => i.pattern && i.pattern !== 'Solid');
  if (patterned.length === 1) parts.push({ pts: 1, text: `One patterned piece (${patterned[0].name.toLowerCase()}) keeps it balanced` });
  else if (patterned.length > 1) parts.push({ pts: -1.5 });
  // style coherence
  const tagCounts = new Map<string, number>();
  items.forEach((i) => i.styleTags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const topTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topTag && topTag[1] >= 2) parts.push({ pts: 1 + 0.25 * (topTag[1] - 2), text: `Pieces share a ${topTag[0].toLowerCase()} feel` });
  // request fit
  if (c.req.occasion) {
    const fit = items.filter((i) => i.occasions.includes(c.req.occasion!)).length;
    if (fit >= Math.ceil(items.length / 2)) parts.push({ pts: 1, text: `Mostly pieces you tagged for ${c.req.occasion.toLowerCase()}` });
  }
  if (c.req.season && items.every((i) => i.seasons.length === 0 || i.seasons.includes(c.req.season!))) parts.push({ pts: 0.5, text: `Every piece works for ${c.req.season.toLowerCase()}` });
  if (c.req.colors?.length) {
    const hit = c.req.colors.filter((col) => items.some((i) => i.colors.includes(col)));
    if (hit.length) parts.push({ pts: 1, text: `Built around ${hit.join(' & ').toLowerCase()}` });
  }
  // feedback memory
  let fb = 0;
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    fb += c.pairs.get([items[i].id, items[j].id].sort().join('|')) ?? 0;
  }
  if (fb > 0) parts.push({ pts: Math.min(3, fb), text: 'Close to looks you liked before' });
  if (fb < 0) parts.push({ pts: Math.max(-4, fb) });
  // freshness
  if (c.saved.has(keyOf(items.map((i) => i.id)))) parts.push({ pts: -1, text: 'One of your saved looks' });
  const rediscover = items.find((i) => i.wearCount === 0 || (i.lastWorn && daysBetween(i.lastWorn, c.today) > 30));
  if (rediscover) parts.push({ pts: 0.5, text: `Brings back your ${rediscover.name.toLowerCase()}` });
  // stretch
  let stretch = false;
  const wantStretch = c.req.stretch ?? c.profile.explore === 2;
  const pref = c.profile.aesthetics;
  if (pref.length) {
    const outside = [...tagCounts.keys()].filter((t) => !pref.includes(t));
    if (wantStretch && outside.length) { stretch = true; parts.push({ pts: 1.5, text: `Stretch: tries ${outside[0].toLowerCase()} beyond your usual` }); }
    else if (!wantStretch && c.profile.explore === 0 && outside.length > 1) parts.push({ pts: -1 });
  }
  const score = parts.reduce((s, p) => s + p.pts, 0);
  const reasons = parts.filter((p) => p.text && p.pts > 0).sort((a, b) => b.pts - a.pts).map((p) => p.text!);
  if (parts.some((p) => p.text === 'One of your saved looks')) reasons.push('One of your saved looks');
  return { score, reasons: reasons.slice(0, 4), stretch };
}

export function recommend(all: Item[], profile: Profile, feedback: FeedbackEntry[], outfits: Outfit[], req: RecRequest = {}): RecResult {
  const today = req.today ?? new Date().toISOString().slice(0, 10);
  const c: Ctx = { req, profile, pairs: pairFeedback(feedback), saved: new Set(outfits.map((o) => keyOf(o.itemIds))), today, rand: rng(req.seed ?? 7) };
  const anchors = all.filter((i) => req.anchorIds?.includes(i.id));
  const pool = all.filter((i) => anchors.includes(i) || (seasonOk(i, req.season) && !i.colors.some((col) => profile.avoidColors.includes(col))));
  const by = (cat: Category) => {
    const anchor = anchors.filter((a) => a.category === cat);
    if (anchor.length) return anchor;
    return pool.filter((i) => i.category === cat).map((i) => ({ i, p: itemPrior(i, c).s })).sort((a, b) => b.p - a.p).slice(0, 10).map((x) => x.i);
  };
  const tops = by('Tops'), bottoms = by('Bottoms'), dresses = by('Dresses');
  const shoes = by('Footwear'), outer = by('Outerwear'), bags = by('Bags'), acc = by('Accessories');
  const problems: string[] = [];
  const anchorCats = new Set(anchors.map((a) => a.category));
  const bases: Item[][] = [];
  const wantDressOnly = anchorCats.has('Dresses');
  const wantSeparatesOnly = anchorCats.has('Tops') || anchorCats.has('Bottoms');
  if (!wantDressOnly) for (const t of tops) for (const b of bottoms) bases.push([t, b]);
  if (!wantSeparatesOnly) for (const d of dresses) bases.push([d]);
  if (!bases.length) {
    if (!all.length) problems.push('Your closet is empty. Add a few pieces first.');
    else problems.push('To build a full look you need a top and a bottom, or a dress, that fit these filters.');
    return { suggestions: [], problems };
  }
  const cold = req.season === 'Fall' || req.season === 'Winter';
  const needOuter = anchorCats.has('Outerwear') || cold || req.occasion === 'Formal';
  const candidates: Suggestion[] = [];
  for (const base of bases) {
    let look = [...base];
    const addBest = (opts: Item[], optional: boolean) => {
      if (!opts.length) return;
      let best: Item | null = null, bestS = optional ? scoreOutfit(look, c).score + 0.2 : -Infinity;
      for (const o of opts) { const s = scoreOutfit([...look, o], c).score + itemPrior(o, c).s * 0.3; if (s > bestS) { bestS = s; best = o; } }
      if (best) look = [...look, best];
    };
    if (needOuter) addBest(outer, false); else addBest(outer, true);
    addBest(shoes, anchorCats.has('Footwear') ? false : shoes.length === 0);
    addBest(bags, !anchorCats.has('Bags'));
    addBest(acc, !anchorCats.has('Accessories'));
    if (anchors.some((a) => !look.includes(a))) continue;
    const { score, reasons, stretch } = scoreOutfit(look, c);
    const prior = look.reduce((s, i) => s + itemPrior(i, c).s, 0) / look.length;
    candidates.push({ key: keyOf(look.map((i) => i.id)), itemIds: look.map((i) => i.id), score: score + prior, reasons, stretch });
  }
  // diverse top-N
  const count = req.count ?? 3;
  const chosen: Suggestion[] = [];
  const seen = new Set<string>();
  for (const s of candidates.sort((a, b) => b.score - a.score)) {
    if (seen.has(s.key)) continue; seen.add(s.key);
    const tooSimilar = chosen.some((ch) => {
      const overlap = s.itemIds.filter((id) => ch.itemIds.includes(id) && !req.anchorIds?.includes(id)).length;
      const free = s.itemIds.length - (req.anchorIds?.length ?? 0);
      return free > 0 && overlap / free > 0.5;
    });
    if (tooSimilar) continue;
    chosen.push(s);
    if (chosen.length >= count) break;
  }
  if (chosen.length < count) for (const s of candidates) { if (chosen.length >= count) break; if (!chosen.includes(s) && !chosen.some((x) => x.key === s.key)) chosen.push(s); }
  if (!shoes.length) problems.push('Add shoes to complete these looks.');
  if (needOuter && !outer.length) problems.push(cold ? `No outerwear tagged for ${req.season?.toLowerCase()} yet.` : 'No outerwear in your closet yet.');
  return { suggestions: chosen, problems };
}

/** Wardrobe gaps: categories or neutrals that would unlock more combinations. Real data only. */
export function wardrobeGaps(items: Item[]): string[] {
  const n = (c: Category) => items.filter((i) => i.category === c).length;
  const gaps: string[] = [];
  if (items.length === 0) return gaps;
  if (n('Tops') && !n('Bottoms') && !n('Dresses')) gaps.push('A bottom would turn your tops into full outfits.');
  if (n('Bottoms') && !n('Tops')) gaps.push('A top would turn your bottoms into full outfits.');
  if (!n('Footwear')) gaps.push('Add at least one pair of shoes to finish looks.');
  if (!n('Outerwear')) gaps.push('One outer layer (jacket, coat or blazer) adds fall and winter looks.');
  const neutralBottoms = items.filter((i) => i.category === 'Bottoms' && isNeutral(i.colors[0])).length;
  if (n('Bottoms') >= 1 && neutralBottoms === 0) gaps.push('A neutral bottom (black, navy, denim or beige) pairs with almost every top.');
  const tops = n('Tops'), bottoms = n('Bottoms');
  if (tops >= 4 && bottoms === 1) gaps.push(`You have ${tops} tops but only 1 bottom — a second bottom doubles your combinations.`);
  return gaps;
}

export const COLOR_ORDER = COLORS.map((c) => c.name);
