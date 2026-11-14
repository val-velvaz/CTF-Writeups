// data.js — acceso al catálogo y utilidades compartidas entre páginas.
import { locale } from './i18n.js';

export const CATALOG_URL = 'writeups/index.json';

let catalogPromise;
export function loadCatalog() {
  catalogPromise ??= fetch(CATALOG_URL, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) throw new Error(`${CATALOG_URL} (${res.status})`);
    const data = await res.json();
    // Publicados primero (más recientes arriba), borradores al final
    const draft = (w) => (w.estado === 'borrador' ? 1 : 0);
    data.writeups.sort((a, b) => draft(a) - draft(b) || (b.fecha || '').localeCompare(a.fecha || ''));
    return data;
  });
  return catalogPromise;
}

// Slug seguro: solo minúsculas, números y guiones (evita rutas raras)
export const isSafeSlug = (s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s);

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

// Crea elementos sin innerHTML (seguro ante contenido del JSON)
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
