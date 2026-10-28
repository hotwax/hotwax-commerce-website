(function () {
  if (window.hwClickDemos && window.hwClickDemos.ready) return;

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phone = window.matchMedia('(max-width: 640px)');

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function headerBottom() {
    var h = document.querySelector('header.header');
    if (!h) return 0;
    var p = getComputedStyle(h).position;
    return (p === 'fixed' || p === 'sticky') ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
  }

  function snapBars(root) {
    function snap() {
      root.querySelectorAll('.sd-tab__bar').forEach(function (el) {
        el.style.translate = '';
        var f = el.getBoundingClientRect().top % 1;
        if (f) el.style.translate = '0 ' + (-f).toFixed(3) + 'px';
      });
    }
    window.addEventListener('load', snap);
    window.addEventListener('resize', snap);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(snap);
    snap();
  }

  function mirrorNote(root) {
    var win = root.querySelector('.sd-window');
    var c = win && win.querySelector('[data-callout]');
    if (!c || root.querySelector('.sd-note')) return;
    var m = c.cloneNode(true);
    m.removeAttribute('data-callout');
    m.removeAttribute('role');
    m.removeAttribute('aria-live');
    m.removeAttribute('hidden');
    m.className = 'sd-callout sd-note';
    m.setAttribute('role', 'status');
    m.setAttribute('aria-live', 'polite');
    m.innerHTML = '';
    win.insertAdjacentElement('afterend', m);
    function sync() {
      var cur = win.querySelector('[data-callout]');
      if (!cur) return;
      if (m.innerHTML !== cur.innerHTML) m.innerHTML = cur.innerHTML;
      m.classList.toggle('is-in', !cur.hidden && cur.classList.contains('is-in'));
    }
    new MutationObserver(sync).observe(win, { attributes: true, attributeFilter: ['class', 'hidden'], childList: true, subtree: true, characterData: true });
    sync();
  }

  function keepInView(root) {
    var timer;
    function fit() {
      var win = root.querySelector('.sd-window'), tabs = root.querySelector('.sd-tabs'), note = root.querySelector('.sd-note');
      if (!win || !phone.matches || !root.classList.contains('is-started')) return;
      var top = headerBottom() + 8, bottom = window.innerHeight - 8, el = root.querySelector('.is-target');
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top >= top && r.bottom <= bottom) return;
      var w = win.getBoundingClientRect(), end = note ? note.getBoundingClientRect().bottom : w.bottom;
      var t = tabs && tabs.getBoundingClientRect(), start = (t && end - t.top <= bottom - top) ? t.top : w.top;
      window.scrollBy({ top: start - top, behavior: reduceQuery.matches ? 'auto' : 'smooth' });
    }
    function turnedOn(m, cls) {
      return m.target.classList && m.target.classList.contains(cls) && (' ' + (m.oldValue || '') + ' ').indexOf(' ' + cls + ' ') < 0;
    }
    new MutationObserver(function (ms) {
      if (ms.some(function (m) { return turnedOn(m, 'is-target') || (m.target === root && turnedOn(m, 'is-started')); })) {
        clearTimeout(timer);
        timer = setTimeout(fit, 160);
      }
    }).observe(root, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
  }

  function create(root, opts) {
    var app = root.querySelector('[data-app]');
    var steps = [].slice.call(root.querySelectorAll('.sd-step'));
    var intro = root.querySelector('[data-intro]');
    var done = root.querySelector('[data-done]');
    var reduce = reduceQuery.matches;
    var timers = [], tipTimer, tipHideTimer, viewTimer;

    var G = {
      app: app,
      reduce: reduce,
      started: false,
      keyboard: false,
      step: 0,
      view: null,
      tipEl: null
    };

    G.T = function (ms) { return reduce ? Math.min(ms, opts.reducedMs || 0) : ms; };
    G.later = function (ms, fn) { timers.push(setTimeout(fn, G.T(ms))); };
    G.clearTimers = function () { timers.forEach(clearTimeout); timers = []; clearTimeout(viewTimer); clearTimeout(tipTimer); };
    G.twoFrames = function (fn) { void app.offsetWidth; fn(); };
    G.focusInApp = function () { var a = document.activeElement; return !a || a === document.body || app.contains(a); };

    G.setStep = function (k) {
      G.step = k;
      steps.forEach(function (s, n) { s.classList.toggle('is-active', n === k); s.classList.toggle('is-done', n < k); });
    };

    G.nudge = function (el) {
      var st = steps[G.step];
      if (el) { el.classList.add('is-nudge'); setTimeout(function () { el.classList.remove('is-nudge'); }, 900); }
      if (st) { st.classList.add('is-nudge'); setTimeout(function () { st.classList.remove('is-nudge'); }, 900); }
    };

    G.press = function (el, e) {
      el.classList.add('is-pressed');
      setTimeout(function () { el.classList.remove('is-pressed'); }, 150);
      if (reduce || !el.matches(opts.ripple)) return;
      var r = el.getBoundingClientRect(), s = Math.max(r.width, r.height), dot = document.createElement('span');
      dot.className = opts.rippleClass;
      dot.style.width = dot.style.height = s + 'px';
      dot.style.left = ((e.clientX || r.left + r.width / 2) - r.left - s / 2) + 'px';
      dot.style.top = ((e.clientY || r.top + r.height / 2) - r.top - s / 2) + 'px';
      el.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 600);
    };

    G.show = function (view) {
      var next = app.querySelector('[data-view="' + view + '"]');
      G.hideTip(opts.tipFade);
      if (opts.onShow) opts.onShow(view);
      if (G.view === view && !next.hidden) return;
      G.view = view;
      clearTimeout(viewTimer);
      var others = [].filter.call(app.querySelectorAll('[data-view]'), function (v) { return v !== next; });
      function settle() { others.forEach(function (v) { v.hidden = true; v.classList.remove('is-leaving', 'is-entering'); }); }
      if (reduce) { settle(); next.hidden = false; return; }
      others.forEach(function (v) { if (!v.hidden) v.classList.add('is-leaving'); });
      next.classList.remove('is-leaving');
      next.classList.add('is-entering');
      next.hidden = false;
      G.twoFrames(function () { next.classList.remove('is-entering'); });
      viewTimer = setTimeout(settle, G.T(460));
    };

    G.layer = function (el, on, ms) {
      if (on) {
        el.classList.add('is-out');
        el.hidden = false;
        G.twoFrames(function () { el.classList.remove('is-out'); });
        return;
      }
      if (el.contains(document.activeElement)) app.focus({ preventScroll: true });
      el.classList.add('is-out');
      G.later(ms, function () { el.hidden = true; });
    };

    function tipBox() { return app.querySelector('[data-tip]'); }
    G.placeTip = function () {
      var t = tipBox(), el = G.tipEl;
      if (!t || !el || t.hidden) return;
      var a = app.getBoundingClientRect(), r = el.getBoundingClientRect(), w = Math.min(260, a.width - 24);
      t.style.width = w + 'px';
      var left = Math.max(12, Math.min(r.left - a.left + r.width / 2 - w / 2, a.width - w - 12));
      var h = t.offsetHeight, top = r.bottom - a.top + 8;
      if (top + h > a.height - 12) top = r.top - a.top - h - 8;
      t.style.left = left + 'px';
      t.style.top = Math.max(12, Math.min(top, a.height - h - 12)) + 'px';
    };
    G.tip = function (el, text) {
      var t = tipBox();
      t.textContent = text;
      t.hidden = false;
      t.classList.remove('is-in');
      G.tipEl = el;
      G.placeTip();
      G.twoFrames(function () { t.classList.add('is-in'); });
      clearTimeout(tipTimer);
      clearTimeout(tipHideTimer);
      tipTimer = setTimeout(function () { G.hideTip(true); }, 3800);
    };
    G.hideTip = function (fade) {
      var t = tipBox();
      if (!t) return;
      clearTimeout(tipTimer);
      clearTimeout(tipHideTimer);
      t.classList.remove('is-in');
      if (fade) tipHideTimer = setTimeout(function () { t.hidden = true; }, 260);
      else t.hidden = true;
    };

    function calloutBox() { return app.querySelector('[data-callout]'); }
    G.calloutBox = calloutBox;
    G.hideCallout = function () {
      var c = calloutBox();
      if (!c) return;
      c.classList.remove('is-in');
      c.hidden = true;
    };
    G.showCallout = function (info, place) {
      var c = calloutBox();
      c.querySelector('[data-callout-title]').textContent = info[0];
      c.querySelector('[data-callout-text]').textContent = info[1];
      c.hidden = false;
      c.classList.remove('is-in');
      place();
      G.twoFrames(function () { c.classList.add('is-in'); });
    };
    G.position = function (el, anchor, gap, wide) {
      var c = calloutBox();
      if (!c || c.hidden || !el) return;
      var a = app.getBoundingClientRect(), r = anchor.getBoundingClientRect(), w = Math.min(300, a.width - 24);
      var docked = a.width < 640;
      c.classList.toggle('is-docked', docked);
      if (docked) {
        c.style.left = c.style.top = c.style.width = '';
        c.classList.toggle('is-top', el.getBoundingClientRect().bottom > a.bottom - c.offsetHeight - 28);
        return;
      }
      c.classList.remove('is-top');
      c.style.width = w + 'px';
      var h = c.offsetHeight, rl = r.left - a.left, rt = r.top - a.top, rw = r.width, rh = r.height, left, top;
      if (wide && rw > a.width * 0.5) {
        left = rl + rw - w;
        top = rt + rh + gap;
        if (top + h > a.height - 12) top = rt - h - gap;
      } else if (rl + rw + gap + w < a.width - 12) {
        left = rl + rw + gap;
        top = rt + rh / 2 - h / 2;
      } else if (rl - gap - w > 12) {
        left = rl - gap - w;
        top = rt + rh / 2 - h / 2;
      } else {
        left = rl;
        top = rt + rh + gap;
        if (top + h > a.height - 12) top = rt - h - gap;
      }
      c.style.left = Math.max(12, Math.min(left, a.width - w - 12)) + 'px';
      c.style.top = Math.max(12, Math.min(top, a.height - h - 12)) + 'px';
    };

    G.onStart = function (fn) {
      root.querySelector('[data-start]').addEventListener('click', function () {
        var y = window.scrollY;
        G.started = true;
        root.classList.add('is-started');
        app.inert = false;
        app.focus({ preventScroll: true });
        intro.classList.add('is-out');
        requestAnimationFrame(function () { window.scrollTo(0, y); });
        setTimeout(function () { intro.hidden = true; }, G.T(350));
        fn();
      });
    };
    G.finish = function () {
      done.hidden = false;
      app.inert = true;
      G.twoFrames(function () {
        done.classList.add('is-in');
        var replay = done.querySelector('[data-replay]');
        if (G.keyboard && replay) replay.focus({ preventScroll: true });
      });
    };
    G.onReplay = function (fn) {
      root.querySelector('[data-replay]').addEventListener('click', function () {
        done.classList.remove('is-in');
        done.hidden = true;
        app.inert = false;
        fn();
      });
    };

    app.setAttribute('tabindex', '-1');
    app.inert = true;
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') G.keyboard = true; });
    document.addEventListener('pointerdown', function () { G.keyboard = false; });

    snapBars(root);
    mirrorNote(root);
    keepInView(root);
    return G;
  }

  var api = { create: create, esc: esc };
  var queue = window.hwClickDemos || [];
  window.hwClickDemos = { ready: true, push: function (fn) { fn(api); } };
  queue.forEach(function (fn) { fn(api); });
})();
