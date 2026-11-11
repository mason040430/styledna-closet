import { useEffect, useMemo, useState } from 'react';
import { Button, Chip, EmptyState, ItemCard, ItemImage, PageHead, go, inputCls, query , href} from '../components/ui';
import { useStore } from '../lib/store';
import { CATEGORIES } from '../lib/taxonomy';
import { isCompleteOutfit, recommend } from '../lib/recommend';
import type { Category, Item } from '../lib/types';

const ORDER: Category[] = ['Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Footwear', 'Bags', 'Accessories'];
const MAX_PER: Partial<Record<Category, number>> = { Accessories: 3, Tops: 2 };

export default function Studio({ id }: { id?: string }) {
  const s = useStore();
  const editing = id ? s.outfits.find((o) => o.id === id) : undefined;
  const [sel, setSel] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [cat, setCat] = useState<Category>('Tops');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    const key = `${id ?? ''}?${query().get('items') ?? ''}`;
    if (loadedFor === key) return;
    if (editing) { setSel(editing.itemIds.filter((x) => s.items.some((i) => i.id === x))); setName(editing.name); }
    else { const pre = (query().get('items') ?? '').split(',').filter((x) => s.items.some((i) => i.id === x)); setSel(pre); setName(''); }
    setLoadedFor(key);
  }, [id, editing, s.items, loadedFor]);

  const chosen = useMemo(() => sel.map((x) => s.items.find((i) => i.id === x)).filter(Boolean) as Item[], [sel, s.items]);
  const sorted = [...chosen].sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
  const complete = isCompleteOutfit(chosen);

  const toggle = (it: Item) => setSel((cur) => {
    if (cur.includes(it.id)) return cur.filter((x) => x !== it.id);
    const max = MAX_PER[it.category] ?? 1;
    const same = cur.filter((x) => s.items.find((i) => i.id === x)?.category === it.category);
    const kept = same.length >= max ? cur.filter((x) => x !== same[0]) : cur;
    return [...kept, it.id];
  });

  const fillRest = () => {
    const r = recommend(s.items, s.profile, s.feedback, s.outfits, { anchorIds: sel, count: 1, seed: Date.now() % 9973 });
    if (r.suggestions[0]) { setSel(r.suggestions[0].itemIds); s.toast('Filled in the rest — swap anything you like.'); }
    else s.toast(r.problems[0] ?? 'Could not complete this look.', 'error');
  };

  const save = async (asNew = false) => {
    if (!sel.length) return;
    const nm = name.trim() || `Look ${s.outfits.length + 1}`;
    const o = await s.saveOutfit({ ...(editing && !asNew ? { id: editing.id } : {}), name: asNew && editing ? `${nm} (copy)` : nm, itemIds: sel });
    s.toast(editing && !asNew ? 'Look updated.' : 'Look saved.');
    go(`studio/${o.id}`);
  };

  if (s.items.length === 0) return <EmptyState title="Add clothes to start styling" body="The studio uses pieces from your closet." action={<Button onClick={() => go('add')}>Add items</Button>} />;
  const inCat = s.items.filter((i) => i.category === cat);

  return (
    <>
      <PageHead eyebrow="Outfit Studio" title={editing ? <>Edit <em className="text-olive">look</em></> : <>Build a <em className="text-olive">look</em></>}
        sub="Tap pieces to add or remove them. One per category, up to two tops for layering and three accessories." />
      <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
        <section aria-label="Your look" className="min-w-0 lg:sticky lg:top-6 rounded-3xl bg-paper shadow-card p-5">
          <div className="grid grid-cols-3 gap-2 min-h-[180px]">
            {sorted.map((it) => (
              <button key={it.id} onClick={() => toggle(it)} className="relative group" aria-label={`Remove ${it.name}`}>
                <ItemImage item={it} className="aspect-square rounded-xl" />
                <span className="absolute top-1 right-1 h-6 w-6 rounded-full bg-ink text-cream text-xs grid place-items-center opacity-80 group-hover:opacity-100">×</span>
                <span className="block text-[11px] mt-1 truncate text-left">{it.name}</span>
              </button>
            ))}
            {sorted.length === 0 && <p className="col-span-3 grid place-items-center text-sm text-mute text-center py-10">Pick pieces on the right<br />or let us suggest a start.</p>}
          </div>
          <p className={`mt-4 text-xs ${complete ? 'text-olive' : 'text-mute'}`} aria-live="polite">
            {complete ? '✓ Complete look' : 'A complete look needs a top + bottom, or a dress.'}
          </p>
          <label className="block mt-4"><span className="sr-only">Look name</span>
            <input className={inputCls} placeholder="Name this look (e.g. Gallery night)" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => save(false)} disabled={!sel.length}>{editing ? 'Save changes' : 'Save look'}</Button>
            {editing && <Button variant="secondary" onClick={() => save(true)}>Save as new</Button>}
            <Button variant="secondary" onClick={fillRest}>{sel.length ? 'Suggest the rest' : 'Suggest a start'}</Button>
            {sel.length > 0 && <Button variant="ghost" onClick={() => setSel([])}>Clear</Button>}
          </div>
          {editing && <button className="mt-4 text-sm underline" onClick={() => s.saveOutfit({ id: editing.id, name: editing.name, itemIds: editing.itemIds, favorite: !editing.favorite })}>{editing.favorite ? '♥ Favorited' : '♡ Add to favorites'}</button>}
        </section>
        <section aria-label="Pick pieces" className="min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Categories">
            {CATEGORIES.map((c) => {
              const n = sel.filter((x) => s.items.find((i) => i.id === x)?.category === c).length;
              return <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}{n ? ` · ${n}` : ''}</Chip>;
            })}
          </div>
          {inCat.length === 0 ? <p className="mt-6 text-sm text-mute">No {cat.toLowerCase()} yet. <a className="underline" href={href('add')}>Add some</a>.</p> : (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {inCat.map((it) => <ItemCard key={it.id} compact item={it} selected={sel.includes(it.id)} onClick={() => toggle(it)} />)}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
