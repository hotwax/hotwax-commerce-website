(function () {
  function initAccordion(root) {
    var items = Array.prototype.slice.call(root.querySelectorAll('.hw-ia__item'));
    if (!items.length) return;

    function setOpen(item, open) {
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
    }

    function show(index) {
      items.forEach(function (item, i) { setOpen(item, i === index); });
    }

    var phone = window.matchMedia('(max-width: 734px)');
    var narrow = window.matchMedia('(max-width: 1068px)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function scrollInstantly(distance) {
      var page = document.scrollingElement || document.documentElement;
      var behavior = page.style.scrollBehavior;
      page.style.scrollBehavior = 'auto';
      window.scrollBy(0, distance);
      page.style.scrollBehavior = behavior;
    }

    var glide = 0;

    function stopGlide() {
      cancelAnimationFrame(glide);
      glide = 0;
    }

    function glideBy(distance) {
      stopGlide();
      var start = window.scrollY;
      var begin = null;
      function step(now) {
        if (begin === null) begin = now;
        var p = Math.min(1, (now - begin) / 400);
        var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(2 - 2 * p, 2) / 2;
        scrollInstantly(start + distance * eased - window.scrollY);
        glide = p < 1 ? requestAnimationFrame(step) : 0;
      }
      glide = requestAnimationFrame(step);
    }

    ['touchstart', 'wheel', 'keydown'].forEach(function (type) {
      window.addEventListener(type, stopGlide, { passive: true });
    });

    function afterOpen(item, done) {
      var tray = item.querySelector('.hw-ia__tray');
      var timer;
      function stop() {
        clearTimeout(timer);
        if (tray) tray.removeEventListener('transitionend', finish);
        item._stopOpen = null;
      }
      function finish(event) {
        if (event && (event.target !== tray || event.propertyName !== 'grid-template-rows')) return;
        stop();
        done();
      }
      if (item._stopOpen) item._stopOpen();
      item._stopOpen = stop;
      if (tray) tray.addEventListener('transitionend', finish);
      timer = setTimeout(finish, 420);
    }

    function reveal(item, scrolled) {
      if (!item.classList.contains('is-open') || reduce.matches || Math.abs(window.scrollY - scrolled) > 2) return;
      var figure = item.querySelector('.hw-ia__figure');
      var button = item.querySelector('.hw-ia__btn');
      if (!figure || !button) return;
      var header = document.querySelector('header');
      var headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      var room = button.getBoundingClientRect().top - headerBottom - 16;
      var distance = Math.min(figure.getBoundingClientRect().bottom + 16 - window.innerHeight, room);
      if (distance > 24) glideBy(distance);
    }

    function playGraphic(item, scrolled) {
      var motion = window.hwMotion;
      if (!narrow.matches) {
        if (motion) motion.playIn(item);
        return;
      }
      var hold = !!(motion && motion.release);
      if (motion) motion.playIn(item, hold);
      afterOpen(item, function () {
        reveal(item, scrolled);
        if (hold) motion.release(item);
      });
    }

    items.forEach(function (item, i) {
      var button = item.querySelector('.hw-ia__btn');
      if (!button) return;
      button.addEventListener('click', function () {
        stopGlide();
        if (phone.matches) {
          var open = !item.classList.contains('is-open');
          setOpen(item, open);
          if (open && window.hwMotion) window.hwMotion.playIn(item);
          return;
        }
        var target = item.classList.contains('is-open') ? (i + 1) % items.length : i;
        var above = narrow.matches ? items.slice(0, i) : [];
        var top = button.getBoundingClientRect().top;
        above.forEach(function (other) { other.classList.add('is-snap'); });
        show(target);
        var drift = button.getBoundingClientRect().top - top;
        above.forEach(function (other) { other.classList.remove('is-snap'); });
        if (Math.abs(drift) >= 1) scrollInstantly(drift);
        playGraphic(items[target], window.scrollY);
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
