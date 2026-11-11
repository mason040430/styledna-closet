import { useEffect, useMemo, useState } from 'react';
import { Button, Chip, EmptyState, PageHead, go, inputCls, query } from '../components/ui';
import { SuggestionCard } from '../components/SuggestionCard';
import { useStore } from '../lib/store';
import { parsePrompt, SUGGESTED_PROMPTS } from '../lib/prompt';
import { recommend, type RecRequest } from '../lib/recommend';
import { OCCASIONS, SEASONS } from '../lib/taxonomy';
import type { Occasion, Season } from '../lib/types';
import { currentSeason } from './Home';

export default function Stylist() {
  const s = useStore();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [season, setSeason] = useState<Season | undefined>(currentSeason());
  const [occasion, setOccasion] = useState<Occasion | undefined>();
  const [stretch, setStretch] = useState(false);
  const [anchor, setAnchor] = useState<string[]>([]);
  const [seed, setSeed] = useState(11);

  useEffect(() => { const a = query().get('anchor'); if (a && s.items.some((i) => i.id === a)) { setAnchor([a]); setSeason(undefined); } }, [s.items]);

  const parsed = useMemo(() => parsePrompt(submitted, s.items), [submitted, s.items]);
  const req: RecRequest = useMemo(() => ({
    ...parsed.req,
    season: parsed.req.season ?? season,
    occasion: parsed.req.occasion ?? occasion,
    stretch: parsed.req.stretch || stretch || undefined,
    anchorIds: parsed.req.anchorIds ?? (anchor.length ? anchor : undefined),
    count: parsed.req.count ?? 3,
    seed,
  }), [parsed, season, occasion, stretch, anchor, seed]);
  const res = useMemo(() => recommend(s.items, s.profile, s.feedback, s.outfits, req), [s.items, s.profile, s.feedback, s.outfits, req]);
  const anchorItems = (req.anchorIds ?? []).map((id) => s.items.find((i) => i.id === id)).filter(Boolean);

  const ask = (t: string) => {
    setText(t); setSubmitted(t); setSeed((x) => x + 1);
    const p = parsePrompt(t, s.items);
    if (p.req.season) setSeason(p.req.season);
    if (p.req.occasion) setOccasion(p.req.occasion);
    if (!p.req.anchorIds) setAnchor([]);
  };

  if (s.items.length === 0) return <EmptyState title="Your stylist needs a closet" body="Add a few pieces first — every suggestion uses only clothes you own." action={<Button onClick={() => go('add')}>Add items</Button>} />;

  return (
    <>
      <PageHead eyebrow="Stylist" title={<>What should I <em className="text-olive">wear</em>?</>}
        sub="Ask in your own words. Suggestions use only your clothes, explain why they work, and learn from your thumbs up or down." />
      <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex gap-3">
        <label className="flex-1"><span className="sr-only">Describe what you need</span>
          <input className={`${inputCls} h-12 text-base`} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. a casual outfit for class" maxLength={160} />
        </label>
        <Button type="submit" className="h-12">Style me</Button>
      </form>
      <div className="mt-3 flex gap-2 flex-wrap">
        {SUGGESTED_PROMPTS.map((p) => <Chip key={p} small onClick={() => ask(p)}>{p}</Chip>)}
      </div>

      <div className="mt-6 rounded-2xl bg-paper border border-line p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-mute w-16">Season</span>
          <Chip small active={!season} onClick={() => setSeason(undefined)}>Any</Chip>
          {SEASONS.map((x) => <Chip key={x} small active={season === x} onClick={() => setSeason(x)}>{x}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-mute w-16">For</span>
          <Chip small active={!occasion} onClick={() => setOccasion(undefined)}>Anything</Chip>
          {OCCASIONS.map((x) => <Chip key={x} small active={occasion === x} onClick={() => setOccasion(x)}>{x}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-mute w-16">Mood</span>
          <Chip small active={!stretch} onClick={() => setStretch(false)}>My style</Chip>
          <Chip small active={stretch} onClick={() => setStretch(true)}>Try something new</Chip>
        </div>
        {anchorItems.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-mute w-16">Built on</span>
            {anchorItems.map((i) => <Chip key={i!.id} small active onClick={() => { setAnchor([]); setSubmitted(''); }}>{i!.name} ×</Chip>)}
          </div>
        )}
      </div>

      {submitted && parsed.understood.length > 0 && <p className="mt-4 text-sm text-mute">I read: {parsed.understood.join(' · ')}</p>}
      {submitted && parsed.understood.length === 0 && <p className="mt-4 text-sm text-mute">I didn’t catch specific details, so here are balanced looks for the filters above.</p>}
      {res.problems.length > 0 && <div className="mt-4 rounded-2xl bg-sage/60 px-4 py-3 text-sm" role="status">{res.problems.map((p) => <p key={p}>{p}</p>)}</div>}

      <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {res.suggestions.map((sg) => <SuggestionCard key={sg.key + seed} s={sg} />)}
      </div>
      {res.suggestions.length > 0 && <div className="mt-6 text-center"><Button variant="secondary" onClick={() => setSeed((x) => x + 1)}>Show different looks</Button></div>}
      {res.suggestions.length === 0 && !res.problems.length && <p className="mt-6 text-mute">No looks match these filters. Try “Any” season.</p>}
    </>
  );
}
