(function () {
  document.querySelectorAll('[data-dps-views]').forEach(function (fig) {
    if (fig.dataset.ready) return;
    fig.dataset.ready = '1';
    var tabs = [].slice.call(fig.querySelectorAll('.hw-dps__tab'));
    var opts = [].slice.call(fig.querySelectorAll('.hw-dps__opt'));
    var views = [].slice.call(fig.querySelectorAll('.hw-dps__view'));
    var captions = [].slice.call(fig.querySelectorAll('.hw-dps__caption'));
    function show(list, i) {
      list.forEach(function (el, j) {
        el.classList.toggle('is-on', j === i);
        if (j === i) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      });
    }
    opts.forEach(function (opt, i) {
      opt.addEventListener('click', function () {
        opts.forEach(function (o, j) { o.classList.toggle('is-active', j === i); });
        show(views, i);
      });
    });
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t, j) { t.classList.toggle('is-active', j === i); t.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
        show(views, i);
        show(captions, i);
      });
    });
  });
})();
