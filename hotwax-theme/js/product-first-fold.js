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
      G = { sr: sr, H: H, edge: y2 + c, a: p2._l - 8, y: window.pageYOffset };
      if (p3 && red) {
        var hr = sheet.getBoundingClientRect(), pt = period();
        var xs = sr.left + xr - hr.left, px = pt.x - hr.left, py = pt.y - hr.top, k = Math.min(c, py / 2);
        setD(p3, 'M' + xs + ' 0V' + (py - k) + 'Q' + xs + ' ' + py + ' ' + (xs - k) + ' ' + py + 'H' + px);
        G.hr = hr;
        G.l3 = p3._l;
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
        return { a: [Math.max(0, G.a - s + 40 - P) + ' ' + (p2._l + 10), -P, 1], b: ['none', 0, 1], d1: [spot(p2, P), 1], d3: [spot(p3, 0), 0] };
      }
      var cut3 = G.l3 - left, on = left < 0.5 ? 0 : 1;
      return { a: ['0 ' + (p2._l + 10), 0, 0], b: [G.l3 + ' ' + (G.l3 + 10), -cut3, on], d1: [spot(p2, 0), 0], d3: [spot(p3, Math.min(cut3, G.l3)), on] };
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

    var ride = [];
    function stopRide() {
      ride.forEach(function (a) { a.cancel(); });
      ride = [];
    }

    // the browser moves the tail with the scroll itself: keyframes for every part of the line, placed along the page's scroll
    function startRide() {
      stopRide();
      var se = document.scrollingElement || document.documentElement, max = se.scrollHeight - se.clientHeight;
      if (max <= 0) return;
      var top = parseFloat(getComputedStyle(pin).top) || 0;
      var y0 = G.y - (G.H - (G.hr.top - G.sr.top)), gone = G.y + G.hr.top - top - 53, y1 = Math.min(gone, y0 + G.H - 52);
      var ys = [0, max], n = 48, i;
      for (i = 0; i <= n; i++) ys.push(y0 + (y1 - y0) * i / n);
      ys.push(gone, gone + 0.01, y1 + 0.01);
      var lo = y0, hi = y1;
      for (i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (state(rise(m)).a[2]) lo = m; else hi = m; }
      ys.push(lo, hi);
      ys = ys.filter(function (y) { return y >= 0 && y <= max; }).sort(function (x, z) { return x - z; });
      var k = { a: [], b: [], d1: [], d3: [] };
      ys.forEach(function (y) {
        var t = state(rise(y)), o = y / max;
        k.a.push({ offset: o, strokeDasharray: t.a[0], strokeDashoffset: t.a[1] + 'px', opacity: t.a[2] });
        k.b.push({ offset: o, strokeDasharray: t.b[0], strokeDashoffset: t.b[1] + 'px', opacity: t.b[2] });
        k.d1.push({ offset: o, transform: t.d1[0], opacity: t.d1[1] });
        k.d3.push({ offset: o, transform: t.d3[0], opacity: t.d3[1] });
      });
      p2.style.visibility = p3.style.visibility = dots[1].style.visibility = '';
      dot3.style.visibility = 'visible';
      [[p2, k.a], [p3, k.b], [dots[1], k.d1], [dot3, k.d3]].forEach(function (e) {
        ride.push(e[0].animate(e[1], { timeline: timeline, fill: 'both', easing: 'linear' }));
      });
    }

    function track() {
      if (!p3 || !red || phone()) return;
      measure();
      if (timeline && !still) { startRide(); return; }
      apply(state(rise(G.y)));
    }

    function draw() {
      if (phone()) return;
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
