export type Category = 'Tops' | 'Bottoms' | 'Outerwear' | 'Dresses' | 'Footwear' | 'Bags' | 'Accessories';
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type Occasion = 'Everyday' | 'Class' | 'Work' | 'Evening' | 'Weekend' | 'Active' | 'Formal';

export interface ItemImage {
  id: string;          // key in the images store
  cutoutId?: string;   // optional background-removed version
}

export interface Item {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  colors: string[];          // [primary, secondary?]
  pattern: string;
  material: string;
  styleTags: string[];
  seasons: Season[];         // empty = all seasons
  occasions: Occasion[];
  brand?: string;
  price?: number;
  purchaseDate?: string;     // YYYY-MM-DD
  notes?: string;
  customTags: string[];
  favorite: boolean;
  wearCount: number;
  lastWorn?: string;         // YYYY-MM-DD
  images: ItemImage[];
  useCutout: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  favorite: boolean;
  notes?: string;
  source: 'manual' | 'suggested';
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  date: string;      // YYYY-MM-DD (key)
  outfitId: string;
  worn: boolean;
}

export interface QuizResult {
  type: string;      // e.g. "visionary"
  scores: { expression: number; experimentation: number; impact: number; individuality: number; structure: number };
  importedAt: string;
}

export interface Profile {
  aesthetics: string[];
  favoriteColors: string[];
  avoidColors: string[];
  occasions: Occasion[];
  explore: 0 | 1 | 2;     // 0 = stay close, 1 = some variety, 2 = stretch me
  quiz?: QuizResult;
  updatedAt?: string;
}

export interface FeedbackEntry {
  id: string;
  itemIds: string[];
  verdict: 'up' | 'down';
  at: string;
}

export interface Snapshot {
  items: Item[];
  outfits: Outfit[];
  plans: Plan[];
  profile: Profile;
  feedback: FeedbackEntry[];
}

export const emptyProfile: Profile = { aesthetics: [], favoriteColors: [], avoidColors: [], occasions: [], explore: 1 };
