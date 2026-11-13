// home.js — pinta las tarjetas y los filtros a partir de writeups/index.json
import { loadCatalog, isSafeSlug, diffLabel, formatDate, el } from './data.js';

const TONES = ['pink', 'lav', 'mint', 'rose', 'peach'];

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
  );

  const attrs = { class: `card${ready ? '' : ' card--soon'}`, 'data-cat': (w.categorias || []).join(' ') };
  if (ready) attrs.href = `writeup.html?w=${encodeURIComponent(w.slug)}`;
  return el(ready ? 'a' : 'div', attrs, el('div', { class: `card__bar tone--${tone}` }), body);
}

function setupFilters(nav, filtros, cards) {
  const chips = [{ id: 'all', label: 'todos' }, ...filtros].map((f) =>
    el('button', { class: 'chip', type: 'button', 'data-f': f.id, 'aria-pressed': String(f.id === 'all') }, f.label));
  nav.replaceChildren(...chips);

  nav.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const f = chip.dataset.f;
    cards.forEach((c) => {
      const cats = (c.dataset.cat || '').split(' ');
      c.hidden = !(f === 'all' || cats.includes(f));
    });
  });
}

async function main() {
  const grid = document.getElementById('grid');
  const nav = document.getElementById('filters');
  try {
    const { filtros = [], writeups } = await loadCatalog();
    if (!writeups.length) {
      grid.replaceChildren(el('p', { class: 'empty' }, 'Aún no hay writeups. ¡Pronto!'));
      return;
    }
    const cards = writeups.map(card);
    grid.replaceChildren(...cards);
    setupFilters(nav, filtros, cards);
  } catch (err) {
    console.error(err);
    grid.replaceChildren(el('p', { class: 'error' }, 'No se pudieron cargar los writeups.'));
  }
}

main();
