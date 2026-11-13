// home.js — pinta las tarjetas y los filtros a partir de writeups/index.json
import { loadCatalog, isSafeSlug, diffLabel, formatDate, el } from './data.js';

const TONES = ['pink', 'lav', 'mint', 'rose', 'peach'];

// minúsculas y sin tildes: "Enumeración" encuentra "enumeracion"
const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function card(w) {
  const ready = w.estado !== 'borrador' && isSafeSlug(w.slug);
  const tone = TONES.includes(w.color) ? w.color : 'lav';

  const body = el('div', { class: 'card__body' },
    el('span', { class: 'platform' }, w.plataforma || ''),
    el('h3', {}, w.titulo),
    el('div', { class: 'meta' },
      el('span', { class: 'date' }, ready ? formatDate(w.fecha) : 'en progreso…'),
      w.dificultad && el('span', { class: `diff diff--${w.dificultad}` }, diffLabel(w.dificultad)),
    ),
    el('ul', { class: 'tags', 'aria-label': 'etiquetas' },
      (w.tags || []).map((t) => el('li', { class: 'tag' }, t))),
    ready && el('span', { class: 'card__cta', 'aria-hidden': 'true' }, 'leer writeup →'),
  );

  const attrs = {
    class: `card${ready ? '' : ' card--soon'}`,
    'data-cat': (w.categorias || []).join(' '),
    'data-search': normalize([w.titulo, w.plataforma, ...(w.tags || [])].join(' ')),
  };
  if (ready) attrs.href = `writeup.html?w=${encodeURIComponent(w.slug)}`;
  return el(ready ? 'a' : 'div', attrs, el('div', { class: `card__bar tone--${tone}` }), body);
}

// Filtro por categoría + búsqueda por texto, combinados
function setupFilters(nav, search, noResults, filtros, cards) {
  const state = { cat: 'all', q: '' };

  const apply = () => {
    let visible = 0;
    cards.forEach((c) => {
      const cats = (c.dataset.cat || '').split(' ');
      const okCat = state.cat === 'all' || cats.includes(state.cat);
      const okText = !state.q || c.dataset.search.includes(state.q);
      c.hidden = !(okCat && okText);
      if (!c.hidden) visible++;
    });
    noResults.hidden = visible > 0;
  };

  const chips = [{ id: 'all', label: 'todos' }, ...filtros].map((f) =>
    el('button', { class: 'chip', type: 'button', 'data-f': f.id, 'aria-pressed': String(f.id === 'all') }, f.label));
  nav.replaceChildren(...chips);

  nav.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    state.cat = chip.dataset.f;
    apply();
  });

  search.addEventListener('input', () => {
    state.q = normalize(search.value.trim());
    apply();
  });
  // Tecla "/" para saltar al buscador
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search) { e.preventDefault(); search.focus(); }
    if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; state.q = ''; apply(); }
  });
}

async function main() {
  const grid = document.getElementById('grid');
  const nav = document.getElementById('filters');
  const search = document.getElementById('search');
  const noResults = document.getElementById('no-results');
  try {
    const { filtros = [], writeups } = await loadCatalog();
    if (!writeups.length) {
      grid.replaceChildren(el('p', { class: 'empty' }, 'Aún no hay writeups. ¡Pronto!'));
      return;
    }
    const cards = writeups.map(card);
    grid.replaceChildren(...cards);
    setupFilters(nav, search, noResults, filtros, cards);
  } catch (err) {
    console.error(err);
    grid.replaceChildren(el('p', { class: 'error' }, 'No se pudieron cargar los writeups.'));
  }
}

main();
