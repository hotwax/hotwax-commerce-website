(() => {
  'use strict';
  /* Heat Banner: start the draw-on when the banner enters view; pause any video off screen; draw the hex field for the network placeholder. */
  const hexField = (svg) => {
    const r = parseFloat(svg.getAttribute('data-hex')) || 34, w = Math.sqrt(3) * r, h = 1.5 * r;
    const hex = (x, y, rr) => { let p = ''; for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); p += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); } return p + 'Z'; };
    let out = '';
    for (let row = -1; row < 10; row++) for (let q = -1; q < 12; q++) { const x = (q + (row & 1 ? 0.5 : 0)) * w + 20, y = row * h + 20; if (x < -40 || x > 660 || y > 520) continue; out += '<path class="hb-g" d="' + hex(x, y, r - 3) + '"/>'; }
    const cx = 6.5 * w + 20, cy = 4 * h + 20;
    out += '<path class="hb-lit" d="' + hex(cx, cy, r - 3) + '" style="animation-delay:.9s"/>';
    out += '<path class="hb-w" d="' + hex(cx, cy, r - 3) + '" style="stroke-width:3"/>';
    out += '<path class="hb-w" d="M' + (cx - 2.5 * w).toFixed(1) + ' ' + (cy + 1.5 * h).toFixed(1) + ' L' + (cx - w).toFixed(1) + ' ' + (cy + 1.5 * h).toFixed(1) + ' L' + (cx - 0.5 * w).toFixed(1) + ' ' + cy.toFixed(1) + ' H' + (cx - r * 0.6).toFixed(1) + '" style="stroke-width:3;animation-delay:.3s"/>';
    out += '<path class="hb-w" d="M' + (cx + 3 * w).toFixed(1) + ' ' + (cy - 1.5 * h).toFixed(1) + ' L' + (cx + w).toFixed(1) + ' ' + (cy - 1.5 * h).toFixed(1) + ' L' + (cx + 0.5 * w).toFixed(1) + ' ' + cy.toFixed(1) + ' H' + (cx + r * 0.6).toFixed(1) + '" style="stroke-width:3;animation-delay:.45s"/>';
    out += '<circle class="hb-d" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="6" style="animation-delay:1.2s"/>';
    svg.innerHTML = out;
  };
  const init = (root) => {
    root.querySelectorAll('svg[data-hex]').forEach(hexField);
    const video = root.querySelector('video');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => { root.classList.add('is-in'); if (video && !reduce) video.play().catch(() => {}); };
    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) start(); else if (video) video.pause();
      });
    }, { threshold: 0.2 }).observe(root);
  };
  const boot = () => document.querySelectorAll('[data-heat-banner]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
