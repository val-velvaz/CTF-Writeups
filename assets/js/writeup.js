// writeup.js — carga writeups/<slug>.md y lo muestra con la plantilla común
import { loadCatalog, isSafeSlug, diffLabel, formatDate, el } from './data.js';
import { renderMarkdown } from './markdown.js';

async function main() {
  const head = document.getElementById('article-head');
  const body = document.getElementById('article-body');
  const slug = new URLSearchParams(location.search).get('w');

  try {
    if (!isSafeSlug(slug)) throw new Error('Writeup no válido');
    const { writeups } = await loadCatalog();
    const w = writeups.find((x) => x.slug === slug);
    if (!w || w.estado === 'borrador') throw new Error('Writeup no encontrado');

    const res = await fetch(`writeups/${slug}.md`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`No se pudo cargar el writeup (${res.status})`);
    const md = await res.text();

    document.title = `${w.titulo} · Writeups`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && w.resumen) desc.setAttribute('content', w.resumen);

    const metaLine = [w.plataforma, w.so, diffLabel(w.dificultad)].filter(Boolean).join(' · ');
    head.replaceChildren(
      el('span', { class: 'platform' }, metaLine),
      el('h1', {}, w.titulo),
      el('div', { class: 'meta' },
        el('time', { class: 'date', datetime: w.fecha }, formatDate(w.fecha))),
      el('ul', { class: 'tags', 'aria-label': 'etiquetas' },
        (w.tags || []).map((t) => el('li', { class: 'tag' }, t))),
    );
    // renderMarkdown escapa todo el HTML de entrada → seguro de insertar
    body.innerHTML = renderMarkdown(md);
  } catch (err) {
    console.error(err);
    head.replaceChildren(el('h1', {}, 'Ups…'));
    body.replaceChildren(el('p', { class: 'error' }, err.message),
      el('p', {}, el('a', { href: './' }, '← volver al inicio')));
  }
}

main();
