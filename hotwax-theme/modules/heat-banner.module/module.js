(() => {
  'use strict';
  /* Heat Banner: play a banner video only while it is on screen. Nothing else moves in the foundation. */
  /* backdrop layout: the fade behind the copy must use the real ground behind the banner, not assume white */
  const ground = (root) => {
    if (!root.classList.contains('heat-banner--backdrop') || root.style.getPropertyValue('--hb-ground')) return;
    let el = root.parentElement, bg = '';
    while (el && !bg) { const c = getComputedStyle(el).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') bg = c; el = el.parentElement; }
    root.style.setProperty('--hb-page', bg || '#ffffff');
  };
  const init = (root) => {
    ground(root);
    const video = root.querySelector('video');
    if (!video) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); return; }
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); });
    }, { threshold: 0.2 }).observe(root);
  };
  const boot = () => document.querySelectorAll('[data-heat-banner]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
