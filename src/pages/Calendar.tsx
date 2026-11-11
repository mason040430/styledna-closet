import { useState } from 'react';
import { Button, EmptyState, Modal, OutfitBoard, PageHead, go } from '../components/ui';
import { useStore, todayYmd } from '../lib/store';

const ymd = (d: Date) => todayYmd(d);
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const s = useStore();
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [day, setDay] = useState<string | null>(null);
  const today = todayYmd();
  const start = new Date(month); const offset = (start.getDay() + 6) % 7; start.setDate(1 - offset);
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const planOf = (date: string) => s.plans.find((p) => p.date === date);
  const outfitOf = (id?: string) => s.outfits.find((o) => o.id === id);
  const itemsOf = (ids: string[]) => ids.map((id) => s.items.find((i) => i.id === id)!).filter(Boolean);
  const selPlan = day ? planOf(day) : undefined;
  const upcoming = s.plans.filter((p) => p.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const label = (d: string) => new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <PageHead eyebrow="Outfit calendar" title={month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        action={<div className="flex gap-2">
          <Button variant="secondary" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</Button>
          <Button variant="secondary" onClick={() => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))}>Today</Button>
          <Button variant="secondary" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</Button>
        </div>} />
      {s.outfits.length === 0 && <div className="mb-6"><EmptyState title="Save a look first" body="Plan days with your saved looks." action={<Button onClick={() => go('studio')}>Build a look</Button>} /></div>}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] text-mute mb-2">{WEEK.map((w) => <div key={w}>{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((d) => {
          const key = ymd(d); const p = planOf(key); const o = outfitOf(p?.outfitId);
          const inMonth = d.getMonth() === month.getMonth();
          return (
            <button key={key} onClick={() => setDay(key)} aria-label={`${label(key)}${o ? `, planned: ${o.name}${p?.worn ? ', worn' : ''}` : ''}`}
              className={`relative aspect-[3/4] sm:aspect-square rounded-xl border text-left p-1 sm:p-2 overflow-hidden transition ${inMonth ? 'bg-paper' : 'bg-transparent opacity-50'} ${key === today ? 'border-ink' : 'border-line hover:border-ink'}`}>
              <span className={`text-[11px] sm:text-xs ${key === today ? 'font-bold' : ''}`}>{d.getDate()}</span>
              {o && (
                <div className="absolute inset-x-1 bottom-1 top-5 sm:top-7 rounded-lg overflow-hidden">
                  <OutfitBoard items={itemsOf(o.itemIds).slice(0, 4)} className="h-full !p-0.5 !gap-0.5" />
                </div>
              )}
              {p?.worn && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-lime text-[9px] grid place-items-center" aria-hidden>✓</span>}
            </button>
          );
        })}
      </div>
      <section className="mt-10">
        <h2 className="font-serif text-2xl mb-3">Coming up</h2>
        {upcoming.length === 0 ? <p className="text-sm text-mute">Nothing planned. Tap a day to plan a look.</p> : (
          <ul className="divide-y divide-line rounded-2xl bg-paper border border-line">
            {upcoming.map((p) => <li key={p.date}><button className="w-full text-left px-4 py-3 flex justify-between gap-3" onClick={() => setDay(p.date)}><span>{label(p.date)}</span><span className="text-mute truncate">{outfitOf(p.outfitId)?.name}</span></button></li>)}
          </ul>
        )}
      </section>
      <Modal open={!!day} onClose={() => setDay(null)} title={day ? label(day) : ''} wide>
        {selPlan && outfitOf(selPlan.outfitId) ? (
          <div className="grid sm:grid-cols-2 gap-5">
            <OutfitBoard items={itemsOf(outfitOf(selPlan.outfitId)!.itemIds)} className="rounded-2xl" />
            <div>
              <p className="font-serif text-2xl">{outfitOf(selPlan.outfitId)!.name}</p>
              <div className="mt-5 flex flex-col gap-2">
                {day! <= today && <Button variant={selPlan.worn ? 'secondary' : 'lime'} onClick={() => s.markWorn(day!, !selPlan.worn)}>{selPlan.worn ? '✓ Worn — undo' : 'Mark as worn'}</Button>}
                <Button variant="secondary" onClick={() => go(`studio/${selPlan.outfitId}`)}>Open look</Button>
                <Button variant="ghost" className="text-danger" onClick={async () => { await s.removePlan(day!); s.toast('Removed from calendar.'); }}>Remove from this day</Button>
              </div>
              <p className="text-xs text-mute mt-4">Marking a look as worn adds one wear to each piece. That’s what powers your insights.</p>
            </div>
          </div>
        ) : null}
        <p className="text-sm font-medium mt-6 mb-3">{selPlan ? 'Swap for another look' : 'Choose a saved look'}</p>
        {s.outfits.length === 0 ? <p className="text-sm text-mute">No saved looks yet.</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {s.outfits.map((o) => (
              <button key={o.id} onClick={async () => { if (day) { await s.setPlan(day, o.id); s.toast('Planned.'); } }}
                className={`rounded-2xl overflow-hidden bg-paper border text-left ${selPlan?.outfitId === o.id ? 'border-ink' : 'border-line'}`}>
                <OutfitBoard items={itemsOf(o.itemIds).slice(0, 4)} />
                <p className="text-xs p-2 truncate">{o.name}</p>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
