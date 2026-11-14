// theme.js — loaded in <head> (no defer) to avoid a theme flash.
// Stores the visitor's choice and respects "prefers-contrast: more".
(function () {
  const KEY = 'theme';
  const root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (_) { /* private mode */ }
  }
  function apply(theme) {
    if (theme === 'contrast') root.setAttribute('data-theme', 'contrast');
    else root.removeAttribute('data-theme');
    const btn = document.getElementById('theme-toggle');
    // i18n.js sets the button text; this only sets its state
    if (btn) btn.setAttribute('aria-pressed', String(theme === 'contrast'));
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
