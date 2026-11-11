/**
 * Optional bridge from the StyleDNA Fashion Personality Test.
 * The user pastes their own result link (e.g. .../result?type=visionary&e=75&x=83&i=75&d=83&s=75).
 * Nothing is fetched or scraped: we only read the numbers in the link the user gives us.
 * The result becomes an editable STARTING POINT, never a fixed identity.
 */
import type { Occasion, Profile, QuizResult } from './types';

export const QUIZ_URL = 'https://style-dna-zeta.vercel.app/test';
export const QUIZ_TYPES: Record<string, { label: string; line: string }> = {
  curator: { label: 'The Curator', line: 'Less, but intentional.' },
  visionary: { label: 'The Visionary', line: "Wear what hasn't been defined yet." },
  icon: { label: 'The Icon', line: 'Make it recognizable.' },
  explorer: { label: 'The Explorer', line: 'Always something new.' },
  original: { label: 'The Original', line: 'There is no template for me.' },
  editor: { label: 'The Editor', line: 'Every detail has a purpose.' },
  'free-spirit': { label: 'The Free Spirit', line: 'Style should feel like freedom.' },
  freespirit: { label: 'The Free Spirit', line: 'Style should feel like freedom.' },
  adapter: { label: 'The Adapter', line: 'Make the trend yours.' },
};

export function parseQuizLink(input: string): QuizResult | { error: string } {
  let url: URL;
  try { url = new URL(input.trim()); } catch { return { error: 'That doesn’t look like a link. Copy the full address of your result page.' }; }
  if (!/style-dna/i.test(url.hostname)) return { error: 'Use the link from your StyleDNA test result page.' };
  const p = url.searchParams;
  const num = (k: string) => { const v = Number(p.get(k)); return Number.isFinite(v) && v >= 0 && v <= 100 ? v : NaN; };
  const scores = { expression: num('e'), experimentation: num('x'), impact: num('i'), individuality: num('d'), structure: num('s') };
  const type = (p.get('type') ?? '').toLowerCase();
  if (!type || Object.values(scores).some(Number.isNaN)) return { error: 'This link has no result in it. Open your result page after finishing the test and copy that link.' };
  return { type, scores, importedAt: new Date().toISOString() };
}

/** Suggested (editable) preferences derived from the five dimension scores. */
export function suggestFromQuiz(q: QuizResult): Pick<Profile, 'aesthetics' | 'explore'> & { occasions: Occasion[]; why: string[] } {
  const s = q.scores; const aest = new Set<string>(); const why: string[] = [];
  if (s.expression < 40) { aest.add('Minimal'); why.push('Lower Expression → minimal pieces'); }
  if (s.expression > 65) { aest.add('Bold'); why.push('High Expression → statement pieces'); }
  if (s.structure > 60) { aest.add('Tailored'); aest.add('Classic'); why.push('High Structure → tailored, put-together looks'); }
  if (s.structure < 40) { aest.add('Relaxed'); why.push('Lower Structure → relaxed, effortless looks'); }
  if (s.impact < 40) { aest.add('Sporty'); why.push('Comfort-first Impact → easy, comfortable pieces'); }
  if (s.individuality > 70) { aest.add('Artsy'); why.push('High Individuality → personal, unexpected mixes'); }
  if (s.experimentation > 70) { aest.add('Edgy'); why.push('High Experimentation → newer silhouettes'); }
  if (s.experimentation < 35) { aest.add('Classic'); why.push('Lower Experimentation → timeless pieces'); }
  const explore: 0 | 1 | 2 = s.experimentation > 70 ? 2 : s.experimentation < 35 ? 0 : 1;
  const occasions: Occasion[] = s.impact > 65 ? ['Evening'] : ['Everyday'];
  return { aesthetics: [...aest].slice(0, 4), explore, occasions, why };
}
