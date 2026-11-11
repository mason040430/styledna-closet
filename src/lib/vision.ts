/**
 * On-device clothing photo analysis. No network calls, no paid AI.
 * - Background: if the photo border is a fairly uniform color, flood-fill it away (keeps original too).
 * - Colors: k-means on garment pixels, mapped to named fashion colors.
 * - Pattern: solid vs patterned/striped from color spread and edge direction.
 * - Category: keyword in the filename (strong) or silhouette shape (weak guess).
 * Every result is a suggestion that the user confirms or edits.
 */
import { COLORS, SUBCATEGORIES } from './taxonomy';
import type { Category, Season } from './types';

export interface Analysis {
  colors: string[];
  pattern: string;
  category?: Category;
  subcategory?: string;
  material?: string;
  seasons: Season[];
  styleTags: string[];
  name: string;
  backgroundRemoved: boolean;
  confidence: { category: 'filename' | 'shape' | 'none'; colors: 'good' | 'rough' };
  notes: string[];
}

type RGB = [number, number, number];

export function colorDistance(a: RGB, b: RGB) {
  // "redmean" weighted Euclidean — cheap and closer to perception than plain RGB
  const rm = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

const hexToRgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PALETTE = COLORS.filter((c) => c.family !== 'metal').map((c) => ({ name: c.name, rgb: hexToRgb(c.hex) }));

export function nameColor(rgb: RGB): string {
  let best = PALETTE[0], bd = Infinity;
  for (const p of PALETTE) { const d = colorDistance(rgb, p.rgb); if (d < bd) { bd = d; best = p; } }
  return best.name;
}

/** Background mask by flood fill from the borders. Returns null when the background is too busy. */
export function backgroundMask(px: Uint8ClampedArray, w: number, h: number): Uint8Array | null {
  const at = (x: number, y: number): RGB => { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2]]; };
  const border: RGB[] = [];
  for (let x = 0; x < w; x++) { border.push(at(x, 0), at(x, h - 1)); }
  for (let y = 0; y < h; y++) { border.push(at(0, y), at(w - 1, y)); }
  const med: RGB = [0, 1, 2].map((k) => border.map((c) => c[k]).sort((a, b) => a - b)[border.length >> 1]) as RGB;
  const dists = border.map((c) => colorDistance(c, med));
  const close = dists.filter((d) => d < 60).length / dists.length;
  if (close < 0.8) return null; // busy background → don't guess
  const spread = Math.sqrt(dists.reduce((s, d) => s + d * d, 0) / dists.length);
  const tol = Math.min(90, Math.max(40, spread * 2.5));
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  const tryPush = (x: number, y: number) => {
    const idx = y * w + x;
    if (bg[idx]) return;
    if (colorDistance(at(x, y), med) <= tol) { bg[idx] = 1; stack.push(idx); }
  };
  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
  for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y); }
  while (stack.length) {
    const idx = stack.pop()!; const x = idx % w, y = (idx / w) | 0;
    if (x > 0) tryPush(x - 1, y); if (x < w - 1) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1); if (y < h - 1) tryPush(x, y + 1);
  }
  const fg = new Uint8Array(w * h);
  let count = 0;
  for (let i = 0; i < fg.length; i++) { fg[i] = bg[i] ? 0 : 1; count += fg[i]; }
  const share = count / fg.length;
  if (share < 0.04 || share > 0.96) return null;
  return fg;
}

function kmeans(points: RGB[], k: number, iters = 10) {
  if (!points.length) return [];
  const sorted = [...points].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centers: RGB[] = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]] as RGB);
  let counts = new Array(k).fill(0);
  for (let it = 0; it < iters; it++) {
    const sums = centers.map(() => [0, 0, 0]); counts = new Array(k).fill(0);
    for (const p of points) {
      let bi = 0, bd = Infinity;
      for (let c = 0; c < k; c++) { const d = colorDistance(p, centers[c]); if (d < bd) { bd = d; bi = c; } }
      sums[bi][0] += p[0]; sums[bi][1] += p[1]; sums[bi][2] += p[2]; counts[bi]++;
    }
    centers = centers.map((c, i) => (counts[i] ? (sums[i].map((s) => s / counts[i]) as RGB) : c));
  }
  return centers.map((c, i) => ({ rgb: c, share: counts[i] / points.length }));
}

const KEYWORDS: { re: RegExp; category: Category; sub: string; material?: string }[] = [
  { re: /boot/i, category: 'Footwear', sub: 'Boots' }, { re: /sneaker|trainer|shoe/i, category: 'Footwear', sub: 'Sneakers' },
  { re: /loafer|flat/i, category: 'Footwear', sub: 'Loafers / flats' }, { re: /heel|pump/i, category: 'Footwear', sub: 'Heels' },
  { re: /sandal|slide/i, category: 'Footwear', sub: 'Sandals' }, { re: /jean|denim/i, category: 'Bottoms', sub: 'Jeans', material: 'Denim' },
  { re: /trouser|pant|chino|slack/i, category: 'Bottoms', sub: 'Trousers' }, { re: /short/i, category: 'Bottoms', sub: 'Shorts' },
  { re: /skirt/i, category: 'Bottoms', sub: 'Skirt' }, { re: /jogger|sweatpant/i, category: 'Bottoms', sub: 'Joggers' },
  { re: /dress/i, category: 'Dresses', sub: 'Dress' }, { re: /jumpsuit|romper/i, category: 'Dresses', sub: 'Jumpsuit' },
  { re: /coat|parka|trench/i, category: 'Outerwear', sub: 'Coat' }, { re: /blazer/i, category: 'Outerwear', sub: 'Blazer' },
  { re: /cardigan/i, category: 'Outerwear', sub: 'Cardigan' }, { re: /jacket|bomber/i, category: 'Outerwear', sub: 'Jacket' },
  { re: /hoodie|sweatshirt/i, category: 'Tops', sub: 'Hoodie / sweatshirt' }, { re: /sweater|knit|jumper/i, category: 'Tops', sub: 'Knit / sweater', material: 'Knit' },
  { re: /shirt|button/i, category: 'Tops', sub: 'Shirt' }, { re: /blouse/i, category: 'Tops', sub: 'Blouse' },
  { re: /tee|t-shirt|tshirt/i, category: 'Tops', sub: 'T-shirt' }, { re: /tank|cami/i, category: 'Tops', sub: 'Tank / cami' },
  { re: /tote/i, category: 'Bags', sub: 'Tote' }, { re: /backpack/i, category: 'Bags', sub: 'Backpack' },
  { re: /bag|purse|clutch/i, category: 'Bags', sub: 'Shoulder bag' }, { re: /scarf/i, category: 'Accessories', sub: 'Scarf' },
  { re: /hat|cap|beanie/i, category: 'Accessories', sub: 'Hat / cap' }, { re: /belt/i, category: 'Accessories', sub: 'Belt' },
  { re: /necklace|ring|earring|bracelet|jewel/i, category: 'Accessories', sub: 'Jewelry' },
];
const MATERIAL_WORDS: [RegExp, string][] = [[/leather/i, 'Leather look'], [/wool|cashmere/i, 'Wool look'], [/linen/i, 'Linen look'], [/silk|satin/i, 'Silk / satin look'], [/denim/i, 'Denim'], [/knit/i, 'Knit']];

export function guessFromFilename(filename: string) {
  const base = filename.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ');
  if (/^(img|dsc|pxl|photo|image)\s?\d/i.test(base)) return {};
  const hit = KEYWORDS.find((k) => k.re.test(base));
  const mat = MATERIAL_WORDS.find(([re]) => re.test(base))?.[1] ?? hit?.material;
  return { category: hit?.category, subcategory: hit?.sub, material: mat };
}

export function guessFromShape(aspect: number, fgShare: number): { category?: Category; subcategory?: string } {
  if (aspect < 0.7 && fgShare < 0.45) return { category: 'Footwear', subcategory: 'Other shoes' };
  if (aspect > 1.7) return { category: 'Bottoms', subcategory: 'Trousers' };
  if (aspect >= 0.8 && aspect <= 1.5) return { category: 'Tops', subcategory: 'Other top' };
  return {};
}

export function suggestSeasons(sub?: string): Season[] {
  if (!sub) return [];
  if (/Coat|Boots|Knit/.test(sub)) return ['Fall', 'Winter'];
  if (/Shorts|Sandals|Tank/.test(sub)) return ['Spring', 'Summer'];
  return [];
}

export function suggestStyle(sub: string | undefined, colors: string[], pattern: string): string[] {
  const tags = new Set<string>();
  const neutral = colors.every((c) => COLORS.find((x) => x.name === c)?.neutral);
  if (neutral && pattern === 'Solid') tags.add('Minimal');
  if (pattern !== 'Solid') tags.add('Bold');
  if (sub && /Hoodie|Sneakers|Joggers|Backpack|Hat/.test(sub)) tags.add('Street');
  if (sub && /Blazer|Trousers|Loafers|Shirt|Coat/.test(sub)) tags.add('Classic');
  if (sub && /Blouse|Dress|Skirt/.test(sub)) tags.add('Romantic');
  return [...tags].slice(0, 3);
}

/** Pure analysis over RGBA pixels (testable without a browser). */
export function analyzePixels(px: Uint8ClampedArray, w: number, h: number, filename = '') {
  const mask = backgroundMask(px, w, h);
  const points: RGB[] = [];
  let minX = w, minY = h, maxX = 0, maxY = 0, fgCount = 0;
  const inFg = (x: number, y: number) =>
    mask ? mask[y * w + x] === 1 : x > w * 0.2 && x < w * 0.8 && y > h * 0.15 && y < h * 0.85;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inFg(x, y)) continue;
    fgCount++;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    const i = (y * w + x) * 4;
    if (px[i + 3] < 128) continue;
    if ((x + y) % 2 === 0) points.push([px[i], px[i + 1], px[i + 2]]);
  }
  const clusters = kmeans(points.length > 5000 ? points.filter((_, i) => i % Math.ceil(points.length / 5000) === 0) : points, 4);
  const named = new Map<string, number>();
  for (const c of clusters) named.set(nameColor(c.rgb), (named.get(nameColor(c.rgb)) ?? 0) + c.share);
  const ranked = [...named.entries()].sort((a, b) => b[1] - a[1]);
  const colors = [ranked[0]?.[0] ?? 'Grey'];
  if (ranked[1] && ranked[1][1] >= 0.2) colors.push(ranked[1][0]);

  // edges: horizontal vs vertical color changes inside the garment
  let hEdges = 0, vEdges = 0, pairs = 0;
  for (let y = 1; y < h; y++) for (let x = 1; x < w; x++) {
    if (!inFg(x, y) || !inFg(x - 1, y) || !inFg(x, y - 1)) continue;
    const i = (y * w + x) * 4, l = i - 4, u = i - w * 4;
    const c: RGB = [px[i], px[i + 1], px[i + 2]];
    pairs++;
    if (colorDistance(c, [px[l], px[l + 1], px[l + 2]]) > 70) hEdges++;
    if (colorDistance(c, [px[u], px[u + 1], px[u + 2]]) > 70) vEdges++;
  }
  const edgeRate = pairs ? (hEdges + vEdges) / (2 * pairs) : 0;
  const topShare = ranked[0]?.[1] ?? 1;
  let pattern = 'Solid';
  if (edgeRate > 0.06 || topShare < 0.55) {
    const ratio = (Math.max(hEdges, vEdges) + 1) / (Math.min(hEdges, vEdges) + 1);
    pattern = ratio > 2.2 && edgeRate > 0.05 ? 'Striped' : 'Other pattern';
  }

  const fgShare = fgCount / (w * h);
  const aspect = maxX > minX ? (maxY - minY + 1) / (maxX - minX + 1) : 1;
  const byName = guessFromFilename(filename);
  const byShape = mask ? guessFromShape(aspect, fgShare) : {};
  const category = byName.category ?? byShape.category;
  const subcategory = byName.subcategory ?? byShape.subcategory ?? (category ? SUBCATEGORIES[category].at(-1) : undefined);
  const seasons = suggestSeasons(subcategory);
  const styleTags = suggestStyle(subcategory, colors, pattern);
  const notes: string[] = [];
  if (!mask) notes.push('Busy background — colors were read from the center of the photo.');
  if (!byName.category) notes.push(byShape.category ? 'Category is a guess from the shape. Please check it.' : 'Pick a category — we could not tell from the photo.');
  const name = `${colors[0]} ${(subcategory ?? 'piece').replace(/^Other /, '').split(' / ')[0].toLowerCase()}`;
  const analysis: Analysis = {
    colors, pattern, category, subcategory, material: byName.material, seasons, styleTags, name,
    backgroundRemoved: Boolean(mask),
    confidence: { category: byName.category ? 'filename' : byShape.category ? 'shape' : 'none', colors: mask ? 'good' : 'rough' },
    notes,
  };
  return { analysis, mask, bbox: { minX, minY, maxX, maxY } };
}

// ---------- browser helpers ----------
export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/avif'];
export const MAX_BYTES = 20 * 1024 * 1024;

export function validateFile(file: File): string | null {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) return `“${file.name}” is not an image.`;
  if (file.size > MAX_BYTES) return `“${file.name}” is larger than 20 MB.`;
  if (file.size === 0) return `“${file.name}” is empty.`;
  return null;
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  try { return await createImageBitmap(file); } catch {
    return await new Promise((resolve, reject) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This photo format could not be opened in this browser. Try a JPG or PNG.')); };
      img.src = url;
    });
  }
}

const toBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not encode image'))), type, q));

export interface Prepared { original: Blob; cutout?: Blob; analysis: Analysis }

export async function prepareImage(file: File): Promise<Prepared> {
  const src = await decode(file);
  const sw = 'naturalWidth' in src ? src.naturalWidth : src.width;
  const sh = 'naturalHeight' in src ? src.naturalHeight : src.height;
  if (!sw || !sh) throw new Error('This image appears to be empty.');
  // 1) compressed original, max 1400px
  const scale = Math.min(1, 1400 / Math.max(sw, sh));
  const W = Math.round(sw * scale), H = Math.round(sh * scale);
  const full = document.createElement('canvas'); full.width = W; full.height = H;
  const fctx = full.getContext('2d')!; fctx.drawImage(src, 0, 0, W, H);
  const original = await toBlob(full, 'image/jpeg', 0.86);
  // 2) analysis at small size
  const s2 = Math.min(1, 160 / Math.max(W, H));
  const w = Math.max(8, Math.round(W * s2)), h = Math.max(8, Math.round(H * s2));
  const small = document.createElement('canvas'); small.width = w; small.height = h;
  const sctx = small.getContext('2d', { willReadFrequently: true })!; sctx.drawImage(full, 0, 0, w, h);
  const { analysis, mask, bbox } = analyzePixels(sctx.getImageData(0, 0, w, h).data, w, h, file.name);
  // 3) optional cutout (never blocks saving)
  let cutout: Blob | undefined;
  if (mask) {
    try {
      const mc = document.createElement('canvas'); mc.width = w; mc.height = h;
      const mctx = mc.getContext('2d')!; const md = mctx.createImageData(w, h);
      for (let i = 0; i < mask.length; i++) { md.data[i * 4 + 3] = mask[i] ? 255 : 0; }
      mctx.putImageData(md, 0, 0);
      const out = document.createElement('canvas'); out.width = W; out.height = H;
      const octx = out.getContext('2d')!; octx.drawImage(full, 0, 0);
      octx.globalCompositeOperation = 'destination-in'; octx.imageSmoothingEnabled = true; octx.drawImage(mc, 0, 0, W, H);
      const pad = 0.04;
      const x0 = Math.max(0, Math.floor((bbox.minX / w - pad) * W)), y0 = Math.max(0, Math.floor((bbox.minY / h - pad) * H));
      const x1 = Math.min(W, Math.ceil(((bbox.maxX + 1) / w + pad) * W)), y1 = Math.min(H, Math.ceil(((bbox.maxY + 1) / h + pad) * H));
      const crop = document.createElement('canvas'); crop.width = x1 - x0; crop.height = y1 - y0;
      crop.getContext('2d')!.drawImage(out, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0);
      cutout = await toBlob(crop, 'image/png');
    } catch { cutout = undefined; }
  }
  if ('close' in src) src.close();
  return { original, cutout, analysis };
}
