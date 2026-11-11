import { useState } from 'react';
import { Button, OutfitBoard, go } from './ui';
import { useStore } from '../lib/store';
import type { Suggestion } from '../lib/recommend';

export function SuggestionCard({ s, onSwap, title }: { s: Suggestion; onSwap?: () => void; title?: string }) {
  const store = useStore();
  const items = s.itemIds.map((id) => store.items.find((i) => i.id === id)!).filter(Boolean);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const vote = async (v: 'up' | 'down') => {
    if (voted) return;
    setVoted(v); await store.addFeedback(s.itemIds, v);
    store.toast(v === 'up' ? 'Noted — more like this.' : 'Got it — fewer looks like this.');
  };
  const save = async () => {
    const o = await store.saveOutfit({ name: title ?? `Look · ${items.slice(0, 2).map((i) => i.name.split(' ').slice(-1)[0]).join(' + ')}`, itemIds: s.itemIds, source: 'suggested' });
    setSavedId(o.id); if (!voted) { setVoted('up'); await store.addFeedback(s.itemIds, 'up'); }
    store.toast('Saved to your looks.');
  };
  return (
    <article className="rounded-3xl bg-paper shadow-card overflow-hidden fade-in">
      <OutfitBoard items={items} />
      <div className="p-5">
        {s.stretch && <span className="inline-block mb-2 text-[10px] font-bold tracking-[0.14em] bg-lime px-2 py-1 rounded-full">STRETCH LOOK</span>}
        <ul className="text-sm space-y-1.5">
          {items.map((i) => <li key={i.id} className="flex justify-between gap-3"><span className="truncate">{i.name}</span><span className="text-mute shrink-0">{i.category === 'Dresses' ? 'Dress' : i.category}</span></li>)}
        </ul>
        <div className="mt-4 rounded-2xl bg-sage/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-olive">Why this works</p>
          <ul className="mt-1.5 text-sm space-y-1">{(s.reasons.length ? s.reasons : ['A complete look from pieces you own']).map((r) => <li key={r}>· {r}</li>)}</ul>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {savedId ? <Button variant="secondary" onClick={() => go(`studio/${savedId}`)}>Open look</Button> : <Button onClick={save}>Save look</Button>}
          <Button variant="secondary" onClick={() => go(`studio?items=${s.itemIds.join(',')}`)}>Edit</Button>
          {onSwap && <Button variant="ghost" onClick={onSwap}>Show another</Button>}
          <div className="ml-auto flex gap-1" role="group" aria-label="Was this suggestion useful?">
            <button onClick={() => vote('up')} disabled={!!voted} aria-pressed={voted === 'up'} aria-label="Useful — more like this"
              className={`h-10 w-10 rounded-full border text-lg ${voted === 'up' ? 'bg-ink text-lime border-ink' : 'border-line hover:border-ink'}`}>↑</button>
            <button onClick={() => vote('down')} disabled={!!voted} aria-pressed={voted === 'down'} aria-label="Not for me — fewer like this"
              className={`h-10 w-10 rounded-full border text-lg ${voted === 'down' ? 'bg-ink text-cream border-ink' : 'border-line hover:border-ink'}`}>↓</button>
          </div>
        </div>
      </div>
    </article>
  );
}
