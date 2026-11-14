// i18n.js — idiomas de la interfaz (textos estáticos en assets/i18n/<lang>.json)
//
// En el HTML:
//   data-i18n="clave"                       → textContent
//   data-i18n-attr="placeholder:clave;aria-label:otra"  → atributos
//   <body data-i18n-title="meta.home_title"> → <title>
// En JS:  t('clave', { var: 'valor' })   pick(valor | { en, es, de })

export const LANGS = ['en', 'es', 'de'];      // orden de los botones y de respaldo
export const DEFAULT_LANG = 'en';
const KEY = 'lang';
const LOCALES = { en: 'en-GB', es: 'es-ES', de: 'de-DE' };

let lang = DEFAULT_LANG;
let dict = {};
let base = {};                                // inglés: respaldo de claves sin traducir
const listeners = [];

const cache = {};
async function loadDict(l) {
  if (!cache[l]) {
    cache[l] = fetch(`assets/i18n/${l}.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return cache[l];
}

function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (_) { /* modo privado */ }
  return DEFAULT_LANG;
}

const lookup = (obj, path) => path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

export function t(key, vars = {}) {
  let s = lookup(dict, key);
  if (s === undefined) s = lookup(base, key);
  if (s === undefined) return key;
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}

// Campo del catálogo que puede ser texto o { en, es, de }
export function pick(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] ?? value[DEFAULT_LANG] ?? Object.values(value)[0] ?? '';
  }
  return value ?? '';
}

export const currentLang = () => lang;
export const locale = () => LOCALES[lang] || lang;
export const onLangChange = (fn) => listeners.push(fn);

function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll('[data-i18n-attr]').forEach((n) => {
    n.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) n.setAttribute(attr, t(key));
    });
  });
  const titleKey = document.body.dataset.i18nTitle;
  if (titleKey) document.title = t(titleKey);
  document.querySelectorAll('#lang-switch [data-lang]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
}

export async function setLang(next) {
  if (!LANGS.includes(next)) return;
  lang = next;
  try { localStorage.setItem(KEY, next); } catch (_) { /* modo privado */ }
  dict = await loadDict(next);
  applyStatic();
  listeners.forEach((fn) => fn(lang));
}

function buildSwitcher() {
  const box = document.getElementById('lang-switch');
  if (!box) return;
  box.replaceChildren(...LANGS.map((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-switch__btn';
    b.dataset.lang = l;
    b.lang = l;
    b.textContent = l.toUpperCase();
    return b;
  }));
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b && b.dataset.lang !== lang) setLang(b.dataset.lang);
  });
}

export async function initI18n() {
  lang = detectLang();
  [base, dict] = await Promise.all([loadDict(DEFAULT_LANG), loadDict(lang)]);
  buildSwitcher();
  applyStatic();
}
