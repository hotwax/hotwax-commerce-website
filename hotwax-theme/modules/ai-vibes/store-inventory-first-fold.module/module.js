(function () {
  function run(app) {
    if (!app.getAnimations) return;
    var btn = app.querySelector('[data-fx-ctrl]'), cnt = [].slice.call(app.querySelectorAll('.fx-cnt'));
    var END = 16000, LABELS = { pause: 'Pause animation', play: 'Play animation', replay: 'Replay animation' }, loop = 0;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    cnt.forEach(function (e) { e.classList.add('is-js'); });
    app.classList.add('is-ready');
    function anims() { return app.getAnimations({ subtree: true }); }
    function state(s) { btn.setAttribute('data-state', s); btn.setAttribute('aria-label', LABELS[s]); btn.title = LABELS[s]; }
    function tick() {
      cnt.forEach(function (e) { var v = Math.round(parseFloat(getComputedStyle(e).getPropertyValue('--fx-n' + e.dataset.c)) || 0); if (e.textContent !== String(v)) e.textContent = v; });
      var a = anims()[0], t = a ? a.currentTime : END;
      if (t >= END) { if (btn.getAttribute('data-state') !== 'replay') state('replay'); return; }
      loop = requestAnimationFrame(tick);
    }
    btn.addEventListener('click', function () {
      if (reduce) return;
      var s = btn.getAttribute('data-state'), list = anims();
      cancelAnimationFrame(loop);
      if (s === 'replay') { list.forEach(function (a) { a.currentTime = 0; a.play(); }); state('pause'); loop = requestAnimationFrame(tick); }
      else if (s === 'pause') { list.forEach(function (a) { a.pause(); }); state('play'); }
      else { list.forEach(function (a) { a.play(); }); state('pause'); loop = requestAnimationFrame(tick); }
    });
    tick();
  }
  function boot() { [].forEach.call(document.querySelectorAll('.sim-fx'), run); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
