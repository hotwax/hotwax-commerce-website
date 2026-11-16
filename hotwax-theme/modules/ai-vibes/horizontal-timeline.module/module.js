(function () {
  function settled() {
    if (window.hwSettled) return window.hwSettled;
    return new Promise(function (resolve) {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
  }

  var desktop = window.matchMedia('(min-width: 992px)');
  var armed = false;

  function arm() {
    if (armed || !desktop.matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    if (!window.CSS || !CSS.supports('width', '1cqw')) return;
    armed = true;

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

  function start() {
    arm();
    if (!armed && desktop.addEventListener) desktop.addEventListener('change', arm);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
