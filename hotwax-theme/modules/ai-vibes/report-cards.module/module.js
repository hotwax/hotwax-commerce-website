(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function whenSettled(fn) {
    if (window.hwSettled) {
      window.hwSettled.then(fn);
    } else if (document.readyState === 'complete') {
      fn();
    } else {
      window.addEventListener('load', function () {
        if (window.hwSettled) window.hwSettled.then(fn);
        else fn();
      }, { once: true });
    }
  }

  function count(nums) {
    var start = performance.now();
    var duration = 900;
    (function tick(now) {
      var k = Math.max(0, Math.min(1, (now - start) / duration));
      var eased = 1 - Math.pow(1 - k, 3);
      nums.forEach(function (n) {
        n.textContent = Math.round(+n.dataset.count * eased).toLocaleString('en-US') + (n.dataset.suffix || '');
      });
      if (k < 1) requestAnimationFrame(tick);
    })(start);
  }

  function init(root) {
    var grid = root.querySelector('[data-hw-rp-cards]');
    if (!grid) return;
    var tiles = [].slice.call(grid.querySelectorAll('.hw-rp-tile'));

    grid.addEventListener('click', function (event) {
      var tile = event.target.closest('.hw-rp-tile');
      if (!tile) return;
      tiles.forEach(function (other) {
        if (other !== tile) other.classList.remove('is-tap');
      });
      tile.classList.toggle('is-tap');
    });

    if (reduce || !('IntersectionObserver' in window)) return;
    grid.classList.add('hw-rp-anim');
    void grid.offsetWidth;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var tile = entry.target;
        setTimeout(function () {
          tile.classList.add('is-in');
          count([].slice.call(tile.querySelectorAll('[data-count]')));
        }, 60);
      });
    }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

    whenSettled(function () {
      tiles.forEach(function (tile) { io.observe(tile); });
    });
  }

  [].forEach.call(document.querySelectorAll('[data-hw-rp]'), init);
})();
