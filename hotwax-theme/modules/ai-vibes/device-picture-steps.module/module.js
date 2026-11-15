(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-dps-views]').forEach(function (fig) {
    if (fig.dataset.ready) return;
    fig.dataset.ready = '1';
    var tabs = [].slice.call(fig.querySelectorAll('.hw-dps__tab'));
    var views = [].slice.call(fig.querySelectorAll('.hw-dps__view'));
    var captions = [].slice.call(fig.querySelectorAll('.hw-dps__caption'));
    var box = fig.querySelector('.hw-dps__captions');
    var timer;
    function show(list, i) {
      list.forEach(function (el, j) {
        el.classList.toggle('is-on', j === i);
        if (j === i) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      });
    }
    function resize(change) {
      if (!box || (reduce && reduce.matches)) { change(); return; }
      var from = box.offsetHeight;
      clearTimeout(timer);
      box.style.height = '';
      change();
      var to = box.offsetHeight;
      if (from === to) { box.style.overflow = ''; return; }
      box.style.overflow = 'hidden';
      box.style.height = from + 'px';
      void box.offsetHeight;
      box.style.height = to + 'px';
      timer = setTimeout(function () { box.style.height = ''; box.style.overflow = ''; }, 350);
    }
    function prepare() {
      views.forEach(function (v) {
        var img = v.querySelector('img');
        if (!img) return;
        img.loading = 'eager';
        if (img.decode) img.decode().catch(function () {});
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); prepare(); }
      }, { rootMargin: '400px 0px' });
      io.observe(fig);
    } else {
      prepare();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (tab.classList.contains('is-active')) return;
        tabs.forEach(function (t, j) { t.classList.toggle('is-active', j === i); t.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
        show(views, i);
        resize(function () { show(captions, i); });
      });
    });
  });
})();
