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
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function keepInView(index) {
      if (!narrow.matches) return;
      setTimeout(function () {
        var button = items[index].querySelector('.hw-ia__btn');
        if (button && button.getBoundingClientRect().top < 90) {
          button.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
        }
      }, reduce.matches ? 0 : 420);
    }

    items.forEach(function (item, i) {
      var button = item.querySelector('.hw-ia__btn');
      if (!button) return;
      button.addEventListener('click', function () {
        var target = item.classList.contains('is-open') ? (i + 1) % items.length : i;
        show(target);
        keepInView(target);
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
