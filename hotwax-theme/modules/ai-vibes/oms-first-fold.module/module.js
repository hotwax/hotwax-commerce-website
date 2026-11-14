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
    return window.innerWidth <= 640;
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

    // re-measured every frame, so a change in window size, fonts or the panel's height never leaves the line stale
    function measure() {
      var sr = sec.getBoundingClientRect(), vr = vis.getBoundingClientRect();
      var L = vr.left - sr.left, R = vr.right - sr.left, T = vr.top - sr.top, H = sr.height;
      var c = Math.round(Math.min(48, L * 0.14)), x1 = Math.round(L * 0.5), y1 = Math.round(T + vr.height * 0.32);
      var xr = Math.round(sr.width - x1), y2 = Math.round(T + vr.height * 0.68);
      setD(p1, 'M' + x1 + ' -8V' + (y1 - c) + 'Q' + x1 + ' ' + y1 + ' ' + (x1 + c) + ' ' + y1 + 'H' + L);
      setD(p2, 'M' + R + ' ' + y2 + 'H' + (xr - c) + 'Q' + xr + ' ' + y2 + ' ' + xr + ' ' + (y2 + c) + 'V' + (H + 8));
      dots[0].setAttribute('cx', L);
      dots[0].setAttribute('cy', y1);
      G = { sr: sr, H: H, edge: y2 + c, a: p2._l - 8 };
      if (p3 && red) {
        var hr = sheet.getBoundingClientRect(), pt = period();
        var xs = sr.left + xr - hr.left, px = pt.x - hr.left, py = pt.y - hr.top, k = Math.min(c, py / 2);
        setD(p3, 'M' + xs + ' 0V' + (py - k) + 'Q' + xs + ' ' + py + ' ' + (xs - k) + ' ' + py + 'H' + px);
        G.hr = hr;
        G.l3 = p3._l;
      }
    }

    function at(p, d, dot) {
      var pt = p.getPointAtLength(d);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
    }

    // how far the tail (with its dot) has travelled; the line itself rides on the two layers that scroll
    function track() {
      if (!p3 || !red || phone()) return;
      measure();
      var top = parseFloat(getComputedStyle(pin).top) || 0;
      var s = Math.max(0, G.H - (G.hr.top - G.sr.top));
      if (G.hr.top < top + 53) s = Infinity;
      var travel = G.H - 52;
      var sc = G.H - G.edge;
      // one smooth speed curve: fast as the line leaves the screen, clear of the corner before the frost reaches it,
      // then easing off as e^(-s/tau) so the tail stays on screen while the text rises to meet it
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
        p2.style.visibility = '';
        p2.style.strokeDasharray = Math.max(0, G.a - s + 40 - P) + ' ' + (p2._l + 10);
        p2.style.strokeDashoffset = -P;
        p3.style.visibility = '';
        p3.style.strokeDasharray = 'none';
        p3.style.strokeDashoffset = 0;
        at(p2, P, dots[1]);
        dots[1].style.visibility = '';
        dot3.style.visibility = 'hidden';
      } else {
        var cut3 = G.l3 - left, gone = left < 0.5;
        p2.style.visibility = 'hidden';
        dots[1].style.visibility = 'hidden';
        p3.style.visibility = gone ? 'hidden' : '';
        p3.style.strokeDasharray = G.l3 + ' ' + (G.l3 + 10);
        p3.style.strokeDashoffset = -cut3;
        at(p3, Math.min(cut3, G.l3), dot3);
        dot3.style.visibility = gone ? 'hidden' : 'visible';
      }
    }

    function draw() {
      if (phone()) return;
      measure();
      p1.style.strokeDasharray = p1._l;
      if (done) p1.style.strokeDashoffset = 0;
      if (done) track();
      else {
        p2.style.strokeDasharray = p2._l;
        var s0 = p2.getPointAtLength(0);
        dots[1].setAttribute('cx', s0.x);
        dots[1].setAttribute('cy', s0.y);
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
      var s0 = p2.getPointAtLength(0);
      dots[1].setAttribute('cx', s0.x);
      dots[1].setAttribute('cy', s0.y);
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
      if (done && !still && raf === null) raf = requestAnimationFrame(function () { raf = null; track(); });
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (started && (done || still)) draw();
    });

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
