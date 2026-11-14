// data.js — catalog access and helpers shared between pages.
import { locale } from './i18n.js';

export const CATALOG_URL = 'writeups/index.json';

let catalogPromise;
export function loadCatalog() {
  catalogPromise ??= fetch(CATALOG_URL, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) throw new Error(`${CATALOG_URL} (${res.status})`);
    const data = await res.json();
    // Published first (newest on top), drafts last
    const draft = (w) => (w.status === 'draft' ? 1 : 0);
    data.writeups.sort((a, b) => draft(a) - draft(b) || (b.date || '').localeCompare(a.date || ''));
    return data;
  });
  return catalogPromise;
}

// Safe slug: lowercase letters, numbers and hyphens only (no odd paths)
export const isSafeSlug = (s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s);

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

// Builds elements without innerHTML (safe against JSON content)
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}
