import { useRef, useState } from 'react';
import { Button, Confirm, EmptyState, Eyebrow, OutfitBoard, Swatches, go } from '../components/ui';
import { ItemForm, type ItemMeta } from '../components/ItemForm';
import { useStore, todayYmd } from '../lib/store';
import { validateFile, prepareImage } from '../lib/vision';

export default function ItemDetail({ id }: { id?: string }) {
  const s = useStore();
  const item = s.items.find((i) => i.id === id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ItemMeta | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const addRef = useRef<HTMLInputElement>(null);
  if (!item) return <EmptyState title="This piece isn’t here" body="It may have been deleted." action={<Button onClick={() => go('closet')}>Back to closet</Button>} />;

  const img = item.images[Math.min(imgIdx, item.images.length - 1)];
  const showCutout = item.useCutout && img?.cutoutId && imgIdx === 0;
  const src = s.imageUrl(showCutout ? img.cutoutId : img?.id);
  const looks = s.outfits.filter((o) => o.itemIds.includes(item.id));
  const cpw = item.price && item.wearCount ? item.price / item.wearCount : undefined;

  const startEdit = () => { setDraft({ ...item }); setEditing(true); };
  const saveEdit = async () => { if (!draft || !draft.name.trim()) { s.toast('Name is required.', 'error'); return; } await s.updateItem({ ...item, ...draft, name: draft.name.trim() }); setEditing(false); s.toast('Saved.'); };
  const logWear = async () => { await s.updateItem({ ...item, wearCount: item.wearCount + 1, lastWorn: todayYmd() }); s.toast(`Logged a wear for ${item.name}.`); };
  const addPhoto = async (f: File) => {
    const bad = validateFile(f); if (bad) { s.toast(bad, 'error'); return; }
    try { const p = await prepareImage(f); await s.addImageToItem(item.id, p.original); s.toast('Photo added.'); } catch (e) { s.toast(e instanceof Error ? e.message : 'Could not add that photo.', 'error'); }
  };

  return (
    <>
      <button onClick={() => history.length > 1 ? history.back() : go('closet')} className="text-sm text-mute hover:text-ink mb-6">← Back</button>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
        <div>
          <div className="aspect-[4/5] rounded-3xl bg-[#ECE8DE] overflow-hidden grid place-items-center">
            {src ? <img src={src} alt={`${item.name}`} className="max-h-full max-w-full object-contain p-6" /> : <span className="text-mute">No photo</span>}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap items-center">
            {item.images.map((im, n) => (
              <button key={im.id} onClick={() => setImgIdx(n)} aria-label={`Photo ${n + 1}`} aria-pressed={n === imgIdx}
                className={`h-16 w-14 rounded-xl overflow-hidden bg-[#ECE8DE] border-2 ${n === imgIdx ? 'border-ink' : 'border-transparent'}`}>
                <img src={s.imageUrl(im.id)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            <button onClick={() => addRef.current?.click()} className="h-16 w-14 rounded-xl border border-dashed border-line text-xl text-mute" aria-label="Add another photo">+</button>
            <input ref={addRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void addPhoto(f); e.target.value = ''; }} />
            {img?.cutoutId && imgIdx === 0 && (
              <button onClick={() => s.updateItem({ ...item, useCutout: !item.useCutout })} className="ml-auto text-xs underline">
                Show {item.useCutout ? 'original photo' : 'clean background'}
              </button>
            )}
          </div>
        </div>

        <div>
          {!editing ? (
            <>
              <Eyebrow>{item.category} · {item.subcategory}</Eyebrow>
              <h1 className="font-serif text-4xl sm:text-5xl mt-2 leading-tight">{item.name}</h1>
              <p className="mt-3 flex items-center gap-2 text-mute"><Swatches colors={item.colors} /> {item.colors.join(' & ')} · {item.pattern} · {item.material}</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-paper border border-line p-4"><p className="font-serif text-3xl">{item.wearCount}</p><p className="text-xs text-mute mt-1">times worn</p></div>
                <div className="rounded-2xl bg-paper border border-line p-4"><p className="font-serif text-3xl">{cpw !== undefined ? `$${cpw.toFixed(cpw < 10 ? 2 : 0)}` : '—'}</p><p className="text-xs text-mute mt-1">{cpw !== undefined ? 'cost per wear' : 'add price for cost/wear'}</p></div>
                <div className="rounded-2xl bg-paper border border-line p-4"><p className="font-serif text-xl mt-1.5">{item.lastWorn ? new Date(item.lastWorn + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</p><p className="text-xs text-mute mt-2">last worn</p></div>
              </div>
              <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                <dt className="text-mute">Occasions</dt><dd>{item.occasions.join(', ') || '—'}</dd>
                <dt className="text-mute">Seasons</dt><dd>{item.seasons.length ? item.seasons.join(', ') : 'All seasons'}</dd>
                <dt className="text-mute">Style</dt><dd>{item.styleTags.join(', ') || '—'}</dd>
                {item.brand && <><dt className="text-mute">Brand</dt><dd>{item.brand}</dd></>}
                {item.price !== undefined && <><dt className="text-mute">Price</dt><dd>${item.price}</dd></>}
                {item.purchaseDate && <><dt className="text-mute">Bought</dt><dd>{item.purchaseDate}</dd></>}
                {item.customTags.length > 0 && <><dt className="text-mute">Tags</dt><dd>{item.customTags.join(', ')}</dd></>}
                {item.notes && <><dt className="text-mute">Notes</dt><dd className="whitespace-pre-wrap">{item.notes}</dd></>}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => go(`stylist?anchor=${item.id}`)}>Style this piece</Button>
                <Button variant="secondary" onClick={logWear}>I wore it today</Button>
                <Button variant="secondary" onClick={() => s.updateItem({ ...item, favorite: !item.favorite })}>{item.favorite ? '♥ Favorite' : '♡ Favorite'}</Button>
                <Button variant="secondary" onClick={startEdit}>Edit</Button>
                <Button variant="ghost" className="text-danger" onClick={() => setConfirm(true)}>Delete</Button>
              </div>
            </>
          ) : draft && (
            <>
              <h1 className="font-serif text-3xl mb-6">Edit piece</h1>
              <ItemForm value={draft} onChange={setDraft} />
              <div className="mt-8 flex gap-3"><Button onClick={saveEdit}>Save changes</Button><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button></div>
            </>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl mb-4">In {looks.length} saved look{looks.length === 1 ? '' : 's'}</h2>
        {looks.length === 0 ? <p className="text-mute text-sm">Not in any looks yet. Tap “Style this piece” for ideas.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {looks.map((o) => (
              <button key={o.id} onClick={() => go(`studio/${o.id}`)} className="text-left rounded-2xl overflow-hidden bg-paper shadow-card">
                <OutfitBoard items={o.itemIds.map((x) => s.items.find((i) => i.id === x)!).filter(Boolean)} />
                <p className="p-3 text-sm font-medium truncate">{o.name}</p>
              </button>
            ))}
          </div>
        )}
      </section>
      <Confirm open={confirm} onClose={() => setConfirm(false)} title={`Delete ${item.name}?`}
        body={`This removes the piece and its photos from this device${looks.length ? ` and from ${looks.length} saved look${looks.length > 1 ? 's' : ''}` : ''}. This can’t be undone.`}
        confirm="Delete piece" onConfirm={async () => { await s.deleteItem(item.id); s.toast('Piece deleted.'); go('closet'); }} />
    </>
  );
}
