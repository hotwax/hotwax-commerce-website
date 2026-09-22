(() => {
  'use strict';
  /* Heat Banner: the backdrop layout fades the copy area to the real ground behind the banner. Nothing moves in the foundation. */
  const ground = (root) => {
    if (!root.classList.contains('heat-banner--backdrop') || root.style.getPropertyValue('--hb-ground')) return;
    let el = root.parentElement, bg = '';
    while (el && !bg) { const c = getComputedStyle(el).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') bg = c; el = el.parentElement; }
    root.style.setProperty('--hb-page', bg || '#ffffff');
  };
  const boot = () => document.querySelectorAll('[data-heat-banner]').forEach(ground);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
