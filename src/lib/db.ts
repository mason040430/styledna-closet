import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { emptyProfile, type FeedbackEntry, type Item, type Outfit, type Plan, type Profile, type Snapshot } from './types';

/**
 * Local-first persistence. Everything lives in this browser's IndexedDB.
 * Two separate databases keep fictional demo data apart from the user's real closet.
 * A cloud adapter (Supabase) can implement the same Repo interface later.
 */
export type Workspace = 'mine' | 'demo';

interface ClosetDB extends DBSchema {
  items: { key: string; value: Item };
  outfits: { key: string; value: Outfit };
  plans: { key: string; value: Plan };
  images: { key: string; value: Blob };
  meta: { key: string; value: unknown };
}

export interface Repo {
  workspace: Workspace;
  load(): Promise<Snapshot>;
  putItem(item: Item): Promise<void>;
  deleteItem(id: string): Promise<void>;
  putOutfit(o: Outfit): Promise<void>;
  deleteOutfit(id: string): Promise<void>;
  putPlan(p: Plan): Promise<void>;
  deletePlan(date: string): Promise<void>;
  putImage(id: string, blob: Blob): Promise<void>;
  getImage(id: string): Promise<Blob | undefined>;
  deleteImage(id: string): Promise<void>;
  putProfile(p: Profile): Promise<void>;
  putFeedback(f: FeedbackEntry[]): Promise<void>;
  isSeeded(): Promise<boolean>;
  markSeeded(): Promise<void>;
  clearAll(): Promise<void>;
}

/** Bump when the demo content changes so existing demo closets are refreshed. */
export const DEMO_VERSION = 2;
const dbName = (w: Workspace) => `styledna-closet-v2-${w}`;

export function createLocalRepo(workspace: Workspace): Repo {
  let dbp: Promise<IDBPDatabase<ClosetDB>> | null = null;
  const db = () =>
    (dbp ??= openDB<ClosetDB>(dbName(workspace), 1, {
      upgrade(d) {
        d.createObjectStore('items', { keyPath: 'id' });
        d.createObjectStore('outfits', { keyPath: 'id' });
        d.createObjectStore('plans', { keyPath: 'date' });
        d.createObjectStore('images');
        d.createObjectStore('meta');
      },
    }));

  return {
    workspace,
    async load() {
      const d = await db();
      const [items, outfits, plans, profile, feedback] = await Promise.all([
        d.getAll('items'), d.getAll('outfits'), d.getAll('plans'),
        d.get('meta', 'profile') as Promise<Profile | undefined>,
        d.get('meta', 'feedback') as Promise<FeedbackEntry[] | undefined>,
      ]);
      return { items, outfits, plans, profile: { ...emptyProfile, ...(profile ?? {}) }, feedback: feedback ?? [] };
    },
    async putItem(item) { await (await db()).put('items', item); },
    async deleteItem(id) {
      const d = await db();
      const item = await d.get('items', id);
      const tx = d.transaction(['items', 'images'], 'readwrite');
      for (const img of item?.images ?? []) {
        await tx.objectStore('images').delete(img.id);
        if (img.cutoutId) await tx.objectStore('images').delete(img.cutoutId);
      }
      await tx.objectStore('items').delete(id);
      await tx.done;
    },
    async putOutfit(o) { await (await db()).put('outfits', o); },
    async deleteOutfit(id) { await (await db()).delete('outfits', id); },
    async putPlan(p) { await (await db()).put('plans', p); },
    async deletePlan(date) { await (await db()).delete('plans', date); },
    async putImage(id, blob) { await (await db()).put('images', blob, id); },
    async getImage(id) { return (await db()).get('images', id); },
    async deleteImage(id) { await (await db()).delete('images', id); },
    async putProfile(p) { await (await db()).put('meta', p, 'profile'); },
    async putFeedback(f) { await (await db()).put('meta', f, 'feedback'); },
    async isSeeded() { return (await (await db()).get('meta', 'seeded')) === DEMO_VERSION; },
    async markSeeded() { await (await db()).put('meta', DEMO_VERSION, 'seeded'); },
    async clearAll() {
      const d = await db();
      await Promise.all((['items', 'outfits', 'plans', 'images', 'meta'] as const).map((s) => d.clear(s)));
    },
  };
}

export const uid = () =>
  (globalThis.crypto && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
export const nowIso = () => new Date().toISOString();
