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
        var auto = root.classList.contains('is-auto');
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
    return G;
  }

  /* phones: opts.auto = { parts, message, field, focus, layer, marks, boxed, heavy } */
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
        out.push({ x: r.left - w.left, y: r.top - w.top, w: r.width, h: r.height, k: k });
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
      var best = null;
      list.forEach(function (o) {
        var b = { x: Math.max(EDGE, Math.min(cw - EDGE - w, o.p[0])), y: Math.max(EDGE, Math.min(ch - EDGE - h, o.p[1])), w: w, h: h };
        var score = o.inside ? 0 : area(b, c) * 1000;
        mk.forEach(function (m) { var a = area(b, m); if (a) score += (a + (a < m.w * m.h * 0.9 ? m.w * m.h : 0)) * (m.k || 1); });
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

  var api = { create: create, esc: esc };
  var queue = window.hwClickDemos || [];
  window.hwClickDemos = { ready: true, push: function (fn) { fn(api); } };
  queue.forEach(function (fn) { fn(api); });
})();
