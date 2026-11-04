export const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'] as const;
export type Category = typeof categories[number];
export type Item = { id: string; name: string; category: Category; color: string; season: string; occasion: string; favorite: boolean; image: string; added: string };
export type Outfit = { id: string; name: string; items: string[]; favorite: boolean; created: string };
export type Profile = { style: string; palette: string; occasion: string };
export type State = { items: Item[]; outfits: Outfit[]; calendar: Record<string, string>; profile: Profile };
export const emptyState: State = { items: [], outfits: [], calendar: {}, profile: { style: 'Modern minimal', palette: 'Neutrals', occasion: 'Everyday' } };
export function recommend(items: Item[], profile: Profile, season: string, variation = 0): Item[] {
 const eligible = items.filter(i => season === 'All seasons' || i.season === 'All seasons' || i.season === season);
 const neutrals = ['Black', 'White', 'Cream', 'Grey', 'Navy', 'Brown'];
 const score = (i: Item) => (i.occasion === profile.occasion || i.occasion === 'Everyday' ? 3 : 0) + (i.favorite ? 2 : 0) + ((profile.palette === 'Neutrals' ? neutrals.includes(i.color) : !neutrals.includes(i.color)) ? 2 : 0) + (profile.style === 'Classic tailoring' && i.occasion === 'Work' ? 2 : 0) + (profile.style === 'Sport & street' && i.occasion === 'Active' ? 2 : 0) + (profile.style === 'Creative eclectic' && !neutrals.includes(i.color) ? 2 : 0);
 const pick = (category: Category) => { const options = eligible.filter(i => i.category === category).sort((a,b) => score(b)-score(a) || a.id.localeCompare(b.id)); return options.length ? options[variation % options.length] : undefined; };
 const dress = pick('Dresses'); const top = pick('Tops'); const bottom = pick('Bottoms');
 const base = dress && (variation % 2 === 1 || !top || !bottom) ? [dress] : [top, bottom];
 return [...base, pick('Shoes'), ...(profile.style === 'Classic tailoring' || season === 'Winter' || season === 'Autumn' ? [pick('Outerwear')] : []), pick('Accessories')].filter((i): i is Item => Boolean(i));
}
export function isComplete(items: Item[]) { return items.some(i => i.category === 'Dresses') || (items.some(i => i.category === 'Tops') && items.some(i => i.category === 'Bottoms')); }
export function removeItem(state: State, id: string): State { return { ...state, items: state.items.filter(i => i.id !== id), outfits: state.outfits.map(o => ({ ...o, items: o.items.filter(x => x !== id) })) }; }
