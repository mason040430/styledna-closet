import { useMemo, useState } from 'react';
import { Button, EmptyState, OutfitBoard, PageHead, Stat, go } from '../components/ui';
import { SuggestionCard } from '../components/SuggestionCard';
import { useStore, todayYmd } from '../lib/store';
import { recommend } from '../lib/recommend';
import type { Season } from '../lib/types';
import { QUIZ_TYPES } from '../lib/quiz';

export const currentSeason = (d = new Date()): Season => (['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'] as Season[])[d.getMonth()];

export default function Home() {
  const s = useStore();
  const [seed, setSeed] = useState(Number(todayYmd().replace(/-/g, '')));
  const today = todayYmd();
  const season = currentSeason();
  const rec = useMemo(() => recommend(s.items, s.profile, s.feedback, s.outfits, { season, count: 1, seed, occasion: s.profile.occasions[0] }), [s.items, s.profile, s.feedback, s.outfits, season, seed]);
  const plan = s.plans.find((p) => p.date === today);
  const planned = plan && s.outfits.find((o) => o.id === plan.outfitId);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (s.items.length === 0) {
    return (
      <>
        <PageHead eyebrow="Welcome" title={<>Let’s build your <em className="text-olive">closet</em></>} sub="Start with five to ten pieces you wear often. You can add more any time." />
        <EmptyState title="Your closet is empty" body="Add a few photos — a top, a bottom and a pair of shoes are enough for your first outfit ideas."
          action={<><Button onClick={() => go('add')}>Add my first pieces</Button><Button variant="secondary" onClick={() => s.enter('demo')}>Look around the demo</Button></>} />
      </>
    );
  }
  return (
    <>
      <PageHead eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} title={<>{hello}.</>}
        sub={planned ? 'Your planned look is ready.' : `Here is one idea for ${season.toLowerCase()}, built from your closet.`} />
      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8">
        <section aria-labelledby="today-h">
          <h2 id="today-h" className="font-serif text-2xl mb-4">{planned ? 'Planned for today' : 'Today’s idea'}</h2>
          {planned ? (
            <div className="rounded-3xl bg-paper shadow-card overflow-hidden">
              <OutfitBoard items={planned.itemIds.map((id) => s.items.find((i) => i.id === id)!).filter(Boolean)} />
              <div className="p-5 flex flex-wrap gap-3 items-center">
                <p className="font-serif text-xl mr-auto">{planned.name}</p>
                <Button variant={plan!.worn ? 'secondary' : 'lime'} onClick={() => s.markWorn(today, !plan!.worn)}>{plan!.worn ? '✓ Worn today' : 'I wore this'}</Button>
              </div>
            </div>
          ) : rec.suggestions[0] ? (
            <SuggestionCard key={rec.suggestions[0].key} s={rec.suggestions[0]} onSwap={() => setSeed((x) => x + 1)} />
          ) : (
            <EmptyState title="Almost there" body={rec.problems.join(' ')} action={<Button onClick={() => go('add')}>Add pieces</Button>} />
          )}
        </section>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-ink text-cream p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime">Ask the stylist</p>
            <p className="font-serif text-2xl mt-2">“What can I wear with my boots?”</p>
            <p className="text-sm text-cream/70 mt-2">Type a request in your own words. Every answer uses only your clothes.</p>
            <Button variant="lime" className="mt-5" onClick={() => go('stylist')}>Open Stylist</Button>
          </div>
          <div className="rounded-3xl bg-paper border border-line p-6 grid grid-cols-3 gap-4">
            <Stat value={s.items.length} label="Pieces" />
            <Stat value={s.outfits.length} label="Saved looks" />
            <Stat value={s.plans.filter((p) => p.date >= today).length} label="Planned" />
          </div>
          <div className="rounded-3xl bg-sage/70 p-6">
            {s.profile.quiz ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-olive">From your StyleDNA result</p>
                <p className="font-serif text-2xl mt-1">{QUIZ_TYPES[s.profile.quiz.type]?.label ?? s.profile.quiz.type}</p>
                <p className="text-sm text-mute mt-1">A starting point, not a rule. Tune it any time.</p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-olive">Optional</p>
                <p className="font-serif text-xl mt-1">Tell us what you like</p>
                <p className="text-sm text-mute mt-1">Pick a few styles and colors — or import your StyleDNA quiz result. Suggestions work without it.</p>
              </>
            )}
            <Button variant="secondary" className="mt-4" onClick={() => go('profile')}>{s.profile.quiz || s.profile.aesthetics.length ? 'Edit preferences' : 'Set preferences'}</Button>
          </div>
        </aside>
      </div>
    </>
  );
}
