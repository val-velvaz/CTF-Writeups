// writeup.js — carga writeups/<idioma>/<slug>.md y lo muestra con la plantilla común.
// Si no existe en el idioma elegido, usa otro disponible y muestra un aviso.
import { loadCatalog, isSafeSlug, formatDate, el } from './data.js';
import { initI18n, onLangChange, t, pick, currentLang, LANGS, DEFAULT_LANG } from './i18n.js';
import { renderMarkdown } from './markdown.js';

const head = document.getElementById('article-head');
const body = document.getElementById('article-body');
const slug = new URLSearchParams(location.search).get('w');

async function fetchMarkdown(lang, available) {
  // "idiomas" en index.json (opcional) evita pedir traducciones que no existen
  const order = [lang, DEFAULT_LANG, ...LANGS]
    .filter((l, i, a) => a.indexOf(l) === i)
    .filter((l) => !Array.isArray(available) || available.includes(l));
  for (const l of order) {
    const res = await fetch(`writeups/${l}/${slug}.md`, { cache: 'no-cache' });
    if (res.ok) return { md: await res.text(), shown: l };
  }
  throw new Error(t('not_found'));
}

async function render() {
  try {
    if (!isSafeSlug(slug)) throw new Error(t('invalid'));
    const { writeups } = await loadCatalog();
    const w = writeups.find((x) => x.slug === slug);
    if (!w || w.estado === 'borrador') throw new Error(t('not_found'));

    const lang = currentLang();
    const { md, shown } = await fetchMarkdown(lang, w.idiomas);
    const title = pick(w.titulo);

    document.title = `${title} · Writeups`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && w.resumen) desc.setAttribute('content', pick(w.resumen));

    const metaLine = [pick(w.plataforma), pick(w.so), w.dificultad && t(`difficulty.${w.dificultad}`)]
      .filter(Boolean).join(' · ');
    head.replaceChildren(
      el('span', { class: 'platform' }, metaLine),
      el('h1', {}, title),
      el('div', { class: 'meta' }, el('time', { class: 'date', datetime: w.fecha }, formatDate(w.fecha))),
      el('ul', { class: 'tags', 'aria-label': t('tags_label') },
        (w.tags || []).map((tag) => el('li', { class: 'tag' }, pick(tag)))),
    );

    // renderMarkdown escapa todo el HTML de entrada → seguro de insertar
    body.innerHTML = renderMarkdown(md);
    body.lang = shown;
    if (shown !== lang) {
      body.prepend(el('p', { class: 'notice', lang },
        t('fallback_notice', { wanted: t(`lang_names.${lang}`), shown: t(`lang_names.${shown}`) })));
    }
  } catch (err) {
    console.error(err);
    head.replaceChildren(el('h1', {}, t('oops')));
    body.replaceChildren(el('p', { class: 'error' }, err.message),
      el('p', {}, el('a', { href: './' }, t('back_home'))));
  }
}

await initI18n();
onLangChange(render);
render();
