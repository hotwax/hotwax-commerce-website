(function () {
  function init() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.hw-ps__stage').forEach(function (stage) {
      if (stage.classList.contains('is-glow-armed')) return;
      stage.classList.add('is-glow-armed');
      var io = new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        var viewH = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
        if (entry.intersectionRatio >= 0.25 || entry.intersectionRect.height >= viewH * 0.5) {
          stage.classList.add('is-glowing');
        } else if (!entry.isIntersecting) {
          stage.classList.remove('is-glowing');
        }
      }, { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25] });
      io.observe(stage);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
