(function () {
  var STEP = 260;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function curve(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2;
    return 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
  }

  function place(el, box) {
    var col = el.parentNode.getBoundingClientRect();
    var x = col.left - box.left + el.offsetLeft;
    var y = col.top - box.top + el.offsetTop;
    return { left: x, right: x + el.offsetWidth, mid: y + el.offsetHeight / 2 };
  }

  function draw(flow) {
    var svg = flow.querySelector('.hw-rf__lines');
    var hub = flow.querySelector('[data-rf-hub]');
    if (!svg || !hub || getComputedStyle(svg).display === 'none') return;
    var box = flow.getBoundingClientRect();
    var h = place(hub, box);
    var d = '';
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    Array.prototype.forEach.call(flow.querySelectorAll('[data-rf-in]'), function (el) {
      var r = place(el, box);
      d += '<path d="' + curve(r.right, r.mid, h.left, h.mid) + '"/>';
    });
    Array.prototype.forEach.call(flow.querySelectorAll('[data-rf-out]'), function (el) {
      var r = place(el, box);
      d += '<path d="' + curve(h.right, h.mid, r.left, r.mid) + '"/>';
    });
    svg.innerHTML = d;
  }

  function count(el, delay) {
    var text = el.textContent.trim();
    var m = text.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var end = parseFloat(m[2].replace(/,/g, ''));
    var dec = (m[2].split('.')[1] || '').length;
    var comma = m[2].indexOf(',') > -1;
    function show(v) {
      var s = comma ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
      el.textContent = m[1] + s + m[3];
    }
    show(0);
    setTimeout(function () {
      var t0 = performance.now();
      (function tick(now) {
        var k = Math.min(1, (now - t0) / 900);
        show(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
        else el.textContent = text;
      })(t0);
    }, delay);
  }

  function play(root) {
    var d = 0;
    Array.prototype.forEach.call(root.querySelectorAll('[data-rf-in]'), function (el, i) {
      d = i * STEP;
      el.style.transitionDelay = d + 'ms';
    });
    d += STEP * 2;
    var lines = root.querySelector('.hw-rf__lines');
    if (lines) lines.style.transitionDelay = d + 'ms';
    root.querySelector('[data-rf-hub]').style.transitionDelay = d + 'ms';
    Array.prototype.forEach.call(root.querySelectorAll('[data-rf-out]'), function (el, i) {
      var dd = d + STEP * 2 + i * STEP;
      el.style.transitionDelay = dd + 'ms';
      Array.prototype.forEach.call(el.querySelectorAll('[data-rf-count]'), function (n) { count(n, dd); });
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-on'); });
    });
  }

  function setUp(root) {
    var flow = root.querySelector('.hw-rf__flow');
    if (!flow || !root.querySelector('[data-rf-hub]')) return;
    var redraw = function () { draw(flow); };
    redraw();
    window.addEventListener('load', redraw);
    if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(flow);
    else window.addEventListener('resize', redraw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

    if (reduce.matches || !('IntersectionObserver' in window)) return;
    root.classList.add('hw-rf--anim');
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      play(root);
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(flow);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-hw-rf]'), setUp);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
