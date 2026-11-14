(function () {
  var SLIDE_MS = 6500;
  var MOVE_MS = 1000;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function initGallery(root) {
    var track = root.querySelector('.hw-sg__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hw-sg__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hw-sg__dot'));
    var list = root.querySelector('.hw-sg__dots');
    var btn = root.querySelector('.hw-sg__play');
    if (!track || !slides.length || !btn || dots.length !== slides.length) return;

    var index = 0;
    var elapsed = 0;
    var state = reduce.matches ? 'paused' : 'playing';
    var visible = false;
    var move = null;
    var loop = 0;
    var last = 0;
    var scrollRaf = 0;

    function offsetFor(i) {
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var max = track.scrollWidth - track.clientWidth;
      return Math.max(0, Math.min(max, slides[i].offsetLeft - pad));
    }

    function nearest() {
      var best = 0;
      var dist = Infinity;
      slides.forEach(function (slide, i) {
        var d = Math.abs(offsetFor(i) - track.scrollLeft);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    }

    var painted = '';

    function paint() {
      var p = state === 'playing' || (state === 'paused' && elapsed > 0) ? elapsed / SLIDE_MS : 1;
      dots.forEach(function (dot, k) {
        dot.style.setProperty('--p', k === index ? p.toFixed(4) : '0');
      });
      if (painted === state) return;
      painted = state;
      btn.setAttribute('data-state', state === 'playing' ? 'pause' : state === 'done' ? 'replay' : 'play');
      btn.setAttribute('aria-label', state === 'playing' ? 'Pause autoplay' : state === 'done' ? 'Replay stories' : 'Play autoplay');
      track.setAttribute('aria-live', state === 'playing' ? 'off' : 'polite');
    }

    function setIndex(i) {
      if (i !== index) elapsed = 0;
      index = i;
      slides.forEach(function (slide, k) {
        var on = k === i;
        if (on) {
          slide.removeAttribute('inert');
        } else {
          slide.setAttribute('inert', '');
        }
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (dot, k) {
        dot.setAttribute('aria-selected', k === i ? 'true' : 'false');
        dot.tabIndex = k === i ? 0 : -1;
      });
      paint();
    }

    function cancelMove() {
      if (!move) return;
      cancelAnimationFrame(move.raf);
      move = null;
      track.classList.remove('is-moving');
    }

    function tick(now) {
      loop = 0;
      if (state !== 'playing' || !visible) return;
      if (!move) {
        elapsed += Math.min(now - last, 100);
        if (elapsed >= SLIDE_MS) {
          if (index < slides.length - 1) {
            goTo(index + 1, true);
          } else {
            elapsed = 0;
            state = 'done';
          }
        }
      }
      last = now;
      paint();
      if (state === 'playing') loop = requestAnimationFrame(tick);
    }

    function run() {
      if (loop || state !== 'playing' || !visible) return;
      last = performance.now();
      loop = requestAnimationFrame(tick);
    }

    function goTo(i, animate) {
      cancelMove();
      setIndex(i);
      var to = offsetFor(i);
      if (!animate || reduce.matches) {
        track.scrollLeft = to;
        return;
      }
      var from = track.scrollLeft;
      var start = performance.now();
      track.classList.add('is-moving');
      move = { raf: 0 };
      (function step(now) {
        var t = Math.min(1, (now - start) / MOVE_MS);
        track.scrollLeft = from + (to - from) * ease(t);
        if (t < 1) {
          move.raf = requestAnimationFrame(step);
        } else {
          move = null;
          track.classList.remove('is-moving');
          run();
        }
      })(start);
    }

    function stop() {
      cancelMove();
      cancelAnimationFrame(loop);
      loop = 0;
      if (state !== 'done') state = 'paused';
      elapsed = 0;
      paint();
    }

    btn.addEventListener('click', function () {
      if (state === 'playing') {
        cancelAnimationFrame(loop);
        loop = 0;
        state = 'paused';
        paint();
      } else if (state === 'done') {
        state = 'playing';
        goTo(0, true);
        run();
      } else {
        state = 'playing';
        run();
      }
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        goTo(i, true);
      });
    });

    list.addEventListener('keydown', function (event) {
      var keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: slides.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      var k = Math.max(0, Math.min(slides.length - 1, keys[event.key]));
      stop();
      goTo(k, true);
      dots[k].focus();
    });

    var touchX = 0;
    var touchY = 0;
    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse') stop();
    });
    track.addEventListener('click', stop);
    track.addEventListener('touchstart', function (event) {
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    }, { passive: true });
    track.addEventListener('touchmove', function (event) {
      var dx = Math.abs(event.touches[0].clientX - touchX);
      var dy = Math.abs(event.touches[0].clientY - touchY);
      if (dx > 10 && dx > dy) stop();
    }, { passive: true });
    track.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) stop();
    }, { passive: true });
    track.addEventListener('keydown', stop);
    root.addEventListener('focusin', function (event) {
      if (event.target === btn) return;
      var keyboard = false;
      try {
        keyboard = event.target.matches(':focus-visible');
      } catch (error) {
        keyboard = false;
      }
      if (keyboard) stop();
    });

    track.addEventListener('scroll', function () {
      if (move || scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () {
        scrollRaf = 0;
        var i = nearest();
        if (i !== index) setIndex(i);
      });
    }, { passive: true });

    var lastWidth = track.clientWidth;
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        if (track.clientWidth === lastWidth) return;
        lastWidth = track.clientWidth;
        cancelMove();
        track.scrollLeft = offsetFor(index);
      }).observe(track);
    }

    var images = Array.prototype.slice.call(root.querySelectorAll('.hw-sg__img, .hw-sg__logo'));
    function loadAll() {
      images.forEach(function (img) { img.loading = 'eager'; });
    }

    setIndex(0);
    root.setAttribute('data-hw-ready', '');

    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          loadAll();
          near.disconnect();
        }
      }, { rootMargin: '800px 0px' });
      near.observe(root);
      new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        run();
      }, { threshold: [0, 0.5] }).observe(track);
    } else {
      loadAll();
      state = 'paused';
      paint();
    }
  }

  function init() {
    document.querySelectorAll('[data-hw-sg]').forEach(function (root) {
      if (root.hasAttribute('data-hw-ready')) return;
      initGallery(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
