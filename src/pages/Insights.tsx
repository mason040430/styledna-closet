import { Button, EmptyState, PageHead, Stat, go , href} from '../components/ui';
import { useStore } from '../lib/store';
import { computeInsights } from '../lib/insights';
import { wardrobeGaps } from '../lib/recommend';
import type { Item } from '../lib/types';

function Bars({ rows }: { rows: { name: string; count: number; hex?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.name} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-sm">
          <span className="flex items-center gap-2 truncate">{r.hex && <span className="h-3 w-3 rounded-full border border-black/10 shrink-0" style={{ background: r.hex }} />}{r.name}</span>
          <span className="h-2.5 rounded-full bg-line overflow-hidden"><span className="block h-full bg-ink rounded-full" style={{ width: `${(r.count / max) * 100}%` }} /></span>
          <span className="text-right tabular-nums text-mute">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}
function ItemRow({ it, right }: { it: Item; right: string }) {
  return <li><a href={href(`item/${it.id}`)} className="flex justify-between gap-3 py-2 text-sm hover:underline"><span className="truncate">{it.name}</span><span className="text-mute shrink-0">{right}</span></a></li>;
}

export default function InsightsPage() {
  const s = useStore();
  if (s.items.length === 0) return <EmptyState title="Insights appear as you add clothes" body="Add pieces, save looks, and mark what you wear. Every number here comes from your own data." action={<Button onClick={() => go('add')}>Add items</Button>} />;
  const ins = computeInsights(s.items, s.outfits, s.plans);
  const gaps = wardrobeGaps(s.items);
  const card = 'rounded-3xl bg-paper border border-line p-6';
  return (
    <>
      <PageHead eyebrow="Insights" title={<>Know what you <em className="text-olive">own</em></>} sub="Calculated only from what you’ve entered on this device. Wear counts grow when you mark looks as worn or log a wear on a piece." />
      <div className={`${card} grid grid-cols-2 sm:grid-cols-4 gap-6`}>
        <Stat value={ins.total} label="Pieces" />
        <Stat value={s.outfits.length} label="Saved looks" />
        <Stat value={ins.wornLogged} label="Looks marked worn" />
        <Stat value={s.items.filter((i) => i.favorite).length} label="Favorite pieces" />
      </div>
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <section className={card}><h2 className="font-serif text-xl mb-4">By category</h2><Bars rows={ins.byCategory} /></section>
        <section className={card}><h2 className="font-serif text-xl mb-4">Main colors</h2><Bars rows={ins.byColor.slice(0, 8)} /></section>
        <section className={card}>
          <h2 className="font-serif text-xl mb-2">Most worn</h2>
          {ins.hasWearData ? <ul className="divide-y divide-line">{ins.mostWorn.map((i) => <ItemRow key={i.id} it={i} right={`${i.wearCount}×`} />)}</ul>
            : <p className="text-sm text-mute">No wears logged yet. Mark a planned look as worn, or tap “I wore it today” on a piece.</p>}
        </section>
        <section className={card}>
          <h2 className="font-serif text-xl mb-2">Waiting to be worn</h2>
          <ul className="divide-y divide-line">{ins.leastWorn.map((i) => <ItemRow key={i.id} it={i} right={i.wearCount ? `${i.wearCount}×` : 'not yet'} />)}</ul>
          <Button variant="secondary" className="mt-4" onClick={() => go(`stylist?anchor=${ins.leastWorn[0].id}`)}>Style “{ins.leastWorn[0].name}”</Button>
        </section>
        <section className={card}>
          <h2 className="font-serif text-xl mb-2">Cost per wear</h2>
          {ins.cpwEligible ? (
            <ul className="divide-y divide-line">{ins.costPerWear.slice(0, 5).map(({ item, cpw }) => <ItemRow key={item.id} it={item} right={`$${cpw.toFixed(2)} / wear`} />)}</ul>
          ) : <p className="text-sm text-mute">Add a price to a piece and log some wears to see this.</p>}
        </section>
        <section className={card}>
          <h2 className="font-serif text-xl mb-2">Gaps that would unlock more outfits</h2>
          {gaps.length ? <ul className="text-sm space-y-2">{gaps.map((g) => <li key={g}>· {g}</li>)}</ul> : <p className="text-sm text-mute">No obvious gaps — your basics cover full outfits.</p>}
          <p className="text-xs text-mute mt-3">Based on your categories only. We never invent products.</p>
        </section>
        {ins.repeats.length > 0 && (
          <section className={card}>
            <h2 className="font-serif text-xl mb-2">Looks you repeat</h2>
            <ul className="divide-y divide-line text-sm">{ins.repeats.map((r) => <li key={r.outfit.id} className="flex justify-between py-2"><span>{r.outfit.name}</span><span className="text-mute">{r.times}× worn</span></li>)}</ul>
          </section>
        )}
        {ins.favoriteOutfits.length > 0 && (
          <section className={card}>
            <h2 className="font-serif text-xl mb-2">Favorite looks</h2>
            <ul className="divide-y divide-line text-sm">{ins.favoriteOutfits.map((o) => <li key={o.id}><a className="block py-2 hover:underline" href={href(`studio/${o.id}`)}>{o.name}</a></li>)}</ul>
          </section>
        )}
      </div>
    </>
  );
}
