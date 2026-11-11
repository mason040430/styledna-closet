import { useState } from 'react';
import { AESTHETICS, CATEGORIES, COLOR_NAMES, MATERIALS, OCCASIONS, PATTERNS, SEASONS, SUBCATEGORIES } from '../lib/taxonomy';
import type { Category, Item } from '../lib/types';
import { ChipSelect, Field, inputCls } from './ui';

export type ItemMeta = Pick<Item, 'name' | 'category' | 'subcategory' | 'colors' | 'pattern' | 'material' | 'styleTags' | 'seasons' | 'occasions' | 'brand' | 'price' | 'purchaseDate' | 'notes' | 'customTags' | 'favorite' | 'useCutout'>;

export function ItemForm({ value, onChange, compact }: { value: ItemMeta; onChange: (v: ItemMeta) => void; compact?: boolean }) {
  const set = <K extends keyof ItemMeta>(k: K, v: ItemMeta[K]) => onChange({ ...value, [k]: v });
  const [more, setMore] = useState(!compact);
  const [tagText, setTagText] = useState(value.customTags.join(', '));
  return (
    <div className="space-y-6">
      <Field label="Name"><input className={inputCls} value={value.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Black leather boots" maxLength={80} required /></Field>
      <Field label="Category">
        <ChipSelect label="Category" multi={false} options={CATEGORIES} value={[value.category]}
          onChange={([c]) => onChange({ ...value, category: c as Category, subcategory: SUBCATEGORIES[c as Category].includes(value.subcategory) ? value.subcategory : SUBCATEGORIES[c as Category][0] })} />
      </Field>
      <Field label="Type">
        <select className={inputCls} value={value.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
          {SUBCATEGORIES[value.category].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Colors" hint="Pick up to two. The first is the main color.">
        <ChipSelect label="Colors" small swatches options={COLOR_NAMES} value={value.colors}
          onChange={(v) => set('colors', v.length > 2 ? v.slice(-2) : v.length ? v : value.colors)} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Pattern"><select className={inputCls} value={value.pattern} onChange={(e) => set('pattern', e.target.value)}>{PATTERNS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="Material (looks like)"><select className={inputCls} value={value.material} onChange={(e) => set('material', e.target.value)}>{MATERIALS.map((p) => <option key={p}>{p}</option>)}</select></Field>
      </div>
      <Field label="Occasions"><ChipSelect label="Occasions" small options={OCCASIONS} value={value.occasions} onChange={(v) => set('occasions', v)} /></Field>
      {!more && <button type="button" className="text-sm underline underline-offset-4" onClick={() => setMore(true)}>More details (style, season, brand, price…)</button>}
      {more && (
        <>
          <Field label="Style"><ChipSelect label="Style" small options={AESTHETICS} value={value.styleTags} onChange={(v) => set('styleTags', v)} /></Field>
          <Field label="Seasons" hint="Leave all off for an all-season piece."><ChipSelect label="Seasons" small options={SEASONS} value={value.seasons} onChange={(v) => set('seasons', v)} /></Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Brand (optional)"><input className={inputCls} value={value.brand ?? ''} onChange={(e) => set('brand', e.target.value || undefined)} maxLength={60} /></Field>
            <Field label="Price (optional)"><input className={inputCls} inputMode="decimal" value={value.price ?? ''} onChange={(e) => { const n = Number(e.target.value.replace(/[^0-9.]/g, '')); set('price', e.target.value === '' || !Number.isFinite(n) ? undefined : n); }} placeholder="$" /></Field>
            <Field label="Bought (optional)"><input type="date" className={inputCls} value={value.purchaseDate ?? ''} onChange={(e) => set('purchaseDate', e.target.value || undefined)} /></Field>
          </div>
          <Field label="Your tags" hint="Comma separated, e.g. gift, vintage, needs tailoring">
            <input className={inputCls} value={tagText} onChange={(e) => { setTagText(e.target.value); set('customTags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12)); }} />
          </Field>
          <Field label="Notes"><textarea className={`${inputCls} h-24 py-3`} value={value.notes ?? ''} onChange={(e) => set('notes', e.target.value || undefined)} maxLength={500} /></Field>
        </>
      )}
    </div>
  );
}
