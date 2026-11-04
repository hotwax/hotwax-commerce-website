(function () {
  var SPEED = 66;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setUp(film) {
    if (film.hasAttribute('data-hw-fs-ready')) return;
    film.setAttribute('data-hw-fs-ready', '');
    var set = film.querySelector('.hw-fs__set');
    var ctrl = film.querySelector('.hw-fs__ctrl');
    if (!set || !ctrl) return;

    var copy = set.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.removeAttribute('aria-label');
    copy.removeAttribute('aria-labelledby');
    Array.prototype.forEach.call(copy.querySelectorAll('img'), function (img) { img.alt = ''; });
    set.parentNode.appendChild(copy);

    function timing() {
      var width = set.getBoundingClientRect().width;
      if (width) film.style.setProperty('--fs-dur', Math.round(width / SPEED) + 's');
    }

    var reel = film.querySelector('.hw-fs__reel');

    function sync() {
      var still = reduce.matches;
      film.classList.toggle('is-rolling', !still);
      ctrl.hidden = still;
      if (still) {
        reel.setAttribute('tabindex', '0');
        reel.setAttribute('role', 'region');
        reel.setAttribute('aria-label', set.getAttribute('aria-label') || 'Customer stores');
      } else {
        reel.removeAttribute('tabindex');
        reel.removeAttribute('role');
        reel.removeAttribute('aria-label');
      }
    }

    ctrl.addEventListener('click', function () {
      var paused = film.classList.toggle('is-paused');
      var label = paused ? 'Play the photos' : 'Pause the photos';
      ctrl.setAttribute('data-state', paused ? 'play' : 'pause');
      ctrl.setAttribute('aria-label', label);
      ctrl.title = label;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        film.classList.toggle('is-away', !entries[0].isIntersecting);
      }).observe(film);
    }

    if (reduce.addEventListener) reduce.addEventListener('change', sync);
    window.addEventListener('resize', timing);
    Array.prototype.forEach.call(set.querySelectorAll('img'), function (img) {
      if (!img.complete) img.addEventListener('load', timing, { once: true });
    });
    timing();
    sync();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-hw-fs]'), setUp);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
