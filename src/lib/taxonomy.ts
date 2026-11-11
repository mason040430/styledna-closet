import type { Category, Occasion, Season } from './types';

export const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Footwear', 'Bags', 'Accessories'];

export const SUBCATEGORIES: Record<Category, string[]> = {
  Tops: ['T-shirt', 'Shirt', 'Blouse', 'Knit / sweater', 'Hoodie / sweatshirt', 'Tank / cami', 'Polo', 'Other top'],
  Bottoms: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Joggers', 'Other bottom'],
  Outerwear: ['Jacket', 'Coat', 'Blazer', 'Cardigan', 'Vest', 'Other outerwear'],
  Dresses: ['Dress', 'Jumpsuit', 'Overalls', 'Other one-piece'],
  Footwear: ['Sneakers', 'Boots', 'Loafers / flats', 'Heels', 'Sandals', 'Other shoes'],
  Bags: ['Tote', 'Shoulder bag', 'Crossbody', 'Backpack', 'Clutch', 'Other bag'],
  Accessories: ['Scarf', 'Hat / cap', 'Belt', 'Jewelry', 'Sunglasses', 'Other accessory'],
};

export const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
export const OCCASIONS: Occasion[] = ['Everyday', 'Class', 'Work', 'Evening', 'Weekend', 'Active', 'Formal'];
export const PATTERNS = ['Solid', 'Striped', 'Checked / plaid', 'Floral', 'Graphic / print', 'Denim wash', 'Textured', 'Other pattern'];
export const MATERIALS = ['Cotton look', 'Denim', 'Knit', 'Leather look', 'Wool look', 'Linen look', 'Silk / satin look', 'Synthetic / technical', 'Unsure'];
export const AESTHETICS = ['Minimal', 'Classic', 'Street', 'Romantic', 'Bold', 'Sporty', 'Relaxed', 'Tailored', 'Vintage', 'Edgy', 'Preppy', 'Artsy'];

/** Named fashion colors with reference RGB used both for swatches and for on-device color naming. */
export const COLORS: { name: string; hex: string; neutral: boolean; family: string }[] = [
  { name: 'Black', hex: '#1c1c1c', neutral: true, family: 'black' },
  { name: 'Charcoal', hex: '#45464a', neutral: true, family: 'grey' },
  { name: 'Grey', hex: '#9a9a98', neutral: true, family: 'grey' },
  { name: 'White', hex: '#f7f7f4', neutral: true, family: 'white' },
  { name: 'Cream', hex: '#ece3cf', neutral: true, family: 'white' },
  { name: 'Beige', hex: '#cdb898', neutral: true, family: 'brown' },
  { name: 'Camel', hex: '#b38b5d', neutral: true, family: 'brown' },
  { name: 'Brown', hex: '#6b4a33', neutral: true, family: 'brown' },
  { name: 'Navy', hex: '#1f2c45', neutral: true, family: 'blue' },
  { name: 'Denim blue', hex: '#4f6d8f', neutral: true, family: 'blue' },
  { name: 'Light blue', hex: '#a9c3dc', neutral: false, family: 'blue' },
  { name: 'Blue', hex: '#2f5fb3', neutral: false, family: 'blue' },
  { name: 'Olive', hex: '#5f6440', neutral: true, family: 'green' },
  { name: 'Green', hex: '#3f7d4e', neutral: false, family: 'green' },
  { name: 'Sage', hex: '#a7b49a', neutral: false, family: 'green' },
  { name: 'Yellow', hex: '#e2c443', neutral: false, family: 'yellow' },
  { name: 'Orange', hex: '#d9773a', neutral: false, family: 'orange' },
  { name: 'Red', hex: '#b3322b', neutral: false, family: 'red' },
  { name: 'Burgundy', hex: '#6b2232', neutral: false, family: 'red' },
  { name: 'Pink', hex: '#e3a3b2', neutral: false, family: 'pink' },
  { name: 'Lilac', hex: '#b9a6d1', neutral: false, family: 'purple' },
  { name: 'Purple', hex: '#5e3d86', neutral: false, family: 'purple' },
  { name: 'Silver', hex: '#c4c6c8', neutral: true, family: 'metal' },
  { name: 'Gold', hex: '#c9a24a', neutral: true, family: 'metal' },
];
export const COLOR_NAMES = COLORS.map((c) => c.name);
export const colorInfo = (name: string) => COLORS.find((c) => c.name === name);
export const isNeutral = (name: string) => colorInfo(name)?.neutral ?? false;
export const colorHex = (name: string) => colorInfo(name)?.hex ?? '#bbbbbb';

/** Categories needing outerwear by season (used for suggestions, not enforced). */
export const COLD: Season[] = ['Fall', 'Winter'];
