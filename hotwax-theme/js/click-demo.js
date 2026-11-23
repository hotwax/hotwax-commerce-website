(function () {
  if (window.hwClickDemos && window.hwClickDemos.ready) return;
  var ENGINE_SRC = document.currentScript && document.currentScript.src, IN_FRAME = window.__cdCamera === true;

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

  var glideRaf = 0;
  function glide(dy) {
    if (Math.abs(dy) < 2) return;
    cancelAnimationFrame(glideRaf);
    if (reduceQuery.matches) { window.scrollTo({ top: window.scrollY + dy, behavior: 'instant' }); return; }
    var y0 = window.scrollY, dur = Math.min(800, Math.max(450, Math.abs(dy) * 0.9)), t0 = null;
    function stop() {
      cancelAnimationFrame(glideRaf);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('wheel', stop);
    }
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('wheel', stop, { passive: true });
    glideRaf = requestAnimationFrame(function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo({ top: y0 + dy * e, behavior: 'instant' });
      if (p < 1) glideRaf = requestAnimationFrame(step); else stop();
    });
  }

  function fitApp(root) {
    var NOTE = 100, GAP = 8, MIN = 400, MAX = 520, timer;
    function size() {
      var tabs = root.querySelector('.sd-tabs'), note = root.querySelector('.sd-note'), app = root.querySelector('[data-app]');
      if (!phone.matches || root.classList.contains('is-auto')) { root.style.removeProperty('--sd-app-h'); return; }
      if (!tabs || !note || !app || !note.offsetParent) return;
      var chrome = note.getBoundingClientRect().top - tabs.getBoundingClientRect().top - app.offsetHeight;
      var room = window.innerHeight - headerBottom() - GAP * 2;
      var h = Math.round(Math.max(MIN, Math.min(MAX, room - chrome - NOTE)));
      if (root.style.getPropertyValue('--sd-app-h') !== h + 'px') root.style.setProperty('--sd-app-h', h + 'px');
    }
    var width = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(size, 150);
    });
    var started = false;
    new MutationObserver(function () {
      var now = root.classList.contains('is-started');
      if (now && !started) size();
      started = now;
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    size();
  }

  function keepInView(root) {
    var timer, tapAt = 0, awayAt = 0, wheelAt = 0, flingTo = 0, touching = false, moved = false;
    function tap() { tapAt = Date.now(); }
    function touch(e) {
      touching = e.type === 'touchstart';
      if (touching) moved = false;
      else if (moved) flingTo = Date.now() + 250;
    }
    root.addEventListener('pointerdown', tap, true);
    root.addEventListener('keydown', tap, true);
    window.addEventListener('pointerdown', function (e) { if (!root.contains(e.target)) awayAt = Date.now(); }, true);
    window.addEventListener('touchstart', touch, { passive: true });
    window.addEventListener('touchmove', function () { moved = true; }, { passive: true });
    window.addEventListener('touchend', touch, { passive: true });
    window.addEventListener('touchcancel', touch, { passive: true });
    window.addEventListener('wheel', function () { wheelAt = Date.now(); }, { passive: true });
    window.addEventListener('scroll', function () {
      var n = Date.now();
      if (touching || n < flingTo || n - wheelAt < 300 || n - awayAt < 250) awayAt = n;
    }, { passive: true });
    window.addEventListener('keydown', function (e) {
      if (!root.contains(e.target) && /^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) awayAt = Date.now();
    });
    function fit() {
      var win = root.querySelector('.sd-window'), tabs = root.querySelector('.sd-tabs'), note = root.querySelector('.sd-note');
      if (!win || !phone.matches || root.classList.contains('is-auto') || !root.classList.contains('is-started') || awayAt > tapAt) return;
      var top = headerBottom() + 8, bottom = window.innerHeight - 8, el = root.querySelector('.is-target');
      if (!el) return;
      var r = el.getBoundingClientRect(), nb = note && note.offsetParent ? note.getBoundingClientRect().bottom : 0;
      var w = win.getBoundingClientRect(), end = note ? note.getBoundingClientRect().bottom : w.bottom;
      var t = tabs && tabs.getBoundingClientRect(), fits = t && end - t.top <= bottom - top;
      if (r.top >= top && r.bottom <= bottom && nb <= bottom && (!fits || t.top >= top - 1)) return;
      glide((fits ? t.top : w.top) - top);
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
    var camCopy = opts.camera && !IN_FRAME ? root.cloneNode(true) : null;
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

    G.reveal = function (el, box, center) {
      if (!el || !box) return;
      var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
      if (!center && er.top >= br.top + 4 && er.bottom <= br.bottom - 70) return;
      var row = el;
      for (var a = el.parentElement; a && a !== box; a = a.parentElement) {
        if (a.getBoundingClientRect().height <= br.height * .75) row = a; else break;
      }
      var at = function (x) { return box.scrollTop + x.getBoundingClientRect().top - br.top; };
      var to = at(row), max = box.scrollHeight - box.clientHeight, end = box.scrollTop + er.bottom - br.top;
      if (end - to > br.height - 70) to = at(el);
      if (to > max && row.parentElement) {
        var best = -1;
        [].forEach.call(row.parentElement.children, function (k) {
          if (!k.getClientRects().length || getComputedStyle(k).position === 'absolute') return;
          var t = at(k);
          if (t <= max && t > best && end - t <= br.height - 8) best = t;
        });
        to = best >= 0 ? best : max;
      }
      if (box.scrollTo && !reduce) box.scrollTo({ top: to, behavior: 'smooth' }); else box.scrollTop = to;
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
        var auto = root.classList.contains('is-auto') || IN_FRAME;
        if (!auto) app.focus({ preventScroll: true });
        intro.classList.add('is-out');
        if (!auto) requestAnimationFrame(function () { window.scrollTo(0, y); });
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
        if (G.keyboard && replay && !root.classList.contains('is-auto')) replay.focus({ preventScroll: true });
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
    fitApp(root);
    keepInView(root);
    if (opts.auto) autoplay(root, G, opts.auto);
    if (camCopy) camera(root, camCopy, opts.camera);
    if (opts.camera && IN_FRAME) cameraInner(root, opts.camera);
    return G;
  }

  /* phones: opts.auto = { parts, message, field, focus, layer, marks, boxed, heavy, room } */
  var ICON_PAUSE = '<svg class="hw-motion-ctrl__pause" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M208 432h-48a16 16 0 01-16-16V96a16 16 0 0116-16h48a16 16 0 0116 16v320a16 16 0 01-16 16zM352 432h-48a16 16 0 01-16-16V96a16 16 0 0116-16h48a16 16 0 0116 16v320a16 16 0 01-16 16z"/></svg>';
  var ICON_PLAY = '<svg class="hw-motion-ctrl__play" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z"/></svg>';

  function autoplay(root, G, A) {
    var app = G.app, win = root.querySelector('.sd-window');
    var start = root.querySelector('[data-start]'), done = root.querySelector('[data-done]'), replay = root.querySelector('[data-replay]');
    if (!phone.matches || !('IntersectionObserver' in window) || !win || !start || !done || !replay) return;
    var steps = [].slice.call(root.querySelectorAll('.sd-step'));
    var bars = steps.map(function (s) { return s.querySelector('.sd-tab__bar i'); });
    var reduce = reduceQuery.matches, EDGE = 8, GAP = 12;
    var playing = false, started = false, userPaused = false, timer = 0, loopTimer = 0, last = null, msgSeen = false, wasDone = false;
    var partStart = [], partSpent = [], activePart = -1;
    var placedKey = null, placedAt = null, lastRect = null, settle = 0, raf = 0;

    root.classList.add('is-auto');
    root.style.setProperty('--sd-head', headerBottom() + 'px');
    var tag = document.createElement('p');
    tag.className = 'sd-autotag';
    tag.setAttribute('aria-hidden', 'true');
    tag.innerHTML = '<span></span>';
    win.appendChild(tag);
    var tagText = tag.firstChild;
    var row = document.createElement('div');
    row.className = 'sd-autoctrl';
    row.innerHTML = '<button type="button" class="hw-motion-ctrl" data-state="play">' + ICON_PAUSE + ICON_PLAY + '</button>';
    root.appendChild(row);
    var ctrl = row.firstChild;

    function rect(el) {
      var w = win.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - w.left, y: r.top - w.top, w: r.width, h: r.height };
    }
    function area(a, b) {
      var x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      return x > 0 && y > 0 ? x * y : 0;
    }
    function messageEls() { return A.message ? [].slice.call(app.querySelectorAll(A.message)) : []; }
    function messageOn() { return messageEls().some(function (el) { return !el.hidden && el.classList.contains('is-in'); }); }
    function inBox(r) {
      if (!r || r.y < -1 || r.y + r.h > win.clientHeight + 1) return false;
      var vis = Math.min(win.clientWidth, r.x + r.w) - Math.max(0, r.x);
      return vis >= Math.min(r.w, 48) - 1;
    }

    function marks(t) {
      var layer = (A.layer && t.closest(A.layer)) || app, out = [];
      function add(el, k) {
        var r = el.getBoundingClientRect();
        if (A.boxed && !el.matches(A.boxed)) {
          var rg = document.createRange(); rg.selectNodeContents(el);
          var tr = rg.getBoundingClientRect(); if (tr.width && tr.height) r = tr;
        }
        if (!r.width || !r.height) return;
        var w = win.getBoundingClientRect();
        out.push({ x: r.left - w.left, y: r.top - w.top, w: r.width, h: r.height, k: k, e: el });
      }
      if (A.marks) [].forEach.call(layer.querySelectorAll(A.marks), function (el) {
        if (el === t || el.contains(t) || el.closest('[hidden]')) return;
        add(el, A.heavy && el.matches(A.heavy) ? 3 : 1);
      });
      [].forEach.call(layer.querySelectorAll('p, span, td, th, li, label, small, strong, b, div'), function (el) {
        if (el.children.length || !el.textContent.trim() || el === t || t.contains(el) || (A.marks && el.closest(A.marks)) || el.closest('[hidden]')) return;
        add(el, 1);
      });
      messageEls().forEach(function (el) {
        if (el.hidden || !el.classList.contains('is-in')) return;
        var m = rect(el);
        out.push({ x: m.x - 10, y: m.y - 10, w: m.w + 20, h: m.h + 20, k: 3 });
      });
      return out;
    }

    function spots(c, f, w, h) {
      var cx = c.x + c.w / 2, cy = c.y + c.h / 2, out = [
        [cx - w / 2, c.y + c.h + GAP], [c.x, c.y + c.h + GAP], [c.x + c.w - w, c.y + c.h + GAP], [c.x, c.y + c.h + 4],
        [c.x, c.y - 4 - h], [cx - w / 2, c.y - GAP - h], [c.x, c.y - GAP - h], [c.x + c.w - w, c.y - GAP - h],
        [c.x + c.w + 10, cy - h / 2], [c.x - 10 - w, cy - h / 2]];
      if (f) {
        out.push([f.x + f.w - 8 - w, cy - h / 2]);
        out.push([f.x + 8, f.y + f.h - h / 2], [f.x + f.w - 4 - w, f.y + f.h - h / 2], [f.x + 8, f.y - h / 2], [f.x + f.w - 4 - w, f.y - h / 2],
          [f.x + 8, f.y + f.h + GAP], [f.x + f.w - 4 - w, f.y + f.h + GAP]);
      }
      return out;
    }
    function moved(a, b, px) { return !a || !b || Math.abs(a.x - b.x) > px || Math.abs(a.y - b.y) > px || Math.abs(a.w - b.w) > px || Math.abs(a.h - b.h) > px; }
    function showTag() {
      var t = root.querySelector('.is-target'), c = G.calloutBox(), title = c && !c.hidden && c.querySelector('[data-callout-title]');
      var r = t && rect(t);
      var on = started && done.hidden && t && title && title.textContent && !(A.message && t.closest(A.message)) && !messageOn() && inBox(r);
      if (!on) { tag.classList.remove('is-in'); placedKey = null; clearTimeout(settle); return; }
      var key = title.textContent + '|' + (t.getAttribute('data-act') || t.className);
      if (key === placedKey && placedAt && !moved(placedAt, r, 4)) return;
      if (key !== placedKey || moved(lastRect, r, 0.5)) {
        if (key !== placedKey) { placedKey = key; placedAt = null; }
        if (!placedAt || moved(placedAt, r, 4)) { tag.classList.remove('is-in'); placedAt = null; }
        lastRect = r;
        clearTimeout(settle);
        settle = setTimeout(function () { place(t, title.textContent); }, 280);
      }
    }
    function place(t, text) {
      if (!t.classList.contains('is-target') || !done.hidden) return;
      var c = rect(t);
      if (!inBox(c)) return;
      if (tagText.textContent !== text) tagText.textContent = text;
      placedAt = c;
      var cw = win.clientWidth, ch = win.clientHeight, w = tag.offsetWidth, h = tag.offsetHeight;
      var fe = A.focus && t.closest(A.focus), f = fe && rect(fe);
      if (f && !(f.h > c.h * 1.5 && f.h < ch * 0.4)) f = null;
      var mk = marks(t), field = t.matches('input, textarea, select, [contenteditable], label' + (A.field ? ', ' + A.field : '')) || !!t.querySelector('input, textarea');
      var list = spots(c, f, w, h).map(function (p) { return { p: p }; });
      if (field && c.w > cw * 0.6 && c.h <= 64) list.push({ p: [c.x + c.w - w - 10, c.y + c.h / 2 - h / 2], inside: true });
      if (A.room) [].forEach.call(app.querySelectorAll(A.room), function (el) {
        var r = rect(el), x = r.x + r.w - w - 2;
        if (el === t || el.closest('[hidden]') || r.w <= cw * 0.6 || r.h < h || r.y + r.h <= c.y - 2 * h || r.y >= c.y + c.h + 2 * h) return;
        var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), wl = win.getBoundingClientRect(), n, words = [];
        while ((n = tw.nextNode())) if (n.nodeValue.trim()) {
          var rg = document.createRange(); rg.selectNodeContents(n); var q = rg.getBoundingClientRect();
          if (q.width && q.height) words.push({ x: q.left - wl.left, y: q.top - wl.top, w: q.width, h: q.height, k: 3 });
        }
        list.push({ p: [x, r.y + r.h / 2 - h / 2], room: el, words: words });
      });
      var best = null;
      list.forEach(function (o) {
        var b = { x: Math.max(EDGE, Math.min(cw - EDGE - w, o.p[0])), y: Math.max(EDGE, Math.min(ch - EDGE - h, o.p[1])), w: w, h: h };
        var score = o.inside ? 0 : area(b, c) * 1000;
        (o.room ? mk.filter(function (m) { return m.e !== o.room; }).concat(o.words) : mk).forEach(function (m) { var a = area(b, m); if (a) score += (a + (a < m.w * m.h * 0.9 ? m.w * m.h : 0)) * (m.k || 1); });
        score += Math.hypot(b.x + w / 2 - (c.x + c.w / 2), b.y + h / 2 - (c.y + c.h / 2)) * 4;
        if (!best || score < best.score) best = { b: b, score: score };
      });
      tag.style.transform = 'translate(' + Math.round(best.b.x) + 'px,' + Math.round(best.b.y) + 'px)';
      tag.classList.add('is-in');
    }
    function soon() { cancelAnimationFrame(raf); raf = requestAnimationFrame(showTag); }

    function schedule() {
      clearTimeout(timer);
      msgSeen = false;
      var t = root.querySelector('.is-target');
      if (!playing || !t) return;
      timer = setTimeout(function go() {
        if (!playing || !t.classList.contains('is-target')) return;
        var inMsg = A.message && t.closest(A.message);
        if (!inMsg && messageOn()) { msgSeen = true; timer = setTimeout(go, 300); return; }
        if (!inMsg && msgSeen) { msgSeen = false; timer = setTimeout(go, 1800); return; }
        if (!reduce) { t.classList.remove('is-auto-tap'); void t.offsetWidth; t.classList.add('is-auto-tap'); }
        timer = setTimeout(function () {
          t.classList.remove('is-auto-tap');
          if (playing && t.classList.contains('is-target')) t.click();
        }, reduce ? 0 : 420);
      }, 2800);
    }

    function setFill(i, frac, ms) {
      var b = bars[i], f = String(frac), m = (ms || 0) + 'ms';
      if (!b || (b.style.getPropertyValue('--fill') === f && b.style.getPropertyValue('--fill-ms') === m)) return;
      b.style.setProperty('--fill-ms', m);
      b.style.setProperty('--fill', f);
    }
    function runBar(i) {
      if (!bars[i]) return;
      if (!partSpent[i]) { setFill(i, 0, 0); void bars[i].offsetWidth; }
      partStart[i] = Date.now();
      setFill(i, 0.95, Math.max(400, ((A.parts && A.parts[i]) || 8000) - (partSpent[i] || 0)));
    }
    function freezeBars() {
      if (activePart < 0 || !bars[activePart]) return;
      var m = getComputedStyle(bars[activePart]).transform, k = 0;
      if (m && m !== 'none') k = parseFloat(m.split('(')[1]);
      partSpent[activePart] = (partSpent[activePart] || 0) + Date.now() - (partStart[activePart] || Date.now());
      setFill(activePart, k, 0);
    }
    function showSteps() {
      var isDone = !done.hidden, a = -1;
      steps.forEach(function (s, i) {
        var d = isDone || s.classList.contains('is-done'), on = !isDone && s.classList.contains('is-active');
        if (on) a = i;
        if (d) { setFill(i, 1, 400); partSpent[i] = 0; } else if (!on) { setFill(i, 0, 0); partSpent[i] = 0; }
      });
      if (a !== activePart) { activePart = a; if (a >= 0 && playing) runBar(a); }
    }

    function showCtrl() {
      var label = playing ? 'Pause the demo' : 'Play the demo';
      ctrl.setAttribute('data-state', playing ? 'pause' : 'play');
      ctrl.setAttribute('aria-label', label);
      ctrl.title = label;
    }
    function loop() {
      clearTimeout(loopTimer);
      loopTimer = setTimeout(function () { if (playing && !done.hidden) replay.click(); }, 4500);
    }
    function play() {
      if (playing) return;
      playing = true;
      if (!started) { started = true; start.click(); schedule(); }
      else if (!done.hidden) replay.click();
      else schedule();
      if (activePart >= 0) runBar(activePart);
      showCtrl();
    }
    function pause() {
      if (!playing) return;
      playing = false;
      clearTimeout(timer);
      clearTimeout(loopTimer);
      freezeBars();
      showCtrl();
    }
    ctrl.addEventListener('click', function () {
      if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); }
    });

    new MutationObserver(function () {
      var t = root.querySelector('.is-target');
      if (t !== last) { last = t; schedule(); }
      showSteps();
      var isDone = !done.hidden;
      if (isDone && !wasDone && playing) loop();
      wasDone = isDone;
      soon();
    }).observe(root, { subtree: true, attributes: true, childList: true, attributeFilter: ['class', 'hidden', 'style'] });
    app.addEventListener('scroll', soon, true);
    var inView = false;
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView && !userPaused && !reduce && phone.matches && !document.hidden) play();
      else if (!inView) pause();
    }, { threshold: 0.6 }).observe(win);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else if (inView && !userPaused && !reduce && phone.matches) play();
    });
    /* turned sideways past 640px: the normal tap version takes over from the current step */
    phone.addEventListener('change', function () {
      if (!phone.matches) { pause(); tag.classList.remove('is-in'); root.classList.remove('is-auto'); return; }
      root.classList.add('is-auto');
      if (inView && !userPaused && !reduce && !document.hidden) play();
    });
    var width = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      root.style.setProperty('--sd-head', headerBottom() + 'px');
      placedAt = null;
      soon();
    });
    showCtrl();
  }

  /* phones: opts.camera = { src, width, height, fit, parts, message, focus, layer, main, store, marks, boxed, heavy } */
  function boxArea(a, b) {
    var x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return x > 0 && y > 0 ? x * y : 0;
  }

  function camera(root, copy, C) {
    var tabs = root.querySelector('.sd-tabs'), doneSrc = root.querySelector('[data-done]');
    if (!('IntersectionObserver' in window) || !C.src || !ENGINE_SRC || !tabs || !doneSrc) return;
    copy.removeAttribute('data-ready');
    var W = C.width || 1060, H = C.height || 696, PART_MS = C.parts || [], EDGE = 8, GAP = 12;
    var reduce = reduceQuery.matches;
    var box = document.createElement('div');
    box.className = 'sd sd--guided is-started is-auto sd-cam';
    if (root.getAttribute('style')) box.setAttribute('style', root.getAttribute('style'));
    box.innerHTML = tabs.outerHTML + '<div class="sd-window"><iframe inert tabindex="-1" aria-hidden="true" title="The demo playing in the app at laptop size"></iframe>' +
      '<p class="sd-autotag" aria-hidden="true"><span></span></p>' + doneSrc.outerHTML + '</div>' +
      '<p class="sd-cam__said" aria-live="polite"></p>' +
      '<div class="sd-autoctrl"><button type="button" class="hw-motion-ctrl" data-state="play">' + ICON_PAUSE + ICON_PLAY + '</button></div>';
    var next = root, above = root.getBoundingClientRect().bottom <= 0;
    while (next && !(next.nextElementSibling && next.nextElementSibling.getClientRects().length)) next = next.parentElement;
    next = next && next.nextElementSibling;
    var edge = next ? next.getBoundingClientRect().top : 0;
    root.parentNode.insertBefore(box, root.nextSibling);
    root.classList.add('has-cam');
    if (above && next) { var shift = next.getBoundingClientRect().top - edge; if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' }); }
    box.style.setProperty('--sd-head', headerBottom() + 'px');
    var cam = box.querySelector('.sd-window'), frame = cam.querySelector('iframe');
    var tag = box.querySelector('.sd-autotag'), tagText = tag.firstChild, said = box.querySelector('.sd-cam__said');
    var end = box.querySelector('[data-done]'), endReplay = box.querySelector('[data-replay]'), ctrl = box.querySelector('.hw-motion-ctrl');
    var steps = [].slice.call(box.querySelectorAll('.sd-step')), bars = steps.map(function (s) { return s.querySelector('.sd-tab__bar i'); });
    var raw = null, st = null, userPaused = false, started = false, playing = false, inView = false;
    var cur = { x: 0, y: 0, s: 1 }, moving = false, arrived = 0, idleMove = 0, lastMsgAt = 0;
    var partStart = [], partSpent = [], activePart = -1;
    var placedKey = null, placedAt = null, lastRect = null, settle = 0, storeSent = '', storeFramed = false;

    function send(cmd) { if (frame.contentWindow) frame.contentWindow.postMessage({ cd: cmd }, location.origin); }
    function build() {
      if (frame.getAttribute('srcdoc')) return;
      var head = '<meta charset="utf-8"><base href="' + esc(location.origin) + '/" target="_top">';
      [].forEach.call(document.querySelectorAll('link[href][rel="stylesheet"], link[href][rel="preload"][as="style"], style'), function (el) {
        head += el.tagName === 'STYLE' ? el.outerHTML : '<link rel="stylesheet" href="' + esc(el.href) + '">';
      });
      frame.setAttribute('srcdoc', '<!doctype html><html class="sd-cam-frame"><head>' + head + '</head><body class="hw-cd">' + copy.outerHTML +
        '<script>window.__cdCamera = true;<\/script><script src="' + esc(ENGINE_SRC) + '"><\/script><script src="' + esc(C.src) + '"><\/script></body></html>');
    }

    function zoom() { return Math.min(1, (cam.clientWidth - 2 * EDGE) / (C.fit || 340)); }
    function move(x, y, s, instant) {
      var same = Math.abs(x - cur.x) < 1 && Math.abs(y - cur.y) < 1 && Math.abs(s - cur.s) < 0.005;
      frame.style.transition = instant || reduce ? 'none' : 'transform .9s cubic-bezier(.65,0,.35,1)';
      frame.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
      cur = { x: x, y: y, s: s };
      moving = !(instant || reduce || same);
      if (moving) { tag.classList.remove('is-in'); placedKey = null; }
      clearTimeout(arrived);
      if (moving) arrived = setTimeout(function () { if (moving) { moving = false; st = view(); placedKey = null; showTag(); } }, 1000);
    }
    function clampX(x, s) { return Math.min(0, Math.max(cam.clientWidth - W * s, x)); }
    function clampY(y, s) { return Math.min(0, Math.max(cam.clientHeight - H * s, y)); }
    function toCam(r) { return r ? { x: cur.x + r.x * cur.s, y: cur.y + r.y * cur.s, w: r.w * cur.s, h: r.h * cur.s } : r; }
    function spot(r) {
      var cw = cam.clientWidth, ch = cam.clientHeight, s = zoom();
      var f = r.focus || r.target, t = r.target;
      var room = (cw - 2 * EDGE) / s, left = Math.min(f.x, t.x), col = null;
      (r.blocks || []).forEach(function (b) { if (b.w <= room * 1.6 && t.x + t.w - b.x <= room && (!col || b.w > col.w)) col = b; });
      if (col) left = Math.min(left, col.x);
      var x = EDGE - left * s;
      if (t.w * s > cw - 2 * EDGE) x = EDGE - t.x * s;
      else if (x + (t.x + t.w) * s > cw - EDGE) x = cw - EDGE - (t.x + t.w) * s;
      var bottom = Math.max(f.y + f.h, t.y + t.h) * s + 56;
      var y = bottom <= ch ? 0 : ch - bottom;
      if (f !== t && f.h > t.h * 1.5 && f.h * s <= ch - 2 * EDGE && (f.y * s + y < EDGE || (f.y + f.h) * s + y > ch - EDGE)) y = ch / 2 - (f.y + f.h / 2) * s;
      return { x: clampX(x, s), y: clampY(y, s), s: s };
    }
    function storeSize() {
      var cw = cam.clientWidth, ch = cam.clientHeight, s = Math.max(1, ch / 640);
      var w = Math.floor(cw / s), h = Math.floor(ch / s);
      return { s: s, w: w, h: h, img: Math.round(Math.max(96, Math.min(h - 400, h * 0.46))) };
    }
    function sendStore() {
      var z = storeSize(), k = z.w + 'x' + z.h + 'x' + z.img + 'x' + cam.clientHeight;
      if (k === storeSent || !frame.contentWindow) return;
      storeSent = k;
      frame.contentWindow.postMessage({ cd: 'store', w: z.w, h: z.h, img: z.img, short: cam.clientHeight / zoom() < 520 }, location.origin);
    }
    function aim() {
      if (!raw || !phone.matches) return;
      if (raw.storeOn && raw.app) {
        var z = storeSize();
        move(-raw.app.x * z.s, -raw.app.y * z.s, z.s, !storeFramed && !raw.started);
        storeFramed = true;
        return;
      }
      if (raw.done) return;
      if (!raw.started) { move(0, 0, zoom(), true); return; }
      if (raw.message) lastMsgAt = Date.now();
      var cw = cam.clientWidth, ch = cam.clientHeight;
      if (!raw.target && raw.message) {
        var mc = toCam(raw.message);
        if (mc.x < EDGE || mc.y < EDGE || mc.x + mc.w > cw - EDGE || mc.y + mc.h > ch - EDGE) {
          var mx = clampX(cw / 2 - (raw.message.x + raw.message.w / 2) * cur.s, cur.s), my = clampY(ch - 24 - (raw.message.y + raw.message.h) * cur.s, cur.s);
          if (Math.abs(mx - cur.x) > 8 || Math.abs(my - cur.y) > 8) move(mx, my, cur.s);
        }
        return;
      }
      if (!raw.target) {
        clearTimeout(idleMove);
        if (raw.main) idleMove = setTimeout(function () {
          if (!raw || raw.target || raw.message || raw.storeOn || !raw.main || Date.now() - lastMsgAt < 1500) return;
          var s0 = zoom(), x0 = clampX(EDGE - raw.main.x * s0, s0);
          if (cur.x > x0 + 2 || Math.abs(cur.s - s0) > 0.01) move(x0, cur.y, s0);
        }, 900);
        return;
      }
      clearTimeout(idleMove);
      function seen(r, bottomRoom) { var c = toCam(r); return c.x >= EDGE && c.y >= EDGE && c.x + c.w <= cw - EDGE && c.y + c.h <= ch - bottomRoom; }
      var fz = raw.focus && raw.focus.w * cur.s <= cw - 2 * EDGE ? raw.focus : null;
      if (seen(raw.target, 56) && (!fz || seen(fz, EDGE))) return;
      var p = spot(raw);
      if (Math.abs(p.x - cur.x) < 2 && Math.abs(p.y - cur.y) < 2 && Math.abs(cur.s - p.s) < 0.01) return;
      move(p.x, p.y, p.s);
    }
    function view() {
      if (!raw) return null;
      var o = {}; for (var k in raw) o[k] = raw[k];
      o.target = toCam(raw.target); o.focus = toCam(raw.focus);
      o.marks = (raw.marks || []).map(function (m) { var c = toCam(m); c.k = m.k; return c; });
      return o;
    }
    function onScreen(r) {
      if (!r || r.y < -1 || r.y + r.h > cam.clientHeight + 1) return false;
      var vis = Math.min(cam.clientWidth, r.x + r.w) - Math.max(0, r.x);
      return vis >= Math.min(r.w, 48) - 1;
    }
    function spots(c, f, w, h) {
      var cx = c.x + c.w / 2, cy = c.y + c.h / 2, out = [
        [cx - w / 2, c.y + c.h + GAP], [c.x, c.y + c.h + GAP], [c.x + c.w - w, c.y + c.h + GAP], [c.x, c.y + c.h + 4],
        [c.x, c.y - 4 - h], [cx - w / 2, c.y - GAP - h], [c.x, c.y - GAP - h], [c.x + c.w - w, c.y - GAP - h],
        [c.x + c.w + 10, cy - h / 2], [c.x - 10 - w, cy - h / 2]];
      if (f) out.push([f.x + f.w - 8 - w, cy - h / 2], [f.x + 8, f.y + f.h - h / 2], [f.x + f.w - 4 - w, f.y + f.h - h / 2], [f.x + 8, f.y - h / 2],
        [f.x + f.w - 4 - w, f.y - h / 2], [f.x + 8, f.y + f.h + GAP], [f.x + f.w - 4 - w, f.y + f.h + GAP]);
      return out;
    }
    function moved(a, b, px) { return !a || !b || Math.abs(a.x - b.x) > px || Math.abs(a.y - b.y) > px || Math.abs(a.w - b.w) > px || Math.abs(a.h - b.h) > px; }
    function showTag() {
      if (st && st.note && said.textContent !== st.note.join('. ')) said.textContent = st.note.join('. ');
      var on = st && st.started && !st.done && st.note && !st.inMessage && !st.messageOn && !moving && onScreen(st.target);
      if (!on) { tag.classList.remove('is-in'); placedKey = null; clearTimeout(settle); return; }
      var key = st.targetKey + '|' + st.note[0];
      if (key === placedKey && placedAt && !moved(placedAt, st.target, 4)) return;
      if (key !== placedKey || moved(lastRect, st.target, 0.5)) {
        if (key !== placedKey) { placedKey = key; placedAt = null; }
        if (!placedAt || moved(placedAt, st.target, 4)) { tag.classList.remove('is-in'); placedAt = null; }
        lastRect = st.target;
        clearTimeout(settle);
        settle = setTimeout(place, 280);
      }
    }
    function place() {
      if (!st || !st.note || !st.target || st.done || moving || !onScreen(st.target)) return;
      if (tagText.textContent !== st.note[0]) tagText.textContent = st.note[0];
      placedAt = st.target;
      var cw = cam.clientWidth, ch = cam.clientHeight, w = tag.offsetWidth, h = tag.offsetHeight, c = st.target;
      var f = st.focus && st.focus.h > c.h * 1.5 && st.focus.h < ch * 0.4 ? st.focus : null;
      var list = spots(c, f, w, h).map(function (p) { return { p: p }; }), best = null;
      if (st.field && c.w > cw * 0.6 && c.h <= 64) list.push({ p: [c.x + c.w - w - 10, c.y + c.h / 2 - h / 2], inside: true });
      list.forEach(function (o) {
        var b = { x: Math.max(EDGE, Math.min(cw - EDGE - w, o.p[0])), y: Math.max(EDGE, Math.min(ch - EDGE - h, o.p[1])), w: w, h: h };
        var score = o.inside ? 0 : boxArea(b, c) * 1000;
        (st.marks || []).forEach(function (m) { var a = boxArea(b, m); if (a) score += (a + (a < m.w * m.h * 0.9 ? m.w * m.h : 0)) * (m.k || 1); });
        score += Math.hypot(b.x + w / 2 - (c.x + c.w / 2), b.y + h / 2 - (c.y + c.h / 2)) * 4;
        if (!best || score < best.score) best = { b: b, score: score };
      });
      tag.style.transform = 'translate(' + Math.round(best.b.x) + 'px,' + Math.round(best.b.y) + 'px)';
      tag.classList.add('is-in');
    }
    function showEnd() {
      var on = !!(st && st.done), et = end.querySelector('[data-done-text]');
      if (on && et && st.doneText && et.textContent !== st.doneText) et.textContent = st.doneText;
      if (on && end.hidden) { end.hidden = false; void end.offsetWidth; end.classList.add('is-in'); }
      else if (!on && !end.hidden) { end.classList.remove('is-in'); end.hidden = true; }
    }
    function setFill(i, frac, ms) {
      var b = bars[i];
      if (!b) return;
      var f = String(frac), m = (ms || 0) + 'ms';
      if (b.style.getPropertyValue('--fill-ms') !== m) b.style.setProperty('--fill-ms', m);
      if (b.style.getPropertyValue('--fill') !== f) b.style.setProperty('--fill', f);
    }
    function freezeBars() {
      if (activePart < 0 || !bars[activePart]) return;
      var tr = getComputedStyle(bars[activePart]).transform, k = 0;
      if (tr && tr !== 'none') k = parseFloat(tr.split('(')[1]);
      partSpent[activePart] = (partSpent[activePart] || 0) + Date.now() - (partStart[activePart] || Date.now());
      setFill(activePart, k, 0);
    }
    function runBar(i) {
      if (!bars[i]) return;
      if (!partSpent[i]) { setFill(i, 0, 0); void bars[i].offsetWidth; }
      partStart[i] = Date.now();
      setFill(i, 0.95, Math.max(400, (PART_MS[i] || 10000) - (partSpent[i] || 0)));
    }
    function showSteps() {
      if (!st) return;
      st.steps.forEach(function (k, i) {
        if (!steps[i]) return;
        steps[i].classList.toggle('is-done', k === 'done');
        steps[i].classList.toggle('is-active', k === 'active');
        if (k === 'done') setFill(i, 1, 400);
        else if (k !== 'active') { setFill(i, 0, 0); partSpent[i] = 0; }
      });
      var a = st.steps.indexOf('active');
      if (st.done) { bars.forEach(function (_, i) { setFill(i, 1, 400); partSpent[i] = 0; }); a = -1; }
      if (a !== activePart) { activePart = a; if (a >= 0 && playing) runBar(a); }
    }
    function showCtrl() {
      var label = playing ? 'Pause the demo' : 'Play the demo';
      ctrl.setAttribute('data-state', playing ? 'pause' : 'play');
      ctrl.setAttribute('aria-label', label);
      ctrl.title = label;
    }
    function play() {
      if (playing || !phone.matches) return;
      build();
      playing = true;
      if (!started) { started = true; send('start'); } else send('play');
      if (activePart >= 0) runBar(activePart);
      showCtrl();
    }
    function pause() {
      if (!playing) return;
      playing = false;
      send('pause');
      freezeBars();
      showCtrl();
    }
    ctrl.addEventListener('click', function () { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
    endReplay.addEventListener('click', function () { userPaused = false; if (playing) send('play'); else play(); });

    new IntersectionObserver(function (es) { if (es[0].isIntersecting && phone.matches) build(); }, { rootMargin: '100% 0px' }).observe(cam);
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView && !userPaused && !reduce && phone.matches && !document.hidden) play();
      else if (!inView) pause();
    }, { threshold: 0.6 }).observe(cam);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else if (inView && !userPaused && !reduce && phone.matches) play();
    });
    phone.addEventListener('change', function () {
      if (!phone.matches) { pause(); return; }
      if (inView && !userPaused && !reduce && !document.hidden) play();
    });

    window.addEventListener('message', function (e) {
      if (e.source !== frame.contentWindow || e.origin !== location.origin || !e.data || e.data.cd !== 'state') return;
      raw = e.data;
      if (playing && !raw.started) send('start');
      sendStore();
      aim();
      st = view();
      showTag();
      showSteps();
      showEnd();
    });
    var width = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth !== width) { width = window.innerWidth; box.style.setProperty('--sd-head', headerBottom() + 'px'); }
      sendStore(); placedAt = null; aim(); st = view(); showTag();
    });
    frame.addEventListener('transitionend', function () { moving = false; st = view(); placedKey = null; showTag(); });
    frame.addEventListener('load', function () { move(0, 0, zoom(), true); });
    move(0, 0, zoom(), true);
    showCtrl();
  }

  function cameraInner(sd, C) {
    var start = sd.querySelector('[data-start]'), done = sd.querySelector('[data-done]'), replay = sd.querySelector('[data-replay]');
    if (!start || !done || !replay || window.parent === window) return;
    var home;
    try { home = window.parent.location.origin; } catch (e) { return; }
    var reduce = reduceQuery.matches;
    var playing = false, started = false, timer = 0, loopTimer = 0, last = null, raf = 0, msgSeen = false;
    function rect(el) {
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }
    function messages() { return C.message ? [].slice.call(sd.querySelectorAll(C.message)) : []; }
    function messageOn() { return messages().some(function (el) { return !el.hidden && el.classList.contains('is-in'); }); }
    function marks(t) {
      if (!t) return [];
      var layer = (C.layer && t.closest(C.layer)) || sd, out = [];
      function push(el, r, k) {
        if (!r.width || !r.height || r.bottom < 0 || r.top > window.innerHeight || getComputedStyle(el).visibility === 'hidden') return;
        out.push({ x: r.left, y: r.top, w: r.width, h: r.height, k: k });
      }
      if (C.marks) [].forEach.call(layer.querySelectorAll(C.marks), function (el) {
        if (el === t || el.contains(t) || el.closest('[hidden]')) return;
        var r = el.getBoundingClientRect();
        if (!(C.boxed && el.matches(C.boxed))) { var rg = document.createRange(); rg.selectNodeContents(el); var tr = rg.getBoundingClientRect(); if (tr.width && tr.height) r = tr; }
        push(el, r, C.heavy && el.matches(C.heavy) ? 3 : 1);
      });
      messages().forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width && r.height && !el.hidden && el.classList.contains('is-in')) out.push({ x: r.left - 10, y: r.top - 10, w: r.width + 20, h: r.height + 20, k: 3 });
      });
      [].forEach.call(layer.querySelectorAll('p, span, td, th, li, label, small, strong, b, div'), function (el) {
        if (el.children.length || !el.textContent.trim() || el === t || t.contains(el) || (C.marks && el.closest(C.marks)) || el.closest('[hidden]')) return;
        var rg = document.createRange(); rg.selectNodeContents(el);
        push(el, rg.getBoundingClientRect(), 1);
      });
      return out;
    }
    function blocks(u) {
      var out = [], el = u.parentElement, stop = sd.querySelector('.sd-window');
      while (el && el !== stop && out.length < 12) { var r = el.getBoundingClientRect(); if (r.width > 0) out.push({ x: r.left, y: r.top, w: r.width, h: r.height }); el = el.parentElement; }
      return out;
    }
    function state() {
      var t = sd.querySelector('.is-target');
      var a = !t && window.__cdAnchor && window.__cdAnchor.getClientRects().length ? window.__cdAnchor : null, u = t || a;
      var store = C.store && sd.querySelector(C.store), c = sd.querySelector('[data-callout]');
      var noteOn = c && !c.hidden && c.classList.contains('is-in'), mOn = messageOn();
      var title = c && c.querySelector('[data-callout-title]'), text = c && c.querySelector('[data-callout-text]');
      window.parent.postMessage({
        cd: 'state',
        target: rect(u),
        storeOn: !!(store && !store.hidden && !store.classList.contains('is-out')),
        focus: u ? rect((C.focus && u.closest(C.focus)) || u) : null,
        blocks: u ? blocks(u) : [],
        inMessage: !!(t && C.message && t.closest(C.message)),
        messageOn: mOn,
        message: mOn ? rect(messages().filter(function (el) { return el.classList.contains('is-in'); })[0]) : null,
        field: !!(t && (t.matches('input, textarea, select, [contenteditable], label') || t.querySelector('input, textarea'))),
        marks: marks(u),
        targetKey: t ? (t.getAttribute('data-act') || t.getAttribute('aria-label') || t.textContent.trim().slice(0, 20)) : a ? 'note' : null,
        note: noteOn && title && text ? [title.textContent, text.textContent] : null,
        steps: [].map.call(sd.querySelectorAll('.sd-step'), function (s) { return s.classList.contains('is-done') ? 'done' : s.classList.contains('is-active') ? 'active' : ''; }),
        done: !done.hidden,
        doneText: (done.querySelector('[data-done-text]') || {}).textContent || '',
        started: started,
        app: rect(sd.querySelector('[data-app]')),
        main: C.main ? rect(sd.querySelector(C.main)) : null
      }, home);
    }
    function soon() { cancelAnimationFrame(raf); raf = requestAnimationFrame(state); }
    new MutationObserver(soon).observe(sd, { subtree: true, attributes: true, childList: true, characterData: true, attributeFilter: ['class', 'hidden', 'style'] });

    function schedule() {
      msgSeen = false;
      clearTimeout(timer);
      if (!playing) return;
      var t = sd.querySelector('.is-target');
      if (!t) return;
      soon();
      timer = setTimeout(function go() {
        if (!playing || !t.classList.contains('is-target')) return;
        if (messageOn()) { msgSeen = true; timer = setTimeout(go, 300); return; }
        if (msgSeen) { msgSeen = false; timer = setTimeout(go, 1800); return; }
        if (!reduce) { t.classList.remove('is-auto-tap'); void t.offsetWidth; t.classList.add('is-auto-tap'); }
        timer = setTimeout(function () {
          t.classList.remove('is-auto-tap');
          if (playing && t.classList.contains('is-target')) t.click();
        }, reduce ? 0 : 420);
      }, 2800);
    }
    new MutationObserver(function () {
      var t = sd.querySelector('.is-target');
      if (t !== last) { last = t; schedule(); }
      if (!done.hidden && playing) {
        clearTimeout(loopTimer);
        loopTimer = setTimeout(function () { if (playing && !done.hidden) replay.click(); }, 4500);
      }
    }).observe(sd, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });

    window.addEventListener('message', function (e) {
      var m = e.data || {};
      if (e.source !== window.parent || e.origin !== home || !m.cd) return;
      if (m.cd === 'start' && !started) { started = true; playing = true; start.click(); soon(); }
      else if (m.cd === 'play') {
        if (playing && started && done.hidden) return;
        playing = true;
        if (!started) { started = true; start.click(); }
        else if (!done.hidden) replay.click();
        schedule(); soon();
      } else if (m.cd === 'pause') { playing = false; clearTimeout(timer); clearTimeout(loopTimer); soon(); }
      else if (m.cd === 'store') {
        var de = document.documentElement;
        de.classList.toggle('sd-cam-short', !!m.short);
        de.style.setProperty('--cam-store-w', m.w + 'px'); de.style.setProperty('--cam-store-h', m.h + 'px'); de.style.setProperty('--cam-img', m.img + 'px');
        soon();
      }
    });
    window.addEventListener('scroll', function () { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); });
    var lockBoxes = [sd, sd.querySelector('.sd-window'), sd.querySelector('[data-app]')];
    document.addEventListener('scroll', function (e) {
      if (lockBoxes.indexOf(e.target) >= 0 && (e.target.scrollTop || e.target.scrollLeft)) { e.target.scrollTop = 0; e.target.scrollLeft = 0; return; }
      soon();
    }, true);
    window.addEventListener('load', soon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
    soon();
  }

  var api = { create: create, esc: esc };
  var queue = window.hwClickDemos || [];
  window.hwClickDemos = { ready: true, push: function (fn) { fn(api); } };
  queue.forEach(function (fn) { fn(api); });
})();
