import { emptyState, type State } from './engine';
const DB = 'styledna-closet';
function open(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('closet'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
export async function load(): Promise<State> { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction('closet'); const r = tx.objectStore('closet').get('state'); r.onsuccess = () => resolve(r.result ?? structuredClone(emptyState)); r.onerror = () => reject(r.error); tx.oncomplete = () => db.close(); }); }
export async function save(state: State): Promise<void> { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction('closet', 'readwrite'); tx.objectStore('closet').put(state, 'state'); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(tx.error); }; tx.onabort = () => reject(tx.error); }); }
export async function readPhoto(file: File): Promise<string> {
 if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP photo.');
 if (file.size > 15 * 1024 * 1024) throw new Error('Please choose a photo smaller than 15 MB.');
 const bitmap = await createImageBitmap(file); const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
 const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
 const context = canvas.getContext('2d'); if (!context) throw new Error('Could not process this photo.');
 context.fillStyle = '#f4f2ed'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close(); return canvas.toDataURL('image/jpeg',0.85);
}
