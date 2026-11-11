/** Fictional demo closet. Flat vector illustrations generated here — not photos, not real customer data. */
import { colorHex } from './taxonomy';
import type { Category, Item, Occasion, Outfit, Plan, Season } from './types';

type Shape = 'tee' | 'shirt' | 'knit' | 'hoodie' | 'jacket' | 'coat' | 'blazer' | 'jeans' | 'trousers' | 'skirt' | 'dress' | 'boots' | 'sneakers' | 'loafers' | 'tote' | 'crossbody' | 'scarf' | 'cap' | 'belt';

const PATHS: Record<Shape, string> = {
  tee: 'M60 40 L100 28 Q120 44 140 28 L180 40 L210 90 L178 104 L170 86 L170 210 L70 210 L70 86 L62 104 L30 90 Z',
  shirt: 'M62 38 L100 26 L120 46 L140 26 L178 38 L206 150 L182 156 L170 92 L170 214 L70 214 L70 92 L58 156 L34 150 Z',
  knit: 'M58 42 L98 28 Q120 40 142 28 L182 42 L212 168 L188 174 L172 100 L172 212 L68 212 L68 100 L52 174 L28 168 Z',
  hoodie: 'M58 52 L94 34 Q100 6 120 6 Q140 6 146 34 L182 52 L212 170 L188 176 L172 104 L172 214 L68 214 L68 104 L52 176 L28 170 Z',
  jacket: 'M56 40 L100 26 L120 60 L140 26 L184 40 L214 176 L188 182 L174 104 L174 210 L66 210 L66 104 L52 182 L26 176 Z',
  coat: 'M60 30 L100 18 L120 56 L140 18 L180 30 L210 196 L186 200 L174 110 L176 232 L64 232 L66 110 L54 200 L30 196 Z',
  blazer: 'M60 36 L100 24 L120 90 L140 24 L180 36 L208 170 L184 176 L172 102 L172 206 L68 206 L68 102 L56 176 L32 170 Z',
  jeans: 'M74 20 L166 20 L176 230 L132 230 L120 92 L108 230 L64 230 Z',
  trousers: 'M76 20 L164 20 L180 232 L134 232 L120 86 L106 232 L60 232 Z',
  skirt: 'M84 40 L156 40 L190 196 L50 196 Z',
  dress: 'M92 20 L106 20 Q120 34 134 20 L148 20 L156 84 L196 226 L44 226 L84 84 Z',
  boots: 'M70 40 L110 40 L112 160 L176 184 L180 214 L66 214 Z',
  sneakers: 'M34 150 Q60 118 98 114 L140 128 Q190 136 206 164 L206 188 L34 188 Z',
  loafers: 'M40 160 Q70 128 120 128 Q180 132 200 162 L200 184 L40 184 Z',
  tote: 'M56 92 L184 92 L196 214 L44 214 Z M86 92 Q86 40 120 40 Q154 40 154 92',
  crossbody: 'M70 120 L170 120 Q180 120 180 132 L180 196 Q180 206 170 206 L70 206 Q60 206 60 196 L60 132 Q60 120 70 120 Z M70 120 L120 30 L170 120',
  scarf: 'M70 30 L170 30 L170 70 L140 70 L150 220 L116 220 L106 70 L70 70 Z',
  cap: 'M54 140 Q60 70 120 66 Q180 70 186 140 Z M150 140 L226 150 L218 162 L150 156 Z',
  belt: 'M20 116 L220 116 L220 140 L20 140 Z M100 110 L140 110 L140 146 L100 146 Z',
};

function svg(shape: Shape, color: string, accent?: string, stripes = false) {
  const fill = colorHex(color), acc = accent ? colorHex(accent) : '#00000022';
  const stroke = '#14141433';
  const pattern = stripes ? `<defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${fill}"/><rect y="12" width="20" height="8" fill="${acc}"/></pattern></defs>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 250">${pattern}<rect width="240" height="250" fill="#00000000"/><path d="${PATHS[shape]}" fill="${stripes ? 'url(#p)' : fill}" stroke="${stroke}" stroke-width="2" fill-rule="evenodd"/>${!stripes && accent ? `<path d="${PATHS[shape]}" fill="none" stroke="${acc}" stroke-width="6" opacity=".55"/>` : ''}</svg>`;
}

interface Seed {
  key: string; name: string; category: Category; sub: string; shape: Shape; colors: string[]; pattern?: string; material: string;
  tags: string[]; seasons?: Season[]; occ: Occasion[]; fav?: boolean; wear?: number; price?: number; brand?: string;
}

const SEEDS: Seed[] = [
  { key: 'tee-white', name: 'White everyday tee', category: 'Tops', sub: 'T-shirt', shape: 'tee', colors: ['White'], material: 'Cotton look', tags: ['Minimal', 'Relaxed'], occ: ['Everyday', 'Class', 'Weekend'], fav: true, wear: 14, price: 18 },
  { key: 'tee-black', name: 'Black boxy tee', category: 'Tops', sub: 'T-shirt', shape: 'tee', colors: ['Black'], material: 'Cotton look', tags: ['Minimal', 'Street'], occ: ['Everyday', 'Class', 'Evening'], wear: 9, price: 22 },
  { key: 'shirt-blue', name: 'Light blue oxford shirt', category: 'Tops', sub: 'Shirt', shape: 'shirt', colors: ['Light blue'], material: 'Cotton look', tags: ['Classic', 'Preppy'], occ: ['Work', 'Class'], wear: 6, price: 45 },
  { key: 'knit-cream', name: 'Cream cable knit', category: 'Tops', sub: 'Knit / sweater', shape: 'knit', colors: ['Cream'], pattern: 'Textured', material: 'Knit', tags: ['Classic', 'Relaxed'], seasons: ['Fall', 'Winter'], occ: ['Everyday', 'Weekend', 'Class'], fav: true, wear: 7, price: 60 },
  { key: 'stripe', name: 'Navy striped top', category: 'Tops', sub: 'T-shirt', shape: 'tee', colors: ['White', 'Navy'], pattern: 'Striped', material: 'Cotton look', tags: ['Classic', 'Preppy'], occ: ['Everyday', 'Weekend'], wear: 0, price: 35 },
  { key: 'hoodie', name: 'Grey campus hoodie', category: 'Tops', sub: 'Hoodie / sweatshirt', shape: 'hoodie', colors: ['Grey'], material: 'Cotton look', tags: ['Street', 'Sporty'], seasons: ['Fall', 'Winter', 'Spring'], occ: ['Class', 'Active', 'Weekend'], wear: 11 },
  { key: 'jeans', name: 'Straight-leg jeans', category: 'Bottoms', sub: 'Jeans', shape: 'jeans', colors: ['Denim blue'], pattern: 'Denim wash', material: 'Denim', tags: ['Classic', 'Street', 'Relaxed'], occ: ['Everyday', 'Class', 'Weekend'], fav: true, wear: 20, price: 70 },
  { key: 'trousers', name: 'Black tailored trousers', category: 'Bottoms', sub: 'Trousers', shape: 'trousers', colors: ['Black'], material: 'Wool look', tags: ['Tailored', 'Minimal', 'Classic'], occ: ['Work', 'Evening', 'Class'], wear: 8, price: 80 },
  { key: 'skirt', name: 'Camel midi skirt', category: 'Bottoms', sub: 'Skirt', shape: 'skirt', colors: ['Camel'], material: 'Unsure', tags: ['Romantic', 'Classic'], seasons: ['Spring', 'Fall'], occ: ['Everyday', 'Evening'], wear: 2, price: 55 },
  { key: 'dress', name: 'Burgundy slip dress', category: 'Dresses', sub: 'Dress', shape: 'dress', colors: ['Burgundy'], material: 'Silk / satin look', tags: ['Romantic', 'Bold'], seasons: ['Spring', 'Summer', 'Fall'], occ: ['Evening', 'Formal'], wear: 1, price: 90 },
  { key: 'jacket', name: 'Olive utility jacket', category: 'Outerwear', sub: 'Jacket', shape: 'jacket', colors: ['Olive'], material: 'Cotton look', tags: ['Street', 'Relaxed'], seasons: ['Spring', 'Fall'], occ: ['Everyday', 'Class', 'Weekend'], fav: true, wear: 10, price: 95 },
  { key: 'coat', name: 'Camel wool coat', category: 'Outerwear', sub: 'Coat', shape: 'coat', colors: ['Camel'], material: 'Wool look', tags: ['Classic', 'Tailored', 'Minimal'], seasons: ['Fall', 'Winter'], occ: ['Work', 'Everyday', 'Evening', 'Formal'], wear: 5, price: 180 },
  { key: 'blazer', name: 'Black blazer', category: 'Outerwear', sub: 'Blazer', shape: 'blazer', colors: ['Black'], material: 'Wool look', tags: ['Tailored', 'Minimal', 'Classic'], occ: ['Work', 'Evening', 'Formal'], wear: 3, price: 120 },
  { key: 'boots', name: 'Black leather boots', category: 'Footwear', sub: 'Boots', shape: 'boots', colors: ['Black'], material: 'Leather look', tags: ['Edgy', 'Classic'], seasons: ['Fall', 'Winter'], occ: ['Everyday', 'Evening', 'Class'], fav: true, wear: 15, price: 140 },
  { key: 'sneakers', name: 'White sneakers', category: 'Footwear', sub: 'Sneakers', shape: 'sneakers', colors: ['White'], material: 'Leather look', tags: ['Minimal', 'Street', 'Sporty'], occ: ['Everyday', 'Class', 'Weekend', 'Active'], wear: 25, price: 85 },
  { key: 'loafers', name: 'Brown loafers', category: 'Footwear', sub: 'Loafers / flats', shape: 'loafers', colors: ['Brown'], material: 'Leather look', tags: ['Classic', 'Preppy', 'Tailored'], occ: ['Work', 'Class', 'Evening'], wear: 4, price: 110 },
  { key: 'tote', name: 'Canvas tote', category: 'Bags', sub: 'Tote', shape: 'tote', colors: ['Beige'], material: 'Cotton look', tags: ['Relaxed', 'Minimal'], occ: ['Class', 'Everyday', 'Weekend'], wear: 18, price: 25 },
  { key: 'crossbody', name: 'Black crossbody bag', category: 'Bags', sub: 'Crossbody', shape: 'crossbody', colors: ['Black'], material: 'Leather look', tags: ['Minimal', 'Classic'], occ: ['Evening', 'Everyday', 'Work'], wear: 6, price: 75 },
  { key: 'scarf', name: 'Red wool scarf', category: 'Accessories', sub: 'Scarf', shape: 'scarf', colors: ['Red'], material: 'Wool look', tags: ['Bold', 'Classic'], seasons: ['Fall', 'Winter'], occ: ['Everyday', 'Class'], wear: 0, price: 30 },
  { key: 'cap', name: 'Navy baseball cap', category: 'Accessories', sub: 'Hat / cap', shape: 'cap', colors: ['Navy'], material: 'Cotton look', tags: ['Sporty', 'Street'], seasons: ['Spring', 'Summer'], occ: ['Weekend', 'Active'], wear: 3 },
  { key: 'belt', name: 'Brown leather belt', category: 'Accessories', sub: 'Belt', shape: 'belt', colors: ['Brown'], material: 'Leather look', tags: ['Classic'], occ: ['Work', 'Everyday'], wear: 9, price: 40 },
];

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const ymd = (daysFromNow: number) => { const d = new Date(Date.now() + daysFromNow * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export function buildDemo(): { items: Item[]; images: { id: string; blob: Blob }[]; outfits: Outfit[]; plans: Plan[] } {
  const images: { id: string; blob: Blob }[] = [];
  const items: Item[] = SEEDS.map((s, n) => {
    const imgId = `demo-img-${s.key}`;
    images.push({ id: imgId, blob: new Blob([svg(s.shape, s.colors[0], s.colors[1], s.pattern === 'Striped')], { type: 'image/svg+xml' }) });
    return {
      id: `demo-${s.key}`, name: s.name, category: s.category, subcategory: s.sub, colors: s.colors, pattern: s.pattern ?? 'Solid',
      material: s.material, styleTags: s.tags, seasons: s.seasons ?? [], occasions: s.occ, price: s.price, brand: s.brand,
      customTags: [], favorite: Boolean(s.fav), wearCount: s.wear ?? 0, lastWorn: s.wear ? ymd(-((n * 3) % 40) - 1) : undefined,
      images: [{ id: imgId }], useCutout: false, createdAt: iso(60 - n), updatedAt: iso(60 - n), notes: 'Fictional demo item.',
    };
  });
  const id = (k: string) => `demo-${k}`;
  const outfits: Outfit[] = [
    { id: 'demo-look-1', name: 'Monday class uniform', itemIds: [id('tee-white'), id('jeans'), id('jacket'), id('sneakers'), id('tote')], favorite: true, source: 'manual', createdAt: iso(20), updatedAt: iso(20) },
    { id: 'demo-look-2', name: 'Gallery night', itemIds: [id('tee-black'), id('trousers'), id('blazer'), id('boots'), id('crossbody')], favorite: false, source: 'manual', createdAt: iso(12), updatedAt: iso(12) },
    { id: 'demo-look-3', name: 'Cozy Sunday', itemIds: [id('knit-cream'), id('jeans'), id('boots'), id('scarf')], favorite: false, source: 'suggested', createdAt: iso(5), updatedAt: iso(5) },
  ];
  const plans: Plan[] = [
    { date: ymd(-2), outfitId: 'demo-look-1', worn: true },
    { date: ymd(1), outfitId: 'demo-look-2', worn: false },
    { date: ymd(3), outfitId: 'demo-look-3', worn: false },
  ];
  return { items, images, outfits, plans };
}
