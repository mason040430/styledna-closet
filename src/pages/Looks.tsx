import { useState } from 'react';
import { Button, Chip, Confirm, EmptyState, Field, Modal, OutfitBoard, PageHead, go, inputCls } from '../components/ui';
import { useStore, todayYmd } from '../lib/store';
import { isCompleteOutfit } from '../lib/recommend';
import type { Outfit } from '../lib/types';

export default function Looks() {
  const s = useStore();
  const [favOnly, setFavOnly] = useState(false);
  const [del, setDel] = useState<Outfit | null>(null);
  const [planFor, setPlanFor] = useState<Outfit | null>(null);
  const [date, setDate] = useState(todayYmd());
  const list = [...s.outfits].filter((o) => !favOnly || o.favorite).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHead eyebrow="Saved looks" title={<>{s.outfits.length} <em className="text-olive">looks</em></>}
        action={<Button onClick={() => go('studio')}>+ New look</Button>} />
      {s.outfits.length === 0 ? (
        <EmptyState title="No saved looks yet" body="Build one in the studio, or save a suggestion from the Stylist." action={<><Button onClick={() => go('studio')}>Open studio</Button><Button variant="secondary" onClick={() => go('stylist')}>Get suggestions</Button></>} />
      ) : (
        <>
          <Chip small active={favOnly} onClick={() => setFavOnly(!favOnly)}>♥ Favorites only</Chip>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {list.map((o) => {
              const items = o.itemIds.map((id) => s.items.find((i) => i.id === id)!).filter(Boolean);
              const planned = s.plans.filter((p) => p.outfitId === o.id && p.date >= todayYmd()).sort((a, b) => a.date.localeCompare(b.date))[0];
              return (
                <article key={o.id} className="rounded-3xl bg-paper shadow-card overflow-hidden">
                  <button className="block w-full" onClick={() => go(`studio/${o.id}`)} aria-label={`Open ${o.name}`}><OutfitBoard items={items} /></button>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-serif text-xl truncate">{o.name}</h2>
                        <p className="text-xs text-mute mt-1">{items.length} pieces{o.source === 'suggested' ? ' · from Stylist' : ''}{!isCompleteOutfit(items) ? ' · incomplete' : ''}{planned ? ` · planned ${new Date(planned.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</p>
                      </div>
                      <button onClick={() => s.saveOutfit({ id: o.id, name: o.name, itemIds: o.itemIds, favorite: !o.favorite })} aria-pressed={o.favorite} aria-label={o.favorite ? `Unfavorite ${o.name}` : `Favorite ${o.name}`} className="text-xl h-9 w-9 rounded-full hover:bg-ink/5">{o.favorite ? '♥' : '♡'}</button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="secondary" className="h-9 px-4" onClick={() => go(`studio/${o.id}`)}>Edit</Button>
                      <Button variant="secondary" className="h-9 px-4" onClick={() => { setPlanFor(o); setDate(todayYmd()); }}>Plan</Button>
                      <Button variant="secondary" className="h-9 px-4" onClick={async () => { await s.duplicateOutfit(o.id); s.toast('Look duplicated.'); }}>Duplicate</Button>
                      <Button variant="ghost" className="h-9 px-4 text-danger" onClick={() => setDel(o)}>Delete</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
      <Modal open={!!planFor} onClose={() => setPlanFor(null)} title={`Plan “${planFor?.name ?? ''}”`}>
        <Field label="Date"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        {s.plans.find((p) => p.date === date) && <p className="text-xs text-mute mt-2">This replaces the look already planned for that day.</p>}
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setPlanFor(null)}>Cancel</Button>
          <Button onClick={async () => { if (planFor && date) { await s.setPlan(date, planFor.id); s.toast('Added to your calendar.'); setPlanFor(null); } }}>Add to calendar</Button>
        </div>
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={`Delete “${del?.name ?? ''}”?`} body="The pieces stay in your closet. Any calendar plans for this look are removed." confirm="Delete look"
        onConfirm={async () => { if (del) { await s.deleteOutfit(del.id); s.toast('Look deleted.'); } }} />
    </>
  );
}
