import { describe, expect, it } from 'vitest';
import { buildDemo } from './demo';
import { recommend, isCompleteOutfit, wardrobeGaps } from './recommend';
import { parsePrompt } from './prompt';
import { parseQuizLink, suggestFromQuiz } from './quiz';
import { analyzePixels, nameColor } from './vision';
import { computeInsights } from './insights';
import { emptyProfile, type Item } from './types';

const demo = buildDemo();
const items = demo.items;
const ids = new Set(items.map((i) => i.id));

describe('recommend', () => {
  it('only uses items that exist and returns complete looks with reasons', () => {
    const r = recommend(items, emptyProfile, [], [], { count: 3, season: 'Fall' });
    expect(r.suggestions.length).toBe(3);
    for (const s of r.suggestions) {
      s.itemIds.forEach((id) => expect(ids.has(id)).toBe(true));
      expect(isCompleteOutfit(s.itemIds.map((id) => items.find((i) => i.id === id)!))).toBe(true);
      expect(s.reasons.length).toBeGreaterThan(0);
    }
  });
  it('respects season filters', () => {
    const r = recommend(items, emptyProfile, [], [], { count: 3, season: 'Summer' });
    for (const s of r.suggestions) for (const id of s.itemIds) {
      const it = items.find((i) => i.id === id)!;
      expect(it.seasons.length === 0 || it.seasons.includes('Summer')).toBe(true);
    }
  });
  it('always includes anchor items', () => {
    const r = recommend(items, emptyProfile, [], [], { count: 3, anchorIds: ['demo-boots'] });
    expect(r.suggestions.length).toBeGreaterThan(0);
    r.suggestions.forEach((s) => expect(s.itemIds).toContain('demo-boots'));
  });
  it('gives three distinct looks with one jacket', () => {
    const r = recommend(items, emptyProfile, [], [], { count: 3, anchorIds: ['demo-jacket'] });
    expect(new Set(r.suggestions.map((s) => s.key)).size).toBe(r.suggestions.length);
    r.suggestions.forEach((s) => expect(s.itemIds).toContain('demo-jacket'));
  });
  it('down-votes push a combination down', () => {
    const base = recommend(items, emptyProfile, [], [], { count: 1, seed: 3 }).suggestions[0];
    const fb = Array.from({ length: 4 }, (_, n) => ({ id: String(n), itemIds: base.itemIds, verdict: 'down' as const, at: '' }));
    const after = recommend(items, emptyProfile, fb, [], { count: 1, seed: 3 }).suggestions[0];
    expect(after.key).not.toBe(base.key);
  });
  it('honours avoided colors except for anchors', () => {
    const r = recommend(items, { ...emptyProfile, avoidColors: ['Black'] }, [], [], { count: 3 });
    r.suggestions.forEach((s) => s.itemIds.forEach((id) => expect(items.find((i) => i.id === id)!.colors).not.toContain('Black')));
  });
  it('explains what is missing instead of inventing items', () => {
    const tops = items.filter((i) => i.category === 'Tops');
    const r = recommend(tops, emptyProfile, [], [], {});
    expect(r.suggestions).toHaveLength(0);
    expect(r.problems[0]).toMatch(/top and a bottom/);
    expect(recommend([], emptyProfile, [], [], {}).problems[0]).toMatch(/empty/);
  });
});

describe('prompt parsing', () => {
  it('reads occasion, color, season, count and anchors', () => {
    expect(parsePrompt('Create a casual outfit for class', items).req.occasion).toBe('Class');
    expect(parsePrompt('Give me a minimal black outfit', items).req).toMatchObject({ colors: ['Black'], aesthetics: ['Minimal'] });
    expect(parsePrompt('Build a winter outfit', items).req.season).toBe('Winter');
    const boots = parsePrompt('What can I wear with my boots?', items);
    expect(boots.req.anchorIds).toEqual(['demo-boots']);
    const three = parsePrompt('Create three different looks with this jacket', items);
    expect(three.req.count).toBe(3);
    expect(three.req.anchorIds?.[0]).toMatch(/jacket/);
  });
});

describe('StyleDNA quiz link', () => {
  it('parses a real result link and suggests editable preferences', () => {
    const q = parseQuizLink('https://style-dna-zeta.vercel.app/result?type=visionary&e=75&x=83&i=75&d=83&s=75');
    expect('error' in q).toBe(false);
    if ('error' in q) return;
    expect(q.type).toBe('visionary');
    expect(q.scores.experimentation).toBe(83);
    const sug = suggestFromQuiz(q);
    expect(sug.explore).toBe(2);
    expect(sug.aesthetics.length).toBeGreaterThan(0);
  });
  it('rejects links without results', () => {
    expect('error' in parseQuizLink('https://style-dna-zeta.vercel.app/')).toBe(true);
    expect('error' in parseQuizLink('not a link')).toBe(true);
    expect('error' in parseQuizLink('https://example.com/result?type=x&e=1&x=1&i=1&d=1&s=1')).toBe(true);
  });
});

describe('on-device photo analysis', () => {
  function synth(w: number, h: number, bg: number[], fg: number[], box: [number, number, number, number], stripe?: number[]) {
    const px = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; const inside = x >= box[0] && x < box[2] && y >= box[1] && y < box[3];
      const c = inside ? (stripe && Math.floor(y / 4) % 2 ? stripe : fg) : bg;
      px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
    }
    return px;
  }
  it('removes a plain background and names the garment color', () => {
    const px = synth(100, 120, [240, 238, 232], [30, 30, 32], [25, 20, 75, 110]);
    const { analysis, mask } = analyzePixels(px, 100, 120, 'IMG_1234.jpg');
    expect(mask).not.toBeNull();
    expect(analysis.backgroundRemoved).toBe(true);
    expect(analysis.colors[0]).toBe('Black');
    expect(analysis.pattern).toBe('Solid');
  });
  it('uses filename keywords for category and material', () => {
    const px = synth(100, 120, [250, 250, 250], [110, 75, 50], [30, 30, 70, 100]);
    const { analysis } = analyzePixels(px, 100, 120, 'brown-leather-boots.jpg');
    expect(analysis.category).toBe('Footwear');
    expect(analysis.subcategory).toBe('Boots');
    expect(analysis.material).toBe('Leather look');
    expect(analysis.confidence.category).toBe('filename');
  });
  it('detects stripes', () => {
    const px = synth(100, 120, [252, 252, 252], [235, 225, 205], [20, 20, 80, 100], [25, 35, 70]);
    const { analysis } = analyzePixels(px, 100, 120, 'top.jpg');
    expect(analysis.pattern).toBe('Striped');
  });
  it('falls back gracefully on busy backgrounds', () => {
    const w = 60, h = 60; const px = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) { px[i * 4] = (i * 37) % 255; px[i * 4 + 1] = (i * 91) % 255; px[i * 4 + 2] = (i * 13) % 255; px[i * 4 + 3] = 255; }
    const { analysis, mask } = analyzePixels(px, w, h, 'IMG_9.jpg');
    expect(mask).toBeNull();
    expect(analysis.backgroundRemoved).toBe(false);
    expect(analysis.colors.length).toBeGreaterThan(0);
  });
  it('maps reference colors to names', () => {
    expect(nameColor([28, 44, 69])).toBe('Navy');
    expect(nameColor([179, 50, 43])).toBe('Red');
  });
});

describe('insights and gaps', () => {
  it('only reports real data', () => {
    const fresh: Item[] = items.map((i) => ({ ...i, wearCount: 0, lastWorn: undefined }));
    const ins = computeInsights(fresh, [], []);
    expect(ins.hasWearData).toBe(false);
    expect(ins.costPerWear).toHaveLength(0);
    expect(ins.total).toBe(items.length);
  });
  it('suggests gaps from categories only', () => {
    const onlyTops = items.filter((i) => i.category === 'Tops');
    expect(wardrobeGaps(onlyTops).join(' ')).toMatch(/bottom/);
    expect(wardrobeGaps([])).toHaveLength(0);
  });
});

describe('prompt regressions', () => {
  it('"different looks" does not switch on stretch mode', () => {
    expect(parsePrompt('Three different looks with my jacket', items).req.stretch).toBeUndefined();
    expect(parsePrompt('Something new for the weekend', items).req.stretch).toBe(true);
  });
});
