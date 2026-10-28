(function () {
  function settled() {
    if (window.hwSettled) return window.hwSettled;
    return new Promise(function (resolve) {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
  }

  function start() {
    if (!window.matchMedia('(min-width: 992px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    if (!window.CSS || !CSS.registerProperty || !CSS.supports('color', 'color-mix(in srgb, red calc(0.5 * 100%), blue)')) return;

    Array.prototype.forEach.call(document.querySelectorAll('[data-hw-oj] .hw-oj__line'), function (line) {
      line.classList.add('is-armed');
      settled().then(function () {
        var observer = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          observer.disconnect();
          line.classList.add('is-run');
        }, { threshold: 0.5 });
        observer.observe(line);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
