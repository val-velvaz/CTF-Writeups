// writeup.js — loads writeups/<lang>/<slug>.md and renders it with the shared template.
// If it doesn't exist in the selected language, falls back to another one and shows a notice.
import { loadCatalog, isSafeSlug, formatDate, el } from './data.js';
import { initI18n, onLangChange, t, pick, currentLang, LANGS, DEFAULT_LANG } from './i18n.js';
import { renderMarkdown } from './markdown.js';

const head = document.getElementById('article-head');
const body = document.getElementById('article-body');
const slug = new URLSearchParams(location.search).get('w');

async function fetchMarkdown(lang, available) {
  // "languages" in index.json (optional) avoids requesting translations that don't exist
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
    if (!w || w.status === 'draft') throw new Error(t('not_found'));

    const lang = currentLang();
    const { md, shown } = await fetchMarkdown(lang, w.languages);
    const title = pick(w.title);

    document.title = `${title} · Writeups`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && w.summary) desc.setAttribute('content', pick(w.summary));

    const metaLine = [pick(w.platform), pick(w.os), w.difficulty && t(`difficulty.${w.difficulty}`)]
      .filter(Boolean).join(' · ');
    head.replaceChildren(
      el('span', { class: 'platform' }, metaLine),
      el('h1', {}, title),
      el('div', { class: 'meta' }, el('time', { class: 'date', datetime: w.date }, formatDate(w.date))),
      el('ul', { class: 'tags', 'aria-label': t('tags_label') },
        (w.tags || []).map((tag) => el('li', { class: 'tag' }, pick(tag)))),
    );

    // renderMarkdown escapes all input HTML → safe to insert
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
