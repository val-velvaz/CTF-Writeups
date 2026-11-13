// theme.js — se carga en <head> (sin defer) para evitar parpadeo de tema.
// Guarda la preferencia del visitante y respeta "prefers-contrast: more".
(function () {
  const KEY = 'theme';
  const root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (_) { /* modo privado */ }
  }
  function apply(theme) {
    if (theme === 'contrast') root.setAttribute('data-theme', 'contrast');
    else root.removeAttribute('data-theme');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const on = theme === 'contrast';
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '◐ modo pastel' : '◑ alto contraste';
    }
  }

  const prefersMore = window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches;
  let current = stored() || (prefersMore ? 'contrast' : 'pastel');
  apply(current);

  document.addEventListener('DOMContentLoaded', () => {
    apply(current);
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      current = current === 'contrast' ? 'pastel' : 'contrast';
      save(current);
      apply(current);
    });
  });
})();
