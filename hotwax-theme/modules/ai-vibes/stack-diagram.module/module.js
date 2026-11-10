(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function whenSettled() {
    if (window.hwSettled) return window.hwSettled;
    return new Promise(function (resolve) {
      function go() {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { setTimeout(resolve, 120); });
        });
      }
      if (document.readyState === 'complete') go();
      else window.addEventListener('load', go, { once: true });
    });
  }

  function init(root) {
    var map = root.querySelector('[data-hw-stk-map]');
    if (!map || reduce || map.classList.contains('is-drawing')) return;
    [].slice.call(map.querySelectorAll('.hw-stk__flow')).forEach(function (flow, i) {
      flow.style.setProperty('--d', (i * 0.08) + 's');
    });
    map.classList.add('is-drawing');
    if (!('IntersectionObserver' in window)) {
      map.classList.add('is-in');
      return;
    }
    void map.offsetWidth;
    whenSettled().then(function () {
      new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          map.classList.add('is-in');
          observer.disconnect();
        });
      }, { rootMargin: '0px 0px -25% 0px' }).observe(map);
    });
  }

  function start() {
    [].forEach.call(document.querySelectorAll('[data-hw-stk]'), init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
