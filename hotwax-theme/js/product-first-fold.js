(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 'cubic-bezier(.2,0,0,1)';

  function settledPromise() {
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

  function phone() {
    return window.innerWidth <= 767;
  }

  function init(root) {
    if (root.hasAttribute('data-hw-ready')) return;
    root.setAttribute('data-hw-ready', '');

    var pin = root.querySelector('.hw-osh__pin');
    var sec = root.querySelector('.hw-osh__fold');
    var vis = root.querySelector('.hw-osh__vis');
    var svg = root.querySelector('.hw-osh__stroke');
    var sheet = root.querySelector('.hw-osh__sheet');
    if (!pin || !sec || !vis || !svg) return;

    var timeline = window.ScrollTimeline && Element.prototype.animate ? new ScrollTimeline({ source: document.scrollingElement || document.documentElement }) : null;
    var sizedWidth = 0;
    function size() {
      if (window.innerWidth === sizedWidth) return;
      sizedWidth = window.innerWidth;
      root.style.setProperty('--osh-vh', window.innerHeight + 'px');
    }
    size();
    window.addEventListener('resize', size);

    if (sheet) {
      var frost = function () {
        var r = sheet.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.min(1, Math.max(0, (vh - r.top) / vh));
        root.style.setProperty('--osh-blur', (20 + 10 * p).toFixed(1) + 'px');
        root.style.setProperty('--osh-scrim', (0.8 + 0.08 * p).toFixed(3));
      };
      frost();
      window.addEventListener('scroll', function () {
        if (!reduce.matches && !phone()) frost();
      }, { passive: true });
      window.addEventListener('resize', frost);
    }

    var p1 = svg.querySelector('.hw-osh__in'), p2 = svg.querySelector('.hw-osh__out'), dots = svg.querySelectorAll('circle');
    var ssvg = sheet && sheet.querySelector('.hw-osh__trail');
    var p3 = ssvg && ssvg.querySelector('path'), dot3 = ssvg && ssvg.querySelector('circle');
    var red = sheet && sheet.querySelector('.hw-osh__words p:last-child');
    if (!red || !red.firstChild || red.firstChild.nodeType !== 3) red = null;
    var still = reduce.matches, done = false, pending = false, intro = [], raf = null, G = null;
    var base = null, ctx = null;

    // the middle of the full stop's own ink, measured with the font as drawn on this screen
    function period() {
      var n = red.firstChild;
      if (!base) {
        base = document.createElement('span');
        base.setAttribute('aria-hidden', 'true');
        base.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        red.appendChild(base);
      }
      var r = document.createRange();
      r.setStart(n, n.length - 1);
      r.setEnd(n, n.length);
      var b = r.getBoundingClientRect(), cs = getComputedStyle(red);
      ctx = ctx || document.createElement('canvas').getContext('2d');
      ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var m = ctx.measureText(n.data.charAt(n.length - 1));
      return {
        x: b.left + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
        y: base.getBoundingClientRect().top - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
      };
    }

    function setD(p, d) {
      if (p.getAttribute('d') !== d) {
        p.setAttribute('d', d);
        p._l = p.getTotalLength();
      }
    }

    // re-measured whenever the line is rebuilt, so a change in window size, fonts or the panel's height never leaves the line stale
    function measure() {
      var sr = sec.getBoundingClientRect(), vr = vis.getBoundingClientRect();
      var L = vr.left - sr.left, R = vr.right - sr.left, T = vr.top - sr.top, H = sr.height;
      var c = Math.round(Math.min(48, L * 0.14)), x1 = Math.round(L * 0.5), y1 = Math.round(T + vr.height * 0.32);
      var xr = Math.round(sr.width - x1), y2 = Math.round(T + vr.height * 0.68);
      setD(p1, 'M' + x1 + ' -8V' + (y1 - c) + 'Q' + x1 + ' ' + y1 + ' ' + (x1 + c) + ' ' + y1 + 'H' + L);
      setD(p2, 'M' + R + ' ' + y2 + 'H' + (xr - c) + 'Q' + xr + ' ' + y2 + ' ' + xr + ' ' + (y2 + c) + 'V' + (H + 8));
      dots[0].setAttribute('cx', L);
      dots[0].setAttribute('cy', y1);
      G = { sr: sr, H: H, edge: y2 + c, a: p2._l - 8, y: window.pageYOffset, f2: xr - c - R, e2: H + 8 - y2 - c };
      if (p3 && red) {
        var hr = sheet.getBoundingClientRect(), pt = period();
        var xs = sr.left + xr - hr.left, px = pt.x - hr.left, py = pt.y - hr.top, k = Math.min(c, py / 2);
        setD(p3, 'M' + xs + ' 0V' + (py - k) + 'Q' + xs + ' ' + py + ' ' + (xs - k) + ' ' + py + 'H' + px);
        G.hr = hr;
        G.l3 = p3._l;
        G.f3 = py - k;
        G.e3 = xs - k - px;
      }
    }

    function spot(p, d) {
      var pt = p.getPointAtLength(d);
      return 'translate(' + pt.x.toFixed(2) + 'px,' + pt.y.toFixed(2) + 'px)';
    }

    function at(p, d, dot) {
      dot.style.transform = spot(p, d);
    }

    // how far the panel has risen over the fold, for a given scroll position
    function rise(y) {
      var top = parseFloat(getComputedStyle(pin).top) || 0, dy = y - G.y;
      if (G.hr.top - dy < top + 53) return Infinity;
      return Math.max(0, G.H - (G.hr.top - G.sr.top) + dy);
    }

    // the line for a given rise: the tail (with its dot) travels along the two lines into the full stop.
    // one smooth speed curve: fast as the line leaves the screen, clear of the corner before the frost reaches it,
    // then easing off as e^(-s/tau) so the tail stays on screen while the text rises to meet it
    function state(s) {
      var travel = G.H - 52, sc = G.H - G.edge;
      var whole = G.a + G.l3, more = whole - travel, need = G.a - 0.92 * sc, left;
      if (s >= travel) left = 0;
      else if (more <= 0 || need / more <= 0.92 * sc / travel) left = whole * (1 - s / travel);
      else {
        var r = Math.min(0.999, need / more), lo = 1, hi = 1e5, tau = 1;
        for (var i = 0; i < 40; i++) {
          tau = (lo + hi) / 2;
          if ((1 - Math.exp(-0.92 * sc / tau)) / (1 - Math.exp(-travel / tau)) > r) lo = tau;
          else hi = tau;
        }
        var v0 = more / (tau * (1 - Math.exp(-travel / tau)));
        left = Math.max(0, whole - s - v0 * tau * (1 - Math.exp(-s / tau)));
      }
      if (left > G.l3) {
        var P = G.a - s - (left - G.l3);
        var D = Math.max(0, G.a - s + 40 - P);
        return { a: [D + ' ' + (p2._l + 10), -P, 1], b: ['none', 0, 1], d1: [spot(p2, P), 1], d3: [spot(p3, 0), 0], ia: [P, P + D], ib: [0, G.l3], la: P, lb: 0, oa: 1, ob: 1, od1: 1, od3: 0 };
      }
      var cut3 = G.l3 - left, on = left < 0.5 ? 0 : 1;
      return { a: ['0 ' + (p2._l + 10), 0, 0], b: [G.l3 + ' ' + (G.l3 + 10), -cut3, on], d1: [spot(p2, 0), 0], d3: [spot(p3, Math.min(cut3, G.l3)), on], ia: [0, 0], ib: [cut3, G.l3], la: 0, lb: Math.min(cut3, G.l3), oa: 0, ob: on, od1: 0, od3: on };
    }

    function apply(t) {
      p2.style.strokeDasharray = t.a[0];
      p2.style.strokeDashoffset = t.a[1];
      p2.style.visibility = t.a[2] ? '' : 'hidden';
      p3.style.strokeDasharray = t.b[0];
      p3.style.strokeDashoffset = t.b[1];
      p3.style.visibility = t.b[2] ? '' : 'hidden';
      dots[1].style.transform = t.d1[0];
      dots[1].style.visibility = t.d1[1] ? '' : 'hidden';
      dot3.style.transform = t.d3[0];
      dot3.style.visibility = t.d3[1] ? 'visible' : 'hidden';
    }

    var ride = [], inkA = null, inkB = null, built = '';
    function stopRide() {
      ride.forEach(function (a) { a.cancel(); });
      ride = [];
      built = '';
      if (inkA) inkA.style.visibility = inkB.style.visibility = 'hidden';
    }

    // plain boxes laid over each line's own box: the browser moves these with the scroll by itself, an SVG stroke waits for the page each frame
    function layer(art) {
      var box = document.createElement('div');
      box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:absolute;top:0;left:0;z-index:0;width:100%;height:100%;pointer-events:none;overflow:' + getComputedStyle(art).overflow;
      art.parentNode.insertBefore(box, art.nextSibling);
      return box;
    }

    function piece(box, w, h, round, color) {
      var e = document.createElement('i');
      e.style.cssText = 'position:absolute;top:0;left:0;width:' + w + 'px;height:' + h + 'px;background:' + color + ';transform-origin:0 0' + (round ? ';border-radius:50%' : '');
      box.appendChild(e);
      return e;
    }

    // a line as short straight pieces: the two straight runs whole, the corner in twelve
    function chords(p, first, last) {
      var cuts = [0, first], n = 12, out = [], i;
      for (i = 1; i < n; i++) cuts.push(first + (p._l - last - first) * i / n);
      cuts.push(p._l - last, p._l);
      for (i = 0; i < cuts.length - 1; i++) {
        var a = p.getPointAtLength(cuts[i]), b = p.getPointAtLength(cuts[i + 1]);
        out.push({ s0: cuts[i], s1: cuts[i + 1], x: a.x, y: a.y, t: Math.atan2(b.y - a.y, b.x - a.x), len: Math.hypot(b.x - a.x, b.y - a.y) });
      }
      return out;
    }

    function place(pt, r) {
      return 'translate(' + (pt.x - r).toFixed(2) + 'px,' + (pt.y - r).toFixed(2) + 'px)';
    }

    // a page can hide the line with its own styles; the pieces stay away there too
    function hidden(art) {
      var cs = getComputedStyle(art);
      return cs.visibility === 'hidden' || +cs.opacity === 0 || !art.getClientRects().length;
    }

    function part(f) {
      return Math.min(1, Math.max(0, f));
    }

    // the browser moves the tail with the scroll itself: keyframes for every part of the line, placed along the page's scroll
    function startRide() {
      var se = document.scrollingElement || document.documentElement, max = se.scrollHeight - se.clientHeight;
      var top = parseFloat(getComputedStyle(pin).top) || 0;
      var key = [p2.getAttribute('d'), p3.getAttribute('d'), max, top, G.y + G.sr.top, G.y + G.hr.top, hidden(svg), hidden(ssvg)].join();
      if (ride.length && key === built) return;
      stopRide();
      if (max <= 0) {
        apply(state(rise(G.y)));
        return;
      }
      var y0 = G.y - (G.H - (G.hr.top - G.sr.top)), gone = G.y + G.hr.top - top - 53, y1 = Math.min(gone, y0 + G.H - 52);
      var ys = [0, max], n = 240, i;
      for (i = 0; i <= n; i++) ys.push(y0 + (y1 - y0) * i / n);
      ys.push(gone, gone + 0.01, y1 + 0.01);
      var lo = y0, hi = y1;
      for (i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (state(rise(m)).a[2]) lo = m; else hi = m; }
      ys.push(lo, hi);
      ys = ys.filter(function (y) { return y >= 0 && y <= max; }).sort(function (x, z) { return x - z; });
      var color = getComputedStyle(p2).stroke, sw = parseFloat(getComputedStyle(p2).strokeWidth) || 4, fill = getComputedStyle(dots[1]).fill, r = +dots[1].getAttribute('r') || 5;
      if (!inkA) {
        inkA = layer(svg);
        inkB = layer(ssvg);
      }
      var states = ys.map(function (y) { return state(rise(y)); }), parts = [];
      [[inkA, p2, G.f2, G.e2, 'ia', 'la', 'oa', 'od1', svg], [inkB, p3, G.f3, G.e3, 'ib', 'lb', 'ob', 'od3', ssvg]].forEach(function (q) {
        var box = q[0], p = q[1];
        box.textContent = '';
        if (hidden(q[8])) return;
        chords(p, q[2], q[3]).forEach(function (c) {
          parts.push([piece(box, c.len + 1, sw, false, color), function (t) {
            var span = c.s1 - c.s0 || 1, f0 = part((t[q[4]][0] - c.s0) / span), f1 = part((t[q[4]][1] - c.s0) / span), w = Math.max(0, f1 - f0);
            return { transform: 'translate(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px) rotate(' + c.t.toFixed(5) + 'rad) translate(' + (f0 * c.len).toFixed(2) + 'px,' + (-sw / 2) + 'px) scaleX(' + w.toFixed(5) + ')', opacity: t[q[6]] && w > 0 ? 1 : 0 };
          }]);
        });
        parts.push([piece(box, sw, sw, true, color), function (t) {
          var iv = t[q[4]];
          return { transform: place(p.getPointAtLength(iv[1]), sw / 2), opacity: t[q[6]] && iv[1] - iv[0] > 0.5 ? 1 : 0 };
        }]);
        parts.push([piece(box, 2 * r, 2 * r, true, fill), function (t) {
          return { transform: place(p.getPointAtLength(t[q[5]]), r), opacity: t[q[7]] };
        }]);
      });
      p2.style.visibility = p3.style.visibility = dots[1].style.visibility = dot3.style.visibility = 'hidden';
      inkA.style.visibility = inkB.style.visibility = '';
      parts.forEach(function (e) {
        var frames = states.map(function (t, j) {
          var f = e[1](t);
          f.offset = ys[j] / max;
          return f;
        });
        ride.push(e[0].animate(frames, { timeline: timeline, fill: 'both', easing: 'linear' }));
      });
      built = key;
    }

    function track() {
      if (!p3 || !red) return;
      if (phone()) {
        stopRide();
        return;
      }
      measure();
      if (timeline && !still) { startRide(); return; }
      apply(state(rise(G.y)));
    }

    function draw() {
      if (phone()) {
        stopRide();
        return;
      }
      measure();
      p1.style.strokeDasharray = p1._l;
      if (done) p1.style.strokeDashoffset = 0;
      if (done) track();
      else {
        p2.style.strokeDasharray = p2._l;
        at(p2, 0, dots[1]);
      }
    }

    function show(el) {
      el.style.opacity = 1;
    }

    // jump straight to the finished line, then follow the scroll
    function settle() {
      if (done) return;
      intro.forEach(function (a) { a.cancel(); });
      intro = [];
      p1.style.strokeDashoffset = 0;
      show(dots[0]);
      show(dots[1]);
      done = true;
      track();
    }

    function runIntro() {
      if (phone()) return;
      done = false;
      pending = false;
      if (p3) p3.style.visibility = 'hidden';
      p2.style.visibility = '';
      p2.style.strokeDasharray = p2._l;
      dots[0].style.opacity = 0;
      dots[1].style.opacity = 0;
      dots[1].style.visibility = '';
      stopRide();
      if (dot3) dot3.style.visibility = 'hidden';
      at(p2, 0, dots[1]);
      p1.style.strokeDashoffset = p1._l;
      p2.style.strokeDashoffset = p2._l;
      if (!p1.animate) { settle(); return; }
      var a1 = p1.animate([{ strokeDashoffset: p1._l }, { strokeDashoffset: 0 }], { duration: 1400, delay: 300, easing: EASE, fill: 'forwards' });
      a1.onfinish = function () { show(dots[0]); };
      var t = setTimeout(function () { show(dots[1]); }, 1500);
      var a2 = p2.animate([{ strokeDashoffset: p2._l }, { strokeDashoffset: 0 }], { duration: 1000, delay: 1500, easing: EASE, fill: 'forwards' });
      a2.onfinish = function () {
        intro = [];
        done = true;
        track();
        a2.cancel();
        a1.cancel();
        p1.style.strokeDashoffset = 0;
      };
      intro = [a1, a2, { cancel: function () { clearTimeout(t); } }];
    }

    function play() {
      if (phone()) return;
      draw();
      if (still) {
        p1.style.strokeDashoffset = 0;
        p2.style.strokeDashoffset = 0;
        show(dots[0]);
        show(dots[1]);
        done = true;
        track();
        return;
      }
      if (window.pageYOffset > 10) {
        settle();
        pending = true;
        return;
      }
      runIntro();
    }

    var started = false, lastY = window.pageYOffset;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset, down = y > lastY;
      lastY = y;
      if (!started) return;
      if (pending && y <= 10) { runIntro(); return; }
      if (!done && intro.length && (down || y > 10)) settle();
      if (done && !still && !timeline && raf === null) raf = requestAnimationFrame(function () { raf = null; track(); });
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (started && (done || still)) draw();
    });
    if (timeline && window.ResizeObserver) {
      var tall = 0, again = null;
      new ResizeObserver(function () {
        var h = document.documentElement.scrollHeight;
        if (h === tall || !started || !done || still) return;
        tall = h;
        cancelAnimationFrame(again);
        again = requestAnimationFrame(track);
      }).observe(document.body);
    }

    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([fonts, settledPromise()]).then(function () {
      requestAnimationFrame(function () {
        started = true;
        play();
      });
    });
  }

  function boot() {
    [].forEach.call(document.querySelectorAll('[data-hw-osh]'), init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
