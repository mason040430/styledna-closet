import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { colorHex } from '../lib/taxonomy';
import type { Item } from '../lib/types';
import { useStore } from '../lib/store';

// ---------- routing ----------
// Hash routes use only letters, digits and hyphens ("#closet", "#item--<id>") so they also work
// inside sandboxed hosts that only pass plain #names. Legacy "#/a/b" links are still understood.
let navState = '';
export const href = (path: string) => { const p = path.split('?')[0].replace(/^\//, ''); return p ? `#${p.split('/').join('--')}` : '#home'; };
function parseHash(): string[] {
  const h = window.location.hash.replace(/^#/, '');
  if (h.startsWith('/')) return h.slice(1).split('?')[0].split('/').filter(Boolean);
  if (!h || h === 'home') return [];
  return h.split('--').filter(Boolean);
}
export function useRoute(): string[] {
  const [parts, setParts] = useState(parseHash);
  useEffect(() => { const on = () => { setParts(parseHash()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  return parts;
}
/** Navigate. Anything after "?" is handed to the next page in memory (not put in the URL). */
export const go = (path: string) => { navState = path.split('?')[1] ?? ''; window.location.hash = href(path); };
export const query = () => {
  const legacy = window.location.hash.split('?')[1];
  return new URLSearchParams(navState || legacy || '');
};

// ---------- primitives ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime';
const V: Record<Variant, string> = {
  primary: 'bg-ink text-cream hover:bg-olive',
  secondary: 'bg-paper text-ink border border-line hover:border-ink',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-danger/90',
  lime: 'bg-lime text-ink hover:brightness-95',
};
export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button {...rest} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-sm font-medium tracking-wide transition disabled:opacity-40 disabled:pointer-events-none ${V[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Chip({ active, onClick, children, swatch, small }: { active?: boolean; onClick?: () => void; children: ReactNode; swatch?: string; small?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border ${small ? 'px-3 h-8 text-xs' : 'px-3.5 h-9 text-sm'} transition ${active ? 'bg-ink text-cream border-ink' : 'bg-paper border-line text-ink hover:border-ink'}`}>
      {swatch && <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ background: colorHex(swatch) }} aria-hidden />}
      {children}
    </button>
  );
}

export function ChipSelect<T extends string>({ options, value, onChange, multi = true, swatches, label, small }: {
  options: readonly T[]; value: T[]; onChange: (v: T[]) => void; multi?: boolean; swatches?: boolean; label?: string; small?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} small={small} swatch={swatches ? o : undefined} active={value.includes(o)}
          onClick={() => onChange(multi ? (value.includes(o) ? value.filter((x) => x !== o) : [...value, o]) : [o])}>{o}</Chip>
      ))}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-mute mb-2">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-xs text-mute">{hint}</span>}
    </label>
  );
}
export const inputCls = 'w-full h-11 rounded-xl border border-line bg-paper px-3.5 text-[15px] focus:border-ink outline-none';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-olive">{children}</p>;
}
export function PageHead({ eyebrow, title, sub, action }: { eyebrow: string; title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] mt-2">{title}</h1>
        {sub && <p className="text-mute mt-3 max-w-xl">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-paper/60 px-6 py-14 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="text-mute mt-2 max-w-md mx-auto">{body}</p>
      {action && <div className="mt-6 flex justify-center gap-3 flex-wrap">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onCancel={onClose} aria-label={title}
      className={`backdrop:bg-ink/40 backdrop:backdrop-blur-sm rounded-3xl bg-cream p-0 w-[calc(100%-1.5rem)] ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh]`}>
      {open && (
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className="font-serif text-2xl">{title}</h2>
            <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-ink/5 text-xl leading-none" aria-label="Close">×</button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Confirm({ open, title, body, confirm, onConfirm, onClose }: { open: boolean; title: string; body: string; confirm: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-mute">{body}</p>
      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirm}</Button>
      </div>
    </Modal>
  );
}

export function ItemImage({ item, className = '', fit = 'contain' }: { item: Item; className?: string; fit?: 'contain' | 'cover' }) {
  const { imageUrl } = useStore();
  const img = item.images[0];
  const src = imageUrl(item.useCutout && img?.cutoutId ? img.cutoutId : img?.id);
  return (
    <div className={`relative overflow-hidden bg-[#ECE8DE] ${className}`}>
      {src ? <img src={src} alt={`${item.name} — ${item.colors.join(' and ').toLowerCase()} ${item.subcategory.toLowerCase()}`} loading="lazy" draggable={false}
        className={`absolute inset-0 h-full w-full ${fit === 'contain' ? 'object-contain p-[8%]' : 'object-cover'}`} />
        : <div className="absolute inset-0 grid place-items-center text-mute text-xs">No photo</div>}
    </div>
  );
}

export function Swatches({ colors }: { colors: string[] }) {
  return <span className="inline-flex -space-x-1">{colors.map((c) => <span key={c} title={c} className="h-3.5 w-3.5 rounded-full border border-cream" style={{ background: colorHex(c) }} />)}</span>;
}

export function ItemCard({ item, onClick, selected, compact }: { item: Item; onClick?: () => void; selected?: boolean; compact?: boolean }) {
  const { updateItem } = useStore();
  return (
    <div className={`group relative rounded-2xl bg-paper shadow-card transition ${selected ? 'ring-2 ring-ink' : 'hover:-translate-y-0.5'}`}>
      <button onClick={onClick} className="block w-full text-left rounded-2xl" aria-label={`${item.name}${selected ? ', selected' : ''}`}>
        <ItemImage item={item} className={`rounded-t-2xl ${compact ? 'aspect-square' : 'aspect-[4/5]'}`} />
        <div className={compact ? 'px-2.5 py-2' : 'px-3.5 py-3'}>
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium leading-snug line-clamp-1`}>{item.name}</p>
          {!compact && <p className="text-xs text-mute mt-1 flex items-center gap-2"><Swatches colors={item.colors} />{item.subcategory}</p>}
        </div>
      </button>
      {!compact && (
        <button onClick={() => updateItem({ ...item, favorite: !item.favorite })} aria-pressed={item.favorite} aria-label={item.favorite ? `Unfavorite ${item.name}` : `Favorite ${item.name}`}
          className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full grid place-items-center text-base bg-paper/90 backdrop-blur transition ${item.favorite ? 'text-ink' : 'text-mute opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100'}`}>
          {item.favorite ? '♥' : '♡'}
        </button>
      )}
      {selected && <span className="absolute top-2.5 left-2.5 h-6 px-2 rounded-full bg-lime text-ink text-[10px] font-bold tracking-wider grid place-items-center">IN LOOK</span>}
    </div>
  );
}

/** Flat-lay collage of an outfit's pieces. */
export function OutfitBoard({ items, className = '' }: { items: Item[]; className?: string }) {
  const order = ['Outerwear', 'Tops', 'Dresses', 'Bottoms', 'Footwear', 'Bags', 'Accessories'];
  const sorted = [...items].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  const cols = sorted.length <= 2 ? 2 : sorted.length <= 4 ? 2 : 3;
  return (
    <div className={`grid gap-1.5 bg-[#ECE8DE] p-1.5 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {sorted.map((it) => <ItemImage key={it.id} item={it} className="aspect-square rounded-xl bg-paper" />)}
      {sorted.length === 0 && <div className="aspect-square col-span-2 grid place-items-center text-mute text-sm">Empty look</div>}
    </div>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div aria-live="polite" className="fixed z-50 bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center pointer-events-none px-4 w-full">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-full px-5 py-3 text-sm shadow-card max-w-md text-center ${t.tone === 'error' ? 'bg-danger text-white' : 'bg-ink text-cream'}`}>{t.text}</div>
      ))}
    </div>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <p className="font-serif text-4xl leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.16em] text-mute mt-2">{label}</p>
    </div>
  );
}
