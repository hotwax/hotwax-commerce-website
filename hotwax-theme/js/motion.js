(function () {
  if (window.hwMotion) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(onView, { threshold: [0, 0.35] }) : null;
  var copies = 0;
  var LABELS = { pause: 'Pause animation', play: 'Play animation', replay: 'Replay animation' };

  function shown(svg) {
    return svg.getClientRects().length > 0;
  }

  function shownIn(wrap) {
    return Array.prototype.filter.call(wrap.querySelectorAll('svg[data-hwm]'), shown)[0];
  }

  /* The pause / play / replay button below a graphic follows the version on screen */
  function sync(svg) {
    var wrap = svg.closest('[data-hwm-wrap]');
    var button = wrap && wrap.querySelector('[data-hwm-ctrl]');
    if (!button || shownIn(wrap) !== svg) return;
    var state = svg._done ? 'replay' : (svg._userPaused ? 'play' : 'pause');
    if (button.getAttribute('data-state') === state) return;
    button.setAttribute('data-state', state);
    button.setAttribute('aria-label', LABELS[state]);
    button.title = LABELS[state];
  }

  function waiting(svg) {
    return !!svg.closest('[inert]') || !shown(svg);
  }

  function play(svg) {
    if (reduce.matches) return;
    svg._started = true;
    svg._done = false;
    svg.classList.remove('is-live', 'is-paused');
    void svg.getBoundingClientRect();
    svg.classList.add('is-live');
    sync(svg);
  }

  function onView(entries) {
    entries.forEach(function (entry) {
      var svg = entry.target;
      svg._inView = entry.intersectionRatio >= 0.35;
      if (svg._userPaused) return;
      if (svg._inView) {
        if (!svg._started && !waiting(svg)) {
          play(svg);
        } else if (svg._started) {
          svg.classList.remove('is-paused');
        }
      } else if (svg.classList.contains('is-live') && svg._started && !svg._done) {
        svg.classList.add('is-paused');
      }
    });
  }

  /* If the same graphic appears twice on a page, give this copy its own ids (kept inside the prefix) */
  function ownIds(svg) {
    var first = svg.querySelector('[id]');
    if (!first || document.querySelectorAll('[id="' + first.id + '"]').length < 2) return;
    var mark = 'c' + (++copies) + '-';
    var rename = function (id) { return id.replace(/^(hwm-[a-z]+-[dm]-)/, '$1' + mark); };
    svg.querySelectorAll('[id]').forEach(function (el) { el.id = rename(el.id); });
    svg.querySelectorAll('use').forEach(function (el) {
      var ref = el.getAttribute('href');
      if (ref && ref.charAt(0) === '#') el.setAttribute('href', '#' + rename(ref.slice(1)));
    });
    svg.querySelectorAll('[filter], [fill], [stroke]').forEach(function (el) {
      ['filter', 'fill', 'stroke'].forEach(function (attr) {
        var value = el.getAttribute(attr);
        if (value && value.indexOf('url(#') === 0) el.setAttribute(attr, 'url(#' + rename(value.slice(5, -1)) + ')');
      });
    });
  }

  function setUp(svg) {
    if (svg._hwm) return;
    svg._hwm = true;
    ownIds(svg);
    var clock = svg.querySelector('.hwm-clock');
    if (clock) {
      clock.addEventListener('animationend', function () { svg._done = true; sync(svg); });
    }
    var wrap = svg.closest('[data-hwm-wrap]');
    if (wrap) wrap.setAttribute('data-hwm-ready', '');
    if (reduce.matches) return;
    sync(svg);
    if (!io) {
      svg._done = true;
      sync(svg);
      return;
    }
    svg.classList.add('is-live', 'is-paused');
    io.observe(svg);
  }

  function init(root) {
    (root || document).querySelectorAll('svg[data-hwm]').forEach(setUp);
  }

  window.hwMotion = {
    init: init,
    playIn: function (root) {
      root.querySelectorAll('svg[data-hwm]').forEach(function (svg) {
        setUp(svg);
        if (!shown(svg)) return;
        svg._userPaused = false;
        play(svg);
        if (io && !svg._inView) svg.classList.add('is-paused');
      });
    }
  };

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[data-hwm-ctrl]');
    if (!button || reduce.matches) return;
    var svg = shownIn(button.closest('[data-hwm-wrap]'));
    if (!svg) return;
    setUp(svg);
    if (svg._done) {
      svg._userPaused = false;
      play(svg);
    } else if (svg._userPaused) {
      svg._userPaused = false;
      if (svg._started) {
        svg.classList.remove('is-paused');
      } else {
        play(svg);
      }
    } else {
      svg._userPaused = true;
      svg.classList.add('is-paused');
    }
    sync(svg);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
