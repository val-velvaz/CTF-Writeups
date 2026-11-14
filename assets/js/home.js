// home.js — renders the cards and filters from writeups/index.json
import { loadCatalog, isSafeSlug, formatDate, el } from './data.js';
import { initI18n, onLangChange, t, pick } from './i18n.js';

const TONES = ['pink', 'lav', 'mint', 'rose', 'peach'];

// lowercase, accents stripped: "Enumeración" matches "enumeracion"
const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// every translation of a field (plain text or { en, es, de })
const allVariants = (v) => (v && typeof v === 'object' ? Object.values(v) : [v ?? '']);

const grid = document.getElementById('grid');
const nav = document.getElementById('filters');
const search = document.getElementById('search');
const noResults = document.getElementById('no-results');
const state = { cat: 'all', q: '' };
let cards = [];

function card(w) {
  const ready = w.status !== 'draft' && isSafeSlug(w.slug);
  const tone = TONES.includes(w.color) ? w.color : 'lav';
  const tags = (w.tags || []).map(pick);
  const title = pick(w.title);

  const body = el('div', { class: 'card__body' },
    el('span', { class: 'platform' }, pick(w.platform)),
    el('h3', {}, title),
    el('div', { class: 'meta' },
      el('span', { class: 'date' }, ready ? formatDate(w.date) : t('in_progress')),
      w.difficulty && el('span', { class: `diff diff--${w.difficulty}` }, t(`difficulty.${w.difficulty}`)),
    ),
    el('ul', { class: 'tags', 'aria-label': t('tags_label') }, tags.map((tag) => el('li', { class: 'tag' }, tag))),
    ready && el('span', { class: 'card__cta', 'aria-hidden': 'true' }, t('read_more')),
  );

  const attrs = {
    class: `card${ready ? '' : ' card--soon'}`,
    'data-cat': (w.categories || []).join(' '),
    // search covers title, platform and tags in ALL languages
    'data-search': normalize([w.title, w.platform, ...(w.tags || [])].flatMap(allVariants).join(' ')),
  };
  if (ready) attrs.href = `writeup.html?w=${encodeURIComponent(w.slug)}`;
  return el(ready ? 'a' : 'div', attrs, el('div', { class: `card__bar tone--${tone}` }), body);
}

function applyFilters() {
  let visible = 0;
  cards.forEach((c) => {
    const cats = (c.dataset.cat || '').split(' ');
    const okCat = state.cat === 'all' || cats.includes(state.cat);
    const okText = !state.q || c.dataset.search.includes(state.q);
    c.hidden = !(okCat && okText);
    if (!c.hidden) visible++;
  });
  noResults.hidden = visible > 0 || !cards.length;
}

async function render() {
  try {
    const { filters = [], writeups } = await loadCatalog();
    nav.replaceChildren(...[{ id: 'all', label: t('filter_all') }, ...filters].map((f) =>
      el('button', { class: 'chip', type: 'button', 'data-f': f.id, 'aria-pressed': String(f.id === state.cat) },
        pick(f.label))));
    if (!writeups.length) {
      cards = [];
      grid.replaceChildren(el('p', { class: 'empty' }, t('empty')));
      return;
    }
    cards = writeups.map(card);
    grid.replaceChildren(...cards);
    applyFilters();
  } catch (err) {
    console.error(err);
    grid.replaceChildren(el('p', { class: 'error' }, t('load_error')));
  }
}

nav.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  nav.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
  state.cat = chip.dataset.f;
  applyFilters();
});
search.addEventListener('input', () => {
  state.q = normalize(search.value.trim());
  applyFilters();
});
// "/" jumps to the search box, Esc clears it
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; state.q = ''; applyFilters(); }
});

await initI18n();
onLangChange(render);
render();
