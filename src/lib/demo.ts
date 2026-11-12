/** Fictional demo closet. Flat vector illustrations generated here — not photos, not real customer data. */
import { colorHex } from './taxonomy';
import type { Category, Item, Occasion, Outfit, Plan, Season } from './types';

import { garmentSvg, type Shape } from './garments';

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
    images.push({ id: imgId, blob: new Blob([garmentSvg(s.shape, colorHex(s.colors[0]), s.colors[1] ? colorHex(s.colors[1]) : undefined, s.pattern === 'Striped', s.key)], { type: 'image/svg+xml' }) });
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
