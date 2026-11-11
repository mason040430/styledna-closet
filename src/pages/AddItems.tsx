import { useEffect, useRef, useState } from 'react';
import { Button, PageHead, go } from '../components/ui';
import { ItemForm, type ItemMeta } from '../components/ItemForm';
import { useStore } from '../lib/store';
import { prepareImage, validateFile, type Analysis } from '../lib/vision';
import { SUBCATEGORIES } from '../lib/taxonomy';

interface Draft {
  key: string; file: File; status: 'processing' | 'ready' | 'error' | 'saved';
  error?: string; original?: Blob; cutout?: Blob; analysis?: Analysis; meta?: ItemMeta;
  previewOriginal?: string; previewCutout?: string;
}

const MAX_BATCH = 30;

function metaFrom(a: Analysis | undefined, fallbackName: string): ItemMeta {
  const category = a?.category ?? 'Tops';
  return {
    name: a?.name ? a.name.charAt(0).toUpperCase() + a.name.slice(1) : fallbackName,
    category, subcategory: a?.subcategory ?? SUBCATEGORIES[category].at(-1)!, colors: a?.colors ?? ['Black'],
    pattern: a?.pattern ?? 'Solid', material: a?.material ?? 'Unsure', styleTags: a?.styleTags ?? [], seasons: a?.seasons ?? [],
    occasions: ['Everyday'], customTags: [], favorite: false, useCutout: Boolean(a?.backgroundRemoved),
  };
}

export default function AddItems() {
  const s = useStore();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [drag, setDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const update = (key: string, patch: Partial<Draft>) => setDrafts((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  useEffect(() => () => drafts.forEach((d) => { if (d.previewOriginal) URL.revokeObjectURL(d.previewOriginal); if (d.previewCutout) URL.revokeObjectURL(d.previewCutout); }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  async function accept(files: FileList | File[]) {
    const list = Array.from(files).slice(0, MAX_BATCH);
    if (files.length > MAX_BATCH) s.toast(`Adding the first ${MAX_BATCH} photos. Add the rest in another batch.`);
    const fresh: Draft[] = list.map((file, n) => ({ key: `${Date.now()}-${n}-${file.name}`, file, status: 'processing' }));
    setDrafts((d) => [...fresh, ...d.filter((x) => x.status !== 'saved')]);
    for (const d of fresh) {
      const bad = validateFile(d.file);
      if (bad) { update(d.key, { status: 'error', error: bad }); continue; }
      try {
        const p = await prepareImage(d.file);
        update(d.key, { status: 'ready', ...p, meta: metaFrom(p.analysis, 'New piece'), previewOriginal: URL.createObjectURL(p.original), previewCutout: p.cutout ? URL.createObjectURL(p.cutout) : undefined });
      } catch (e) {
        // analysis failed — still let the user save the photo with manual details if the browser can show it
        try {
          await createImageBitmap(d.file);
          update(d.key, { status: 'ready', original: d.file, meta: metaFrom(undefined, d.file.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'New piece'), previewOriginal: URL.createObjectURL(d.file),
            analysis: undefined, error: 'Smart suggestions were unavailable for this photo. Fill in the details below.' });
        } catch {
          update(d.key, { status: 'error', error: e instanceof Error ? e.message : 'This photo could not be opened. Try a JPG or PNG.' });
        }
      }
    }
  }

  async function saveOne(d: Draft) {
    if (!d.original || !d.meta) return;
    if (!d.meta.name.trim()) { s.toast('Give this piece a name first.', 'error'); return; }
    const { useCutout, ...meta } = d.meta;
    await s.addItem({ ...meta, name: meta.name.trim(), useCutout: Boolean(useCutout && d.cutout), original: d.original, cutout: d.cutout });
    update(d.key, { status: 'saved' });
  }
  async function saveAll() {
    setSaving(true);
    let n = 0;
    for (const d of drafts.filter((x) => x.status === 'ready')) { try { await saveOne(d); n++; } catch { /* toast already shown */ } }
    setSaving(false);
    if (n) s.toast(`${n} piece${n > 1 ? 's' : ''} added to your closet.`);
  }

  const processing = drafts.filter((d) => d.status === 'processing').length;
  const ready = drafts.filter((d) => d.status === 'ready');
  const savedCount = drafts.filter((d) => d.status === 'saved').length;
  const total = drafts.length;

  return (
    <>
      <PageHead eyebrow="Add items" title={<>Snap, check, <em className="text-olive">done</em></>}
        sub="Add one or many photos. We suggest colors, pattern and a cleaner background on your device — you confirm the rest." />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void accept(e.dataTransfer.files); }}
        className={`rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${drag ? 'border-ink bg-sage/60' : 'border-line bg-paper/70'}`}>
        <p className="font-serif text-2xl">Drop photos here</p>
        <p className="text-sm text-mute mt-1">JPG, PNG, WebP or HEIC · up to 20 MB each · up to {MAX_BATCH} at once</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => fileRef.current?.click()}>Choose photos</Button>
          <Button variant="secondary" onClick={() => camRef.current?.click()} className="sm:hidden">Take a photo</Button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple className="sr-only" aria-label="Choose clothing photos" data-testid="file-input"
          onChange={(e) => { if (e.target.files?.length) void accept(e.target.files); e.target.value = ''; }} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take a clothing photo"
          onChange={(e) => { if (e.target.files?.length) void accept(e.target.files); e.target.value = ''; }} />
        <p className="text-xs text-mute mt-6">Tip: lay the piece flat or hang it against a plain wall for the cleanest result.</p>
      </div>

      {total > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm" aria-live="polite">{processing ? `Reading ${processing} photo${processing > 1 ? 's' : ''}…` : `${ready.length} to review · ${savedCount} saved`}</p>
              <div className="h-1.5 rounded-full bg-line mt-2 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={total - processing} aria-label="Photo processing progress">
                <div className="h-full bg-ink transition-all" style={{ width: `${((total - processing) / total) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-3">
              {savedCount > 0 && <Button variant="secondary" onClick={() => go('closet')}>View closet</Button>}
              {ready.length > 1 && <Button onClick={saveAll} disabled={saving || processing > 0}>Save all {ready.length}</Button>}
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {drafts.map((d) => (
              <article key={d.key} className={`rounded-3xl bg-paper shadow-card p-4 sm:p-6 ${d.status === 'saved' ? 'opacity-70' : ''}`} aria-label={`Photo ${d.file.name}`}>
                {d.status === 'processing' && <p className="text-sm text-mute animate-pulse">Reading “{d.file.name}”…</p>}
                {d.status === 'error' && (
                  <div className="flex items-center justify-between gap-4" role="alert">
                    <p className="text-sm text-danger">{d.error}</p>
                    <button className="text-sm underline" onClick={() => setDrafts((x) => x.filter((y) => y.key !== d.key))}>Dismiss</button>
                  </div>
                )}
                {d.status === 'saved' && <p className="text-sm">✓ Saved <b>{d.meta?.name}</b></p>}
                {d.status === 'ready' && d.meta && (
                  <div className="grid md:grid-cols-[260px_1fr] gap-6">
                    <div>
                      <div className="aspect-[4/5] rounded-2xl bg-[#ECE8DE] overflow-hidden grid place-items-center">
                        <img src={d.meta.useCutout && d.previewCutout ? d.previewCutout : d.previewOriginal} alt={`Preview of ${d.meta.name}`} className="max-h-full max-w-full object-contain p-3" />
                      </div>
                      {d.previewCutout && (
                        <div className="mt-3 flex gap-2 text-xs" role="group" aria-label="Photo version">
                          <button className={`flex-1 h-8 rounded-full border ${d.meta.useCutout ? 'bg-ink text-cream border-ink' : 'border-line'}`} onClick={() => update(d.key, { meta: { ...d.meta!, useCutout: true } })}>Clean background</button>
                          <button className={`flex-1 h-8 rounded-full border ${!d.meta.useCutout ? 'bg-ink text-cream border-ink' : 'border-line'}`} onClick={() => update(d.key, { meta: { ...d.meta!, useCutout: false } })}>Original</button>
                        </div>
                      )}
                      <div className="mt-3 rounded-xl bg-sage/60 p-3 text-xs space-y-1">
                        <p className="font-semibold text-olive uppercase tracking-[0.14em] text-[10px]">Suggested on your device</p>
                        {d.analysis ? (
                          <>
                            <p>Colors: {d.analysis.colors.join(', ')} · Pattern: {d.analysis.pattern}</p>
                            {d.analysis.notes.map((n) => <p key={n} className="text-mute">{n}</p>)}
                          </>
                        ) : <p className="text-mute">{d.error}</p>}
                        <p className="text-mute">Please check everything — suggestions can be wrong.</p>
                      </div>
                    </div>
                    <div>
                      <ItemForm compact value={d.meta} onChange={(m) => update(d.key, { meta: m })} />
                      <div className="mt-6 flex gap-3">
                        <Button onClick={() => saveOne(d).then(() => s.toast('Added to your closet.')).catch(() => undefined)}>Save piece</Button>
                        <Button variant="ghost" onClick={() => setDrafts((x) => x.filter((y) => y.key !== d.key))}>Discard</Button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
