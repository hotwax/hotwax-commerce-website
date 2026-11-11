(function () {
  var HEXA = [];
  for (var q = 0; q < 6; q++) {
    var ang = Math.PI / 180 * (60 * q - 90);
    HEXA.push([Math.cos(ang), Math.sin(ang)]);
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(sec) {
    if (sec.hasAttribute('data-hw-ready')) return;
    sec.setAttribute('data-hw-ready', '');

    var cv = sec.querySelector('.hw-ff__grid');
    var ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    var eyebrow = sec.querySelector('.hw-ff__eyebrow');
    var title = sec.querySelector('.hw-ff__title');
    var sub = sec.querySelector('.hw-ff__subtitle');
    var slot = sec.querySelector('.hw-ff__slot');
    var line = sec.querySelector('.hw-ff__line');
    var hop = sec.querySelector('.hw-ff__hop');
    var cta = sec.querySelector('.hw-ff__cta');
    var btn = cta && cta.querySelector('a');

    function showLine() {
      if (line && !line.classList.contains('is-on')) line.classList.add('is-on');
    }

    initJumps(sec);
    if (!ctx || !slot || !btn) {
      fitTitle();
      window.addEventListener('resize', fitTitle);
      showLine();
      return;
    }

    var DUR = 2200, RINGS = 14, RING_STEP = 85, RING_MS = 620;
    var W = 0, H = 0, dpr = 1, hr = 40, hv = 60, horizon = 0, cells = [];
    var t0 = null, rippleAt = -1, raf = 0, started = false;

    // one line from 768px, shrunk to fit but never below 32px; past that, and on phones, it wraps
    function fitTitle() {
      if (!title) return;
      var phrases = title.querySelectorAll('.hw-ff__phrase');
      title.style.fontSize = '';
      title.style.whiteSpace = '';
      [].forEach.call(phrases, function (p) { p.style.whiteSpace = ''; });
      var avail = title.clientWidth;
      if (window.innerWidth >= 768) {
        var probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit';
        probe.textContent = title.textContent;
        title.appendChild(probe);
        var w = probe.getBoundingClientRect().width, size = parseFloat(getComputedStyle(title).fontSize) * avail / w;
        title.removeChild(probe);
        if (w <= avail) return;
        if (size >= 32) { title.style.fontSize = size + 'px'; return; }
        title.style.whiteSpace = 'normal';
      }
      [].forEach.call(phrases, function (p) { if (p.getBoundingClientRect().width > avail) p.style.whiteSpace = 'normal'; });
    }

    // layout position inside the section, ignoring the fade-up transform
    function pos(el) {
      var x = 0, y = 0, e = el;
      while (e && e !== sec) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    }

    function build() {
      fitTitle();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = sec.clientWidth;
      H = sec.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      hr = W < 640 ? 28 : 40;
      hv = 1.5 * hr;
      var hw = Math.sqrt(3) * hr;
      horizon = cta.offsetTop - (window.innerWidth >= 992 ? 78 : window.innerWidth > 640 ? 104 : 70);
      // the grid lines up with the line under the subtitle, so the text never moves
      var sp = pos(slot), off = (sp.y + sp.h / 2) % hv;
      cells = [];
      for (var row = -1, y = off - hv; y < H + hr; row++, y += hv) {
        for (var col = 0, x = row & 1 ? hw / 2 : 0; x < W + hw; col++, x += hw) cells.push({ x: x, y: y, row: row, col: col, ring: 99 });
      }
      // ripple rings: hex distance of every cell from the cell behind the button
      var bp = pos(btn), ox = bp.x + bp.w / 2, oy = bp.y + bp.h / 2, origin = cells[0], best = 1e9;
      cells.forEach(function (c) { var d = Math.hypot(c.x - ox, c.y - oy); if (d < best) { best = d; origin = c; } });
      function axial(c) { return [c.col - (c.row - (c.row & 1)) / 2, c.row]; }
      var oa = axial(origin);
      cells.forEach(function (c) {
        var a = axial(c), dq = a[0] - oa[0], dr = a[1] - oa[1];
        c.ring = (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
      });
    }

    function hexPath(x, y, r) {
      ctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var px = x + r * HEXA[k][0], py = y + r * HEXA[k][1];
        if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
    }

    // faint hexes, strongest along a flat line just above the button, fading upwards, to the bottom and to the sides
    function paint(now) {
      var t = reduce.matches || t0 === null ? 1e9 : now - t0;
      var a = Math.min(1, t / DUR), ease = 1 - Math.pow(1 - a, 3), lift = (1 - ease) * 40;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var band = ctx.createLinearGradient(0, horizon - 110, 0, horizon + 160);
      band.addColorStop(0, 'rgba(236,34,39,0)');
      band.addColorStop(0.4, 'rgba(236,34,39,' + (0.035 * ease).toFixed(3) + ')');
      band.addColorStop(1, 'rgba(236,34,39,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, horizon - 110, W, 270);
      ctx.lineWidth = 1;
      for (var i = 0; i < cells.length; i++) {
        var p = cells[i], y = p.y + lift;
        var up = y < horizon ? Math.pow(Math.max(0, y / horizon), 0.8) : 1;
        var down = y > horizon ? Math.pow(Math.max(0, Math.min(1, (H - y) / Math.max(120, (H - horizon) * 0.85))), 1.3) : 1;
        var side = Math.max(0, Math.min(1, p.x / (W * 0.18), (W - p.x) / (W * 0.18)));
        var al = 0.032 * up * up * down * side * ease, ink = '0,0,0';
        if (al <= 0.004) continue;
        if (rippleAt >= 0 && p.ring <= RINGS) {
          var re = (t - rippleAt - p.ring * RING_STEP) / RING_MS;
          if (re > 0 && re < 1) {
            ink = '236,34,39';
            al = Math.min(1, al + 0.13 * Math.sin(Math.PI * re) * (1 - p.ring / (RINGS + 1)) * Math.sqrt(Math.min(1, al / 0.032)));
          }
        }
        ctx.strokeStyle = 'rgba(' + ink + ',' + al.toFixed(3) + ')';
        hexPath(p.x, y, hr);
        ctx.stroke();
      }
      return t < DUR || (rippleAt >= 0 && t < rippleAt + RINGS * RING_STEP + RING_MS);
    }

    function loop(now) {
      if (t0 === null) t0 = now;
      raf = paint(now) ? requestAnimationFrame(loop) : 0;
    }

    function redraw() {
      build();
      if (!raf) paint(performance.now());
    }

    // the red hex leaves the button, flies to the slot and hands over the line; the ripple starts as the button is pressed
    function pop() {
      var A, C, s0 = null, pressed = false, START = 1500, FLY = 900, FADE = 320, HAND = FLY * 0.75;
      function measure() {
        var b = pos(btn), sp = pos(slot);
        A = [b.x + b.w / 2, b.y + 6];
        C = [sp.x + sp.w / 2, sp.y + sp.h / 2];
      }
      function step(now) {
        if (s0 === null) s0 = now;
        var tf = now - s0 - START, x = 0, y = 0, sc = 1, op = 1, sx = 1, sy = 1;
        if (tf < 0) {
          op = 0;
        } else {
          if (!pressed) {
            pressed = true;
            measure();
            if (t0 !== null) rippleAt = now - t0;
            if (!raf) raf = requestAnimationFrame(loop);
            btn.classList.add('is-pressed');
            setTimeout(function () { btn.classList.remove('is-pressed'); }, 140);
          }
          var u = Math.min(1, tf / FLY), k = 1 - Math.pow(1 - u, 3);
          x = A[0] + (C[0] - A[0]) * k;
          y = A[1] + (C[1] - A[1]) * k;
          sc = 0.25 + 0.75 * Math.min(1, u / 0.3);
          sx = 0.88 + 0.12 * k;
          sy = 1.12 - 0.12 * k;
          if (tf >= HAND) {
            var ud = Math.min(1, (tf - HAND) / FADE);
            sc *= 1 - 0.8 * ud;
            op = 1 - ud;
            showLine();
          }
        }
        if (hop) {
          hop.style.opacity = op;
          hop.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (sc * sx) + ',' + (sc * sy) + ')';
        }
        if (tf < HAND + FADE + 20) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function start() {
      if (started) return;
      started = true;
      build();
      if (reduce.matches) {
        paint(0);
        showLine();
        return;
      }
      raf = requestAnimationFrame(loop);
      pop();
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[entries.length - 1].isIntersecting) { io.disconnect(); start(); }
      });
      io.observe(sec);
    } else {
      start();
    }

    var timer = 0;
    function later() {
      clearTimeout(timer);
      timer = setTimeout(function () { if (started) redraw(); }, 150);
    }
    if ('ResizeObserver' in window) new ResizeObserver(later).observe(sec);
    else window.addEventListener('resize', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  }

  function slug(text) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // # links scroll down the page: to the element with that id, or to the Image Accordion item
  // with that title (#store-inventory opens Store inventory)
  function initJumps(sec) {
    sec.addEventListener('click', function (event) {
      var a = event.target.closest ? event.target.closest('a[data-ff-jump]') : null;
      if (!a || !sec.contains(a) || !a.hash) return;
      var id = '';
      try { id = decodeURIComponent(a.hash.slice(1)); } catch (e) { return; }
      var target = document.getElementById(id), hit = null;
      if (!target) {
        [].some.call(document.querySelectorAll('[data-hw-ia] .hw-ia__btn'), function (b) {
          if (slug(b.textContent) !== id) return false;
          hit = b;
          return true;
        });
        if (!hit) return;
        target = hit.closest('[data-hw-ia]');
      }
      event.preventDefault();
      var to = target, focus = hit;
      if (hit) {
        var item = hit.closest('.hw-ia__item');
        if (item && !item.classList.contains('is-open')) hit.click();
        if (item && window.matchMedia('(max-width: 1068px)').matches) to = item;
      } else {
        focus = target.querySelector('h1, h2, h3') || target;
        if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1');
      }
      var header = document.querySelector('header'), offset = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      window.scrollTo({ top: to.getBoundingClientRect().top + window.pageYOffset - offset - (to === target ? 0 : 16), behavior: reduce.matches ? 'auto' : 'smooth' });
      if (focus.focus) focus.focus({ preventScroll: true });
    });
  }

  function initAll() {
    document.querySelectorAll('[data-hw-ff]').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
