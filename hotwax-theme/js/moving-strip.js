(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setUp(strip) {
    if (strip.hasAttribute('data-strip-ready')) return;
    strip.setAttribute('data-strip-ready', '');
    var set = strip.querySelector('[data-strip-set]');
    var reel = strip.querySelector('[data-strip-reel]');
    var ctrl = strip.querySelector('[data-strip-ctrl]');
    if (!set || !reel || !ctrl) return;

    var speed = parseFloat(strip.getAttribute('data-strip-speed')) || 40;
    var pauseLabel = strip.getAttribute('data-strip-pause') || 'Pause';
    var playLabel = strip.getAttribute('data-strip-play') || 'Play';

    var tpl = document.createElement('template');
    tpl.innerHTML = set.outerHTML;
    var copy = tpl.content.firstElementChild;
    copy.setAttribute('aria-hidden', 'true');
    copy.removeAttribute('aria-label');
    copy.removeAttribute('aria-labelledby');
    Array.prototype.forEach.call(copy.querySelectorAll('img'), function (img) { img.alt = ''; });
    set.parentNode.appendChild(copy);

    function timing() {
      var width = set.getBoundingClientRect().width;
      if (width) strip.style.setProperty('--strip-dur', Math.round(width / speed) + 's');
    }

    function sync() {
      var still = reduce.matches;
      strip.classList.toggle('is-rolling', !still);
      ctrl.hidden = still;
      if (still) {
        reel.setAttribute('tabindex', '0');
        reel.setAttribute('role', 'region');
        if (set.hasAttribute('aria-labelledby')) reel.setAttribute('aria-labelledby', set.getAttribute('aria-labelledby'));
        else reel.setAttribute('aria-label', set.getAttribute('aria-label') || 'Moving strip');
      } else {
        reel.removeAttribute('tabindex');
        reel.removeAttribute('role');
        reel.removeAttribute('aria-label');
        reel.removeAttribute('aria-labelledby');
      }
    }

    ctrl.addEventListener('click', function () {
      var paused = strip.classList.toggle('is-paused');
      var label = paused ? playLabel : pauseLabel;
      ctrl.setAttribute('data-state', paused ? 'play' : 'pause');
      ctrl.setAttribute('aria-label', label);
      ctrl.title = label;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        strip.classList.toggle('is-away', !entries[0].isIntersecting);
      }).observe(strip);
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
    Array.prototype.forEach.call(document.querySelectorAll('[data-hw-strip]'), setUp);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
