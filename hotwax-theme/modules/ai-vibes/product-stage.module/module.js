(function () {
  function init() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.hw-ps__stage').forEach(function (stage) {
      if (stage.classList.contains('is-glow-armed')) return;
      stage.classList.add('is-glow-armed');
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          stage.classList.add('is-glowing');
          io.disconnect();
        }
      }, { threshold: 0.25 });
      io.observe(stage);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
