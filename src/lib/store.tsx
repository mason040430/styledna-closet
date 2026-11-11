import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createLocalRepo, nowIso, uid, type Repo, type Workspace } from './db';
import { buildDemo } from './demo';
import { emptyProfile, type FeedbackEntry, type Item, type Outfit, type Plan, type Profile, type Snapshot } from './types';

export const todayYmd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const WS_KEY = 'sdna-closet-workspace';
const readWs = (): Workspace | null => { try { const v = localStorage.getItem(WS_KEY); return v === 'mine' || v === 'demo' ? v : null; } catch { return null; } };
const writeWs = (w: Workspace) => { try { localStorage.setItem(WS_KEY, w); } catch { /* storage unavailable */ } };

export interface NewItemInput extends Omit<Item, 'id' | 'images' | 'createdAt' | 'updatedAt' | 'wearCount' | 'favorite' | 'customTags'> {
  original: Blob; cutout?: Blob; customTags?: string[]; favorite?: boolean;
}

interface Toast { id: number; text: string; tone: 'ok' | 'error' }

interface Store extends Snapshot {
  ready: boolean;
  workspace: Workspace | null;
  error: string | null;
  enter(w: Workspace): Promise<void>;
  exit(): void;
  imageUrl(id?: string): string | undefined;
  addItem(input: NewItemInput): Promise<Item>;
  updateItem(item: Item): Promise<void>;
  deleteItem(id: string): Promise<void>;
  addImageToItem(itemId: string, blob: Blob): Promise<void>;
  saveOutfit(o: Partial<Outfit> & { itemIds: string[]; name: string }): Promise<Outfit>;
  deleteOutfit(id: string): Promise<void>;
  duplicateOutfit(id: string): Promise<Outfit | undefined>;
  setPlan(date: string, outfitId: string): Promise<void>;
  removePlan(date: string): Promise<void>;
  markWorn(date: string, worn: boolean): Promise<void>;
  updateProfile(p: Partial<Profile>): Promise<void>;
  addFeedback(itemIds: string[], verdict: 'up' | 'down'): Promise<void>;
  resetDemo(): Promise<void>;
  clearWorkspace(): Promise<void>;
  exportData(): Promise<Blob>;
  toast(text: string, tone?: 'ok' | 'error'): void;
  toasts: Toast[];
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => { const s = useContext(Ctx); if (!s) throw new Error('StoreProvider missing'); return s; };

const empty: Snapshot = { items: [], outfits: [], plans: [], profile: emptyProfile, feedback: [] };

async function seedDemo(repo: Repo) {
  const demo = buildDemo();
  for (const i of demo.images) await repo.putImage(i.id, i.blob);
  for (const it of demo.items) await repo.putItem(it);
  for (const o of demo.outfits) await repo.putOutfit(o);
  for (const p of demo.plans) await repo.putPlan(p);
  await repo.putProfile({ ...emptyProfile, aesthetics: ['Minimal', 'Classic'], favoriteColors: ['Black', 'Cream'], occasions: ['Class', 'Everyday'] });
  await repo.markSeeded();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(readWs);
  const [snap, setSnap] = useState<Snapshot>(empty);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const repoRef = useRef<Repo | null>(null);
  const snapRef = useRef(snap); snapRef.current = snap;

  const toast = useCallback((text: string, tone: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const loadImages = useCallback(async (repo: Repo, items: Item[]) => {
    const next: Record<string, string> = {};
    for (const it of items) for (const img of it.images) for (const k of [img.id, img.cutoutId]) {
      if (!k) continue; const b = await repo.getImage(k); if (b) next[k] = URL.createObjectURL(b);
    }
    setUrls((old) => { Object.values(old).forEach((u) => URL.revokeObjectURL(u)); return next; });
  }, []);

  const open = useCallback(async (w: Workspace) => {
    setReady(false); setError(null);
    try {
      const repo = createLocalRepo(w); repoRef.current = repo;
      if (w === 'demo' && !(await repo.isSeeded())) await seedDemo(repo);
      const s = await repo.load();
      await loadImages(repo, s.items);
      setSnap(s);
    } catch (e) {
      setError('Your browser blocked local storage (private mode can do this). The closet cannot save here.');
      console.error(e);
    }
    setReady(true);
  }, [loadImages]);

  useEffect(() => { if (workspace) void open(workspace); else setReady(true); }, [workspace, open]);

  const repo = () => { if (!repoRef.current) throw new Error('No workspace open'); return repoRef.current; };
  const guard = async <T,>(fn: () => Promise<T>, failMsg: string): Promise<T> => {
    try { return await fn(); } catch (e) {
      const quota = e instanceof DOMException && e.name === 'QuotaExceededError';
      toast(quota ? 'Your browser storage is full. Export a backup and remove some photos.' : failMsg, 'error');
      throw e;
    }
  };

  const store: Store = useMemo(() => ({
    ...snap, ready, workspace, error, toasts, toast,
    async enter(w) { writeWs(w); setWorkspace(w); },
    exit() { try { localStorage.removeItem(WS_KEY); } catch { /* ignore */ } setWorkspace(null); setSnap(empty); },
    imageUrl: (id) => (id ? urls[id] : undefined),
    async addItem(input) {
      return guard(async () => {
        const r = repo(); const t = nowIso();
        const imgId = uid(); await r.putImage(imgId, input.original);
        let cutoutId: string | undefined;
        if (input.cutout) { cutoutId = uid(); await r.putImage(cutoutId, input.cutout); }
        const { original: _o, cutout: _c, ...meta } = input;
        const item: Item = { ...meta, id: uid(), images: [{ id: imgId, cutoutId }], customTags: input.customTags ?? [], favorite: input.favorite ?? false, wearCount: 0, createdAt: t, updatedAt: t };
        await r.putItem(item);
        setUrls((u) => ({ ...u, [imgId]: URL.createObjectURL(input.original), ...(cutoutId && input.cutout ? { [cutoutId]: URL.createObjectURL(input.cutout) } : {}) }));
        setSnap((s) => ({ ...s, items: [...s.items, item] }));
        try { void navigator.storage?.persist?.(); } catch { /* optional */ }
        return item;
      }, 'Could not save this item. Please try again.');
    },
    async updateItem(item) {
      await guard(async () => { const it = { ...item, updatedAt: nowIso() }; await repo().putItem(it); setSnap((s) => ({ ...s, items: s.items.map((x) => (x.id === it.id ? it : x)) })); }, 'Could not save changes.');
    },
    async addImageToItem(itemId, blob) {
      await guard(async () => {
        const it = snapRef.current.items.find((x) => x.id === itemId); if (!it) return;
        const id = uid(); await repo().putImage(id, blob);
        setUrls((u) => ({ ...u, [id]: URL.createObjectURL(blob) }));
        const next = { ...it, images: [...it.images, { id }], updatedAt: nowIso() };
        await repo().putItem(next); setSnap((s) => ({ ...s, items: s.items.map((x) => (x.id === itemId ? next : x)) }));
      }, 'Could not add that photo.');
    },
    async deleteItem(id) {
      await guard(async () => {
        const r = repo(); await r.deleteItem(id);
        const changed = snapRef.current.outfits.filter((o) => o.itemIds.includes(id)).map((o) => ({ ...o, itemIds: o.itemIds.filter((x) => x !== id), updatedAt: nowIso() }));
        for (const o of changed) await r.putOutfit(o);
        setSnap((s) => ({ ...s, items: s.items.filter((x) => x.id !== id), outfits: s.outfits.map((o) => changed.find((c) => c.id === o.id) ?? o) }));
      }, 'Could not delete this item.');
    },
    async saveOutfit(o) {
      return guard(async () => {
        const existing = o.id ? snapRef.current.outfits.find((x) => x.id === o.id) : undefined;
        const t = nowIso();
        const next: Outfit = { favorite: false, source: 'manual', createdAt: t, ...existing, ...o, id: o.id ?? uid(), updatedAt: t } as Outfit;
        await repo().putOutfit(next);
        setSnap((s) => ({ ...s, outfits: existing ? s.outfits.map((x) => (x.id === next.id ? next : x)) : [...s.outfits, next] }));
        return next;
      }, 'Could not save this look.');
    },
    async deleteOutfit(id) {
      await guard(async () => {
        const r = repo(); await r.deleteOutfit(id);
        const plans = snapRef.current.plans.filter((p) => p.outfitId === id);
        for (const p of plans) await r.deletePlan(p.date);
        setSnap((s) => ({ ...s, outfits: s.outfits.filter((x) => x.id !== id), plans: s.plans.filter((p) => p.outfitId !== id) }));
      }, 'Could not delete this look.');
    },
    async duplicateOutfit(id) {
      const o = snapRef.current.outfits.find((x) => x.id === id); if (!o) return undefined;
      return store.saveOutfit({ name: `${o.name} (copy)`, itemIds: [...o.itemIds], favorite: false, source: o.source });
    },
    async setPlan(date, outfitId) {
      await guard(async () => { const p: Plan = { date, outfitId, worn: false }; await repo().putPlan(p); setSnap((s) => ({ ...s, plans: [...s.plans.filter((x) => x.date !== date), p] })); }, 'Could not plan this look.');
    },
    async removePlan(date) {
      await guard(async () => {
        const plan = snapRef.current.plans.find((p) => p.date === date);
        if (plan?.worn) await store.markWorn(date, false);
        await repo().deletePlan(date); setSnap((s) => ({ ...s, plans: s.plans.filter((x) => x.date !== date) }));
      }, 'Could not remove this plan.');
    },
    async markWorn(date, worn) {
      await guard(async () => {
        const s0 = snapRef.current; const plan = s0.plans.find((p) => p.date === date); if (!plan || plan.worn === worn) return;
        const outfit = s0.outfits.find((o) => o.id === plan.outfitId);
        const r = repo(); const p2 = { ...plan, worn }; await r.putPlan(p2);
        const updated: Item[] = [];
        for (const it of s0.items.filter((i) => outfit?.itemIds.includes(i.id))) {
          const lastWorn = worn ? (it.lastWorn && it.lastWorn > date ? it.lastWorn : date) : it.lastWorn;
          const n = { ...it, wearCount: Math.max(0, it.wearCount + (worn ? 1 : -1)), lastWorn, updatedAt: nowIso() };
          await r.putItem(n); updated.push(n);
        }
        setSnap((s) => ({ ...s, plans: s.plans.map((x) => (x.date === date ? p2 : x)), items: s.items.map((i) => updated.find((u) => u.id === i.id) ?? i) }));
      }, 'Could not update wear history.');
    },
    async updateProfile(p) {
      await guard(async () => { const next = { ...snapRef.current.profile, ...p, updatedAt: nowIso() }; await repo().putProfile(next); setSnap((s) => ({ ...s, profile: next })); }, 'Could not save your preferences.');
    },
    async addFeedback(itemIds, verdict) {
      const entry: FeedbackEntry = { id: uid(), itemIds, verdict, at: nowIso() };
      const next = [...snapRef.current.feedback, entry].slice(-500);
      await guard(async () => { await repo().putFeedback(next); setSnap((s) => ({ ...s, feedback: next })); }, 'Could not save feedback.');
    },
    async resetDemo() {
      const r = createLocalRepo('demo'); await r.clearAll(); await seedDemo(r);
      if (workspace === 'demo') await open('demo');
      toast('Demo closet reset.');
    },
    async clearWorkspace() { await repo().clearAll(); if (workspace) await open(workspace); },
    async exportData() {
      const s = snapRef.current; const imgs: Record<string, string> = {};
      for (const it of s.items) for (const img of it.images) for (const k of [img.id, img.cutoutId]) {
        if (!k) continue; const b = await repo().getImage(k);
        if (b) imgs[k] = await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.readAsDataURL(b); });
      }
      return new Blob([JSON.stringify({ app: 'StyleDNA CLOSET', version: 2, exportedAt: nowIso(), workspace, ...s, images: imgs }, null, 1)], { type: 'application/json' });
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [snap, ready, workspace, error, urls, toasts, toast, open]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
