import { useState } from 'react';
import { Button, ChipSelect, Field, PageHead, inputCls } from '../components/ui';
import { useStore } from '../lib/store';
import { AESTHETICS, COLOR_NAMES, OCCASIONS } from '../lib/taxonomy';
import { parseQuizLink, QUIZ_TYPES, QUIZ_URL, suggestFromQuiz } from '../lib/quiz';
import type { Occasion } from '../lib/types';

const EXPLORE = ['Stay close to my style', 'Some variety', 'Stretch me'] as const;

export default function ProfilePage() {
  const s = useStore();
  const p = s.profile;
  const [link, setLink] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const quiz = p.quiz;
  const quizSuggest = quiz ? suggestFromQuiz(quiz) : null;

  const importQuiz = async () => {
    const r = parseQuizLink(link);
    if ('error' in r) { setErr(r.error); return; }
    setErr(null);
    const sug = suggestFromQuiz(r);
    await s.updateProfile({
      quiz: r,
      aesthetics: [...new Set([...p.aesthetics, ...sug.aesthetics])],
      occasions: p.occasions.length ? p.occasions : sug.occasions,
      explore: sug.explore,
    });
    setLink(''); s.toast('Imported. These are starting points — change anything below.');
  };

  return (
    <>
      <PageHead eyebrow="Style profile" title={<>What <em className="text-olive">you</em> like</>}
        sub="Everything here is optional and yours to change. It nudges suggestions — it never limits what you can wear." />
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="space-y-8 rounded-3xl bg-paper border border-line p-6 sm:p-8">
          <Field label="Styles you’re drawn to"><ChipSelect label="Styles" small options={AESTHETICS} value={p.aesthetics} onChange={(v) => s.updateProfile({ aesthetics: v })} /></Field>
          <Field label="Colors you love"><ChipSelect label="Favorite colors" small swatches options={COLOR_NAMES} value={p.favoriteColors} onChange={(v) => s.updateProfile({ favoriteColors: v, avoidColors: p.avoidColors.filter((c) => !v.includes(c)) })} /></Field>
          <Field label="Colors to skip in suggestions" hint="Pieces in these colors stay in your closet; they’re just not suggested unless you pick them."><ChipSelect label="Avoid colors" small swatches options={COLOR_NAMES} value={p.avoidColors} onChange={(v) => s.updateProfile({ avoidColors: v, favoriteColors: p.favoriteColors.filter((c) => !v.includes(c)) })} /></Field>
          <Field label="What you dress for most"><ChipSelect<Occasion> label="Occasions" small options={OCCASIONS} value={p.occasions} onChange={(v) => s.updateProfile({ occasions: v })} /></Field>
          <Field label="How adventurous should suggestions be?">
            <ChipSelect label="Exploration" multi={false} small options={EXPLORE} value={[EXPLORE[p.explore]]} onChange={([v]) => s.updateProfile({ explore: EXPLORE.indexOf(v as typeof EXPLORE[number]) as 0 | 1 | 2 })} />
          </Field>
          <p className="text-xs text-mute">Your thumbs up/down on suggestions also teach the stylist: {s.feedback.filter((f) => f.verdict === 'up').length} liked · {s.feedback.filter((f) => f.verdict === 'down').length} skipped.</p>
        </div>

        <aside className="rounded-3xl bg-ink text-cream p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime">Optional · StyleDNA quiz</p>
          {quiz ? (
            <>
              <p className="font-serif text-3xl mt-2">{QUIZ_TYPES[quiz.type]?.label ?? quiz.type}</p>
              <p className="text-cream/70 text-sm italic">{QUIZ_TYPES[quiz.type]?.line}</p>
              <ul className="mt-4 text-sm space-y-1.5">
                {Object.entries(quiz.scores).map(([k, v]) => (
                  <li key={k} className="grid grid-cols-[120px_1fr_32px] items-center gap-2 capitalize">
                    <span className="text-cream/80">{k}</span><span className="h-1.5 rounded-full bg-cream/20"><span className="block h-full rounded-full bg-lime" style={{ width: `${v}%` }} /></span><span className="text-right tabular-nums">{v}</span>
                  </li>
                ))}
              </ul>
              {quizSuggest && quizSuggest.why.length > 0 && <div className="mt-4 text-xs text-cream/70 space-y-1">{quizSuggest.why.map((w) => <p key={w}>· {w}</p>)}</div>}
              <p className="mt-4 text-xs text-cream/70">This shaped your starting preferences. It isn’t a fixed identity — edit anything on the left, or remove it.</p>
              <Button variant="secondary" className="mt-4 h-9" onClick={() => s.updateProfile({ quiz: undefined })}>Remove quiz result</Button>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl mt-2">Already took the StyleDNA test?</p>
              <p className="text-sm text-cream/70 mt-2">Paste the link from your result page to pre-fill your preferences. Nothing is fetched — we only read the scores in the link.</p>
              <label className="block mt-4"><span className="sr-only">StyleDNA result link</span>
                <input className={`${inputCls} text-ink`} placeholder="https://style-dna-zeta.vercel.app/result?..." value={link} onChange={(e) => setLink(e.target.value)} />
              </label>
              {err && <p className="text-sm text-[#ffb4a8] mt-2" role="alert">{err}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="lime" onClick={importQuiz} disabled={!link.trim()}>Import result</Button>
                <a href={QUIZ_URL} target="_blank" rel="noreferrer" className="inline-flex items-center h-11 px-4 text-sm underline">Take the test ↗</a>
              </div>
              <p className="mt-4 text-xs text-cream/60">Skipping this is fine — the closet works the same without it.</p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
