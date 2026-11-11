/** Wardrobe insights computed only from data the user actually entered. */
import { CATEGORIES, colorHex } from './taxonomy';
import type { Item, Outfit, Plan } from './types';

export interface Insights {
  total: number;
  byCategory: { name: string; count: number }[];
  byColor: { name: string; hex: string; count: number }[];
  mostWorn: Item[];
  leastWorn: Item[];
  costPerWear: { item: Item; cpw: number }[];
  cpwEligible: number;
  favoriteOutfits: Outfit[];
  plannedCount: number;
  wornLogged: number;
  repeats: { outfit: Outfit; times: number }[];
  hasWearData: boolean;
}

export function computeInsights(items: Item[], outfits: Outfit[], plans: Plan[]): Insights {
  const byCategory = CATEGORIES.map((c) => ({ name: c, count: items.filter((i) => i.category === c).length })).filter((x) => x.count);
  const colorMap = new Map<string, number>();
  items.forEach((i) => i.colors[0] && colorMap.set(i.colors[0], (colorMap.get(i.colors[0]) ?? 0) + 1));
  const byColor = [...colorMap.entries()].map(([name, count]) => ({ name, hex: colorHex(name), count })).sort((a, b) => b.count - a.count);
  const worn = items.filter((i) => i.wearCount > 0);
  const mostWorn = [...worn].sort((a, b) => b.wearCount - a.wearCount).slice(0, 5);
  const leastWorn = [...items].sort((a, b) => a.wearCount - b.wearCount || a.createdAt.localeCompare(b.createdAt)).slice(0, 5);
  const costPerWear = items.filter((i) => i.price && i.wearCount > 0).map((item) => ({ item, cpw: item.price! / item.wearCount })).sort((a, b) => a.cpw - b.cpw);
  const counts = new Map<string, number>();
  plans.filter((p) => p.worn).forEach((p) => counts.set(p.outfitId, (counts.get(p.outfitId) ?? 0) + 1));
  const repeats = [...counts.entries()].map(([id, times]) => ({ outfit: outfits.find((o) => o.id === id)!, times })).filter((r) => r.outfit && r.times > 1).sort((a, b) => b.times - a.times);
  return {
    total: items.length, byCategory, byColor, mostWorn, leastWorn, costPerWear, cpwEligible: costPerWear.length,
    favoriteOutfits: outfits.filter((o) => o.favorite), plannedCount: plans.length, wornLogged: plans.filter((p) => p.worn).length,
    repeats, hasWearData: worn.length > 0,
  };
}
