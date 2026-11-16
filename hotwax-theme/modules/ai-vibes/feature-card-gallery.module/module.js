(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initGallery(root) {
    var scroller = root.querySelector('[data-hw-scroller]');
    var track = scroller && scroller.querySelector('.hw-fcg__track');
    var paddles = root.querySelector('[data-hw-paddles]');
    var prev = root.querySelector('[data-hw-prev]');
    var next = root.querySelector('[data-hw-next]');
    if (!scroller || !track || !paddles || !prev || !next) return;

    function step() {
      var item = track.querySelector('.hw-fcg__item');
      if (!item) return scroller.clientWidth;
      var styles = getComputedStyle(track);
      var gap = parseFloat(styles.columnGap) || 0;
      var pad = parseFloat(styles.paddingLeft) || 0;
      var size = item.getBoundingClientRect().width + gap;
      var fit = Math.max(1, Math.floor((scroller.clientWidth - pad * 2 + gap) / size));
      return fit * size;
    }

    function update() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var atStart = scroller.scrollLeft <= 1;
      var atEnd = scroller.scrollLeft >= max - 1;
      paddles.classList.toggle('is-hidden', max <= 1);
      if (atStart && document.activeElement === prev && !atEnd) next.focus({ preventScroll: true });
      if (atEnd && document.activeElement === next && !atStart) prev.focus({ preventScroll: true });
      prev.disabled = atStart;
      next.disabled = atEnd;
    }

    function go(dir) {
      scroller.scrollBy({ left: dir * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
    }

    scroller.addEventListener('focusin', function (event) {
      if (!event.target.matches(':focus-visible')) return;
      var item = event.target.closest('.hw-fcg__item');
      if (!item) return;
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var box = item.getBoundingClientRect();
      var frame = scroller.getBoundingClientRect();
      if (box.left < frame.left + pad || box.right > frame.right - pad) {
        scroller.scrollTo({ left: scroller.scrollLeft + box.left - frame.left - pad, behavior: reduce.matches ? 'auto' : 'smooth' });
      }
    });

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initModals(root) {
    var lastTrigger = null;

    function open(dialog, trigger) {
      lastTrigger = trigger;
      document.documentElement.classList.add('hw-fcg-lock');
      dialog.classList.remove('is-closing');
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      var overlay = dialog.querySelector('[data-hw-overlay]');
      if (overlay) overlay.scrollTop = 0;
      var panel = dialog.querySelector('.hw-fcg__modal');
      if (panel) panel.focus({ preventScroll: true });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { dialog.classList.add('is-open'); });
      });
    }

    function close(dialog) {
      if (!dialog.hasAttribute('open') || dialog.classList.contains('is-closing')) return;
      dialog.classList.add('is-closing');
      dialog.classList.remove('is-open');
      var done = function () {
        dialog.classList.remove('is-closing');
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
        document.documentElement.classList.remove('hw-fcg-lock');
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
      };
      if (reduce.matches) {
        done();
      } else {
        setTimeout(done, 300);
      }
    }

    root.querySelectorAll('[data-hw-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var dialog = document.getElementById(trigger.getAttribute('data-hw-open'));
        if (dialog) open(dialog, trigger);
      });
    });

    root.querySelectorAll('.hw-fcg__dialog').forEach(function (dialog) {
      dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        close(dialog);
      });
      dialog.addEventListener('close', function () {
        dialog.classList.remove('is-open', 'is-closing');
        document.documentElement.classList.remove('hw-fcg-lock');
      });
      var closeButton = dialog.querySelector('[data-hw-close]');
      if (closeButton) closeButton.addEventListener('click', function () { close(dialog); });
      var overlay = dialog.querySelector('[data-hw-overlay]');
      if (overlay) {
        overlay.addEventListener('click', function (event) {
          if (event.target === overlay) close(dialog);
        });
      }
    });
  }

  function init() {
    document.querySelectorAll('[data-hw-fcg]').forEach(function (root) {
      if (root.hasAttribute('data-hw-ready')) return;
      root.setAttribute('data-hw-ready', '');
      initGallery(root);
      initModals(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 992px)');
  var native = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');

  function headerHeight() {
    var header = document.querySelector('header.header');
    return header ? Math.ceil(header.getBoundingClientRect().height) : 81;
  }

  function initOpening(root) {
    var gallery = root.querySelector('.hw-fcg');
    var on = null;
    var frame = null;
    if (!gallery) return;

    function fits(head) {
      var styles = getComputedStyle(gallery);
      var content = gallery.offsetHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
      return content + head + 24 <= window.innerHeight;
    }

    function onScroll() {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(function () {
        frame = null;
        var s = -root.getBoundingClientRect().top / window.innerHeight;
        root.style.setProperty('--hw-fcg-lift', Math.min(Math.max((s - 0.28) / 0.54, 0), 1).toFixed(3));
      });
    }

    function mode() {
      var head = headerHeight();
      root.style.setProperty('--hw-fcg-head', head + 'px');
      var want = wide.matches && !reduce.matches && fits(head);
      if (want === on) return;
      on = want;
      root.classList.toggle('hw-fcg-open--on', want);
      root.classList.toggle('hw-fcg-open--native', want && native);
      root.classList.toggle('hw-fcg-open--script', want && !native);
      if (native) return;
      if (want) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
        root.style.removeProperty('--hw-fcg-lift');
      }
    }

    root.addEventListener('focusin', function () {
      if (!on) return;
      var top = root.getBoundingClientRect().top + window.scrollY;
      var end = top + window.innerHeight * 0.85;
      if (window.scrollY < end - 1) window.scrollTo({ top: end, behavior: 'instant' });
    });

    mode();
    window.addEventListener('resize', function () { window.requestAnimationFrame(mode); });
    if (wide.addEventListener) {
      wide.addEventListener('change', mode);
      reduce.addEventListener('change', mode);
    }
  }

  function init() {
    document.querySelectorAll('[data-hw-fcg-open]').forEach(function (root) {
      if (root.hasAttribute('data-hw-fcg-open-ready')) return;
      root.setAttribute('data-hw-fcg-open-ready', '');
      initOpening(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
