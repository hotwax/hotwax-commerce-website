(function () {
  function initAccordion(root) {
    var items = Array.prototype.slice.call(root.querySelectorAll('.hw-ia__item'));
    if (!items.length) return;

    function show(index) {
      items.forEach(function (item, i) {
        var open = i === index;
        item.classList.toggle('is-open', open);
        var button = item.querySelector('.hw-ia__btn');
        if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
        var inner = item.querySelector('.hw-ia__inner');
        if (inner) {
          if (open) {
            inner.removeAttribute('inert');
          } else {
            inner.setAttribute('inert', '');
          }
        }
      });
    }

    var narrow = window.matchMedia('(max-width: 1068px)');

    var holding = 0;

    function stopHolding() {
      if (holding) cancelAnimationFrame(holding);
      holding = 0;
    }

    function holdStill(button, top) {
      stopHolding();
      if (!narrow.matches) return;
      var start = performance.now();
      (function step() {
        var drift = button.getBoundingClientRect().top - top;
        if (Math.abs(drift) >= 1) window.scrollBy({ top: drift, behavior: 'instant' });
        holding = performance.now() - start < 500 ? requestAnimationFrame(step) : 0;
      })();
    }

    window.addEventListener('wheel', stopHolding, { passive: true });
    window.addEventListener('touchstart', stopHolding, { passive: true });

    items.forEach(function (item, i) {
      var button = item.querySelector('.hw-ia__btn');
      if (!button) return;
      button.addEventListener('click', function () {
        var target = item.classList.contains('is-open') ? (i + 1) % items.length : i;
        var top = button.getBoundingClientRect().top;
        show(target);
        holdStill(button, top);
        if (window.hwMotion) window.hwMotion.playIn(items[target]);
      });
    });

    var images = Array.prototype.slice.call(root.querySelectorAll('.hw-ia__img'));
    function loadAll() {
      images.forEach(function (img) { img.loading = 'eager'; });
    }
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          loadAll();
          observer.disconnect();
        }
      }, { rootMargin: '800px 0px' });
      observer.observe(root);
    } else {
      loadAll();
    }
  }

  function init() {
    document.querySelectorAll('[data-hw-ia]').forEach(function (root) {
      if (root.hasAttribute('data-hw-ready')) return;
      root.setAttribute('data-hw-ready', '');
      initAccordion(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
