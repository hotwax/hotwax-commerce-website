// On This Page Menu: lists every H2 in the Pillar Guide main column (.pg-main),
// marks the section being read and fills the progress bar. Scrolling to a
// section is the browser's own smooth scroll (html { scroll-behavior: smooth }).
(function () {
  var navs = document.querySelectorAll('[data-otp]');
  if (!navs.length) return;
  var scope = document.querySelector('.pg-main');
  if (!scope) return;

  function slug(text) {
    return text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  }

  var heads = Array.prototype.filter.call(scope.querySelectorAll('h2'), function (h) {
    return h.textContent.trim();
  });

  navs.forEach(function (nav) {
    var labels = {};
    try {
      var data = nav.querySelector('[data-otp-labels]');
      (data ? JSON.parse(data.textContent) : []).forEach(function (pair) {
        labels[String(pair[0]).replace(/\s+/g, ' ').trim().toLowerCase()] = String(pair[1]);
      });
    } catch (e) { labels = {}; }

    var used = {};
    var items = heads.map(function (h) {
      var text = h.textContent.replace(/\s+/g, ' ').trim();
      var label = labels[text.toLowerCase()] || text;
      if (!h.id) {
        var id = slug(label), n = 2;
        while (used[id] || document.getElementById(id)) { id = slug(label) + '-' + n++; }
        h.id = id;
      }
      used[h.id] = true;
      return { el: h, label: label };
    });

    nav.querySelectorAll('[data-otp-list]').forEach(function (list) {
      items.forEach(function (it) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + it.el.id;
        a.textContent = it.label;
        li.appendChild(a);
        list.appendChild(li);
      });
    });

    if (!items.length) return;
    nav.hidden = false;

    // A shared link to a section (#id) arrives before the ids exist: go there now.
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target && scope.contains(target)) target.scrollIntoView({ block: 'start' });
    }

    var links = nav.querySelectorAll('a[href^="#"]');
    var bar = nav.querySelector('details');
    var current = nav.querySelector('[data-otp-current]');
    var progress = nav.querySelector('[data-otp-progress]');
    var introText = current ? current.textContent : '';
    var marker = nav.querySelector('[data-otp-marker]');

    // Move the red bar to the current item. The first placement skips the slide.
    function placeMarker(active) {
      if (!marker) return;
      var a = active && nav.querySelector('.otp__side a[href="#' + active.el.id + '"]');
      if (!a || !a.offsetHeight) { marker.style.opacity = '0'; return; }
      marker.style.transform = 'translateY(' + a.offsetTop + 'px)';
      marker.style.height = a.offsetHeight + 'px';
      marker.style.opacity = '1';
      if (!marker.classList.contains('is-ready')) {
        marker.getBoundingClientRect();
        marker.classList.add('is-ready');
      }
    }

    Array.prototype.forEach.call(nav.querySelectorAll('.otp__bar a'), function (a) {
      a.addEventListener('click', function () { if (bar) bar.open = false; });
    });

    var ticking = false, shown;
    function update() {
      ticking = false;
      // A clicked heading stops at its scroll-margin-top (set in pillar-guide.css),
      // so the "current" line sits just below that.
      var line = (parseFloat(getComputedStyle(items[0].el).scrollMarginTop) || 0) + 2, active = null;
      items.forEach(function (it) { if (it.el.getBoundingClientRect().top <= line) active = it; });
      if (active !== shown) {
        shown = active;
        Array.prototype.forEach.call(links, function (a) {
          var on = !!active && a.getAttribute('href') === '#' + active.el.id;
          a.classList.toggle('is-on', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
        if (current) current.textContent = active ? active.label : introText;
        placeMarker(active);
      }
      if (progress) {
        var r = scope.getBoundingClientRect();
        var total = r.height - window.innerHeight * 0.6;
        var done = Math.min(Math.max(-r.top + line, 0), total);
        progress.style.transform = 'scaleX(' + (total > 0 ? done / total : 0) + ')';
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { placeMarker(shown); onScroll(); });
    update();
  });
})();
