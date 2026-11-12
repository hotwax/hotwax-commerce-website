(function () {
  if (window.hwTilt) return;
  window.hwTilt = true;

  var MAX = 4;
  var canTilt = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

  function clamp(v) {
    return Math.max(-1, Math.min(1, v));
  }

  function setup(zone) {
    var surface = zone.querySelector('[data-hw-tilt-surface]');
    if (!surface || zone._hwTilt) return;
    zone._hwTilt = true;
    var frame = 0, x = 0, y = 0;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.classList.remove('is-tilting');
      surface.style.removeProperty('--hw-tilt-x');
      surface.style.removeProperty('--hw-tilt-y');
    }

    function move(e) {
      if (!canTilt.matches || e.pointerType === 'touch' || document.hidden) return;
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        var r = zone.getBoundingClientRect();
        var px = clamp((x - r.left) / r.width * 2 - 1);
        var py = clamp((y - r.top) / r.height * 2 - 1);
        surface.style.setProperty('--hw-tilt-x', (-py * MAX).toFixed(2) + 'deg');
        surface.style.setProperty('--hw-tilt-y', (px * MAX).toFixed(2) + 'deg');
        surface.classList.add('is-tilting');
      });
    }

    zone.addEventListener('pointerenter', move, { passive: true });
    zone.addEventListener('pointermove', move, { passive: true });
    zone.addEventListener('pointerleave', reset);
    zone.addEventListener('pointercancel', reset);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-hw-tilt]'), setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
