/** Turns a plain-English styling request into recommender inputs. No AI calls; keyword rules only. */
import { AESTHETICS, COLORS, SUBCATEGORIES } from './taxonomy';
import type { Category, Item, Occasion, Season } from './types';
import type { RecRequest } from './recommend';

const OCC: [RegExp, Occasion][] = [
  [/\b(class|school|campus|lecture|study)\b/i, 'Class'], [/\b(work|office|interview|internship|meeting)\b/i, 'Work'],
  [/\b(date|dinner|party|night|evening|club|bar)\b/i, 'Evening'], [/\b(weekend|brunch|errand)\b/i, 'Weekend'],
  [/\b(gym|run|sport|active|workout|hike)\b/i, 'Active'], [/\b(formal|wedding|gala|ceremony)\b/i, 'Formal'],
  [/\b(casual|everyday|daily)\b/i, 'Everyday'],
];
const SEA: [RegExp, Season][] = [[/\b(winter|cold|snow|freezing)\b/i, 'Winter'], [/\b(fall|autumn)\b/i, 'Fall'], [/\b(spring)\b/i, 'Spring'], [/\b(summer|hot|warm|beach)\b/i, 'Summer']];
const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, a: 1 };
const CAT_WORDS: [RegExp, Category][] = [
  [/\b(top|tee|t-shirt|shirt|blouse|sweater|knit|hoodie)s?\b/i, 'Tops'], [/\b(jeans|trousers|pants|skirt|shorts|bottoms?)\b/i, 'Bottoms'],
  [/\b(jacket|coat|blazer|cardigan|outerwear)s?\b/i, 'Outerwear'], [/\b(dress|jumpsuit)(es)?\b/i, 'Dresses'],
  [/\b(boots?|sneakers?|shoes?|loafers?|heels?|sandals?)\b/i, 'Footwear'], [/\b(bag|tote|backpack|purse)s?\b/i, 'Bags'],
  [/\b(scarf|hat|cap|belt|jewelry|necklace)s?\b/i, 'Accessories'],
];

export interface Parsed { req: RecRequest; understood: string[]; anchorNote?: string }

export function parsePrompt(text: string, items: Item[]): Parsed {
  const t = text.trim();
  const req: RecRequest = {};
  const understood: string[] = [];
  const occ = OCC.find(([re]) => re.test(t)); if (occ) { req.occasion = occ[1]; understood.push(`occasion: ${occ[1].toLowerCase()}`); }
  const sea = SEA.find(([re]) => re.test(t)); if (sea) { req.season = sea[1]; understood.push(`season: ${sea[1].toLowerCase()}`); }
  const cols = COLORS.filter((c) => new RegExp(`\\b${c.name}\\b`, 'i').test(t)).map((c) => c.name);
  if (cols.length) { req.colors = cols; understood.push(`color: ${cols.join(', ').toLowerCase()}`); }
  const aes = AESTHETICS.filter((a) => new RegExp(`\\b${a}\\b`, 'i').test(t));
  if (aes.length) { req.aesthetics = aes; understood.push(`style: ${aes.join(', ').toLowerCase()}`); }
  const num = t.match(/\b(\d|one|two|three|four|five)\s+(different\s+)?(looks?|outfits?|ways|options)/i);
  if (num) req.count = Math.min(6, Number(num[1]) || NUM[num[1].toLowerCase()] || 3);
  if (/\b(new|surprise|stretch|experiment|bolder)\b/i.test(t)) { req.stretch = true; understood.push('open to something new'); }

  // anchors: "with these boots", "this jacket", or an item name typed in
  let anchorNote: string | undefined;
  const named = items.filter((i) => i.name.length > 3 && t.toLowerCase().includes(i.name.toLowerCase()));
  if (named.length) { req.anchorIds = named.map((i) => i.id); anchorNote = `Using your ${named.map((i) => i.name.toLowerCase()).join(' + ')}`; }
  else if (/\b(with|around|style|wear)\b.*\b(this|these|my)\b/i.test(t) || /\bwith (the|my|this|these)\b/i.test(t)) {
    for (const [re, cat] of CAT_WORDS) {
      const m = t.match(re); if (!m) continue;
      const word = m[0].toLowerCase().replace(/s$/, '');
      const candidates = items.filter((i) => i.category === cat);
      const exact = candidates.filter((i) => i.subcategory.toLowerCase().includes(word) || i.name.toLowerCase().includes(word));
      const pick = (exact.length ? exact : candidates).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.wearCount - a.wearCount)[0];
      if (pick) { req.anchorIds = [pick.id]; anchorNote = `Using your ${pick.name.toLowerCase()}${exact.length > 1 ? ` (you have ${exact.length} — pick another below)` : ''}`; }
      break;
    }
  }
  if (anchorNote) understood.push(anchorNote.toLowerCase());
  return { req, understood, anchorNote };
}

export const SUGGESTED_PROMPTS = [
  'Create a casual outfit for class',
  'Give me a minimal black outfit',
  'What can I wear with my boots?',
  'Build a winter outfit',
  'Three different looks with my jacket',
  'Something new for the weekend',
];

export const ALL_SUBS = Object.values(SUBCATEGORIES).flat();
