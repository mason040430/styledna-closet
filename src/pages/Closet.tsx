import { useMemo, useState } from 'react';
import { Button, Chip, ChipSelect, EmptyState, ItemCard, PageHead, go, inputCls } from '../components/ui';
import { useStore } from '../lib/store';
import { CATEGORIES, COLOR_NAMES, OCCASIONS, SEASONS } from '../lib/taxonomy';
import type { Category, Occasion, Season } from '../lib/types';

const SORTS = { newest: 'Newest', name: 'Name', most: 'Most worn', least: 'Least worn' } as const;

export default function Closet() {
  const s = useStore();
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [q, setQ] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [occ, setOcc] = useState<Occasion[]>([]);
  const [fav, setFav] = useState(false);
  const [sort, setSort] = useState<keyof typeof SORTS>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return s.items
      .filter((i) => cat === 'All' || i.category === cat)
      .filter((i) => !needle || [i.name, i.subcategory, i.brand ?? '', i.notes ?? '', i.material, i.pattern, ...i.colors, ...i.styleTags, ...i.customTags, ...i.occasions].join(' ').toLowerCase().includes(needle))
      .filter((i) => !colors.length || i.colors.some((c) => colors.includes(c)))
      .filter((i) => !seasons.length || i.seasons.length === 0 || i.seasons.some((x) => seasons.includes(x)))
      .filter((i) => !occ.length || i.occasions.some((x) => occ.includes(x)))
      .filter((i) => !fav || i.favorite)
      .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'most' ? b.wearCount - a.wearCount : sort === 'least' ? a.wearCount - b.wearCount : b.createdAt.localeCompare(a.createdAt));
  }, [s.items, cat, q, colors, seasons, occ, fav, sort]);

  const activeFilters = colors.length + seasons.length + occ.length + (fav ? 1 : 0);
  const usedColors = COLOR_NAMES.filter((c) => s.items.some((i) => i.colors.includes(c)));
  const clear = () => { setColors([]); setSeasons([]); setOcc([]); setFav(false); setQ(''); };

  return (
    <>
      <PageHead eyebrow="My Closet" title={<>{s.items.length} <em className="text-olive">pieces</em></>}
        action={<Button onClick={() => go('add')}>+ Add items</Button>} />
      {s.items.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Add photos of clothes you own. On a phone you can take them straight from the camera." action={<Button onClick={() => go('add')}>Add items</Button>} />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Categories">
            {(['All', ...CATEGORIES] as const).map((c) => {
              const n = c === 'All' ? s.items.length : s.items.filter((i) => i.category === c).length;
              return <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c} <span className="opacity-60">{n}</span></Chip>;
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <input type="search" aria-label="Search your closet" placeholder="Search name, color, brand, tag…" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} flex-1 min-w-[200px]`} />
            <Button variant="secondary" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}>Filters{activeFilters ? ` · ${activeFilters}` : ''}</Button>
            <label className="text-sm flex items-center gap-2"><span className="sr-only sm:not-sr-only text-mute">Sort</span>
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className={`${inputCls} w-auto`}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          {showFilters && (
            <div className="mt-4 rounded-2xl bg-paper border border-line p-5 space-y-4 fade-in">
              <div><p className="text-xs text-mute mb-2">Color</p><ChipSelect label="Color filter" small swatches options={usedColors} value={colors} onChange={setColors} /></div>
              <div><p className="text-xs text-mute mb-2">Season</p><ChipSelect label="Season filter" small options={SEASONS} value={seasons} onChange={setSeasons} /></div>
              <div><p className="text-xs text-mute mb-2">Occasion</p><ChipSelect label="Occasion filter" small options={OCCASIONS} value={occ} onChange={setOcc} /></div>
              <div className="flex items-center justify-between"><Chip small active={fav} onClick={() => setFav(!fav)}>♥ Favorites only</Chip>
                <button className="text-sm underline" onClick={clear}>Clear all</button></div>
            </div>
          )}
          <p className="mt-5 text-sm text-mute" aria-live="polite">{list.length} of {s.items.length} pieces</p>
          {list.length === 0 ? (
            <div className="mt-4"><EmptyState title="No matches" body="Try a different search or clear the filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} /></div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {list.map((i) => <ItemCard key={i.id} item={i} onClick={() => go(`item/${i.id}`)} />)}
            </div>
          )}
        </>
      )}
    </>
  );
}
