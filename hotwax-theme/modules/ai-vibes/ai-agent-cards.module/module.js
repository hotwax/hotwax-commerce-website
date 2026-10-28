(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

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

  function span(cls, text, hidden) {
    var el = document.createElement('span');
    el.className = cls;
    if (text) el.textContent = text;
    if (hidden) el.setAttribute('aria-hidden', 'true');
    return el;
  }

  function init(root) {
    var list = root.querySelector('.hw-oai__list');
    if (!list) return;

    var items = [].slice.call(list.querySelectorAll('.hw-oai__card')).filter(function (card) {
      var q = card.querySelector('.hw-oai__q');
      return q && q.textContent.trim();
    }).map(function (card) {
      var q = card.querySelector('.hw-oai__q');
      var text = q.textContent;
      var typed = span('hw-oai__typed', '', true);
      var caret = span('hw-oai__caret', '', true);
      var rest = span('hw-oai__rest', text, true);
      caret.hidden = true;
      q.textContent = '';
      q.appendChild(span('hw-oai__sr', text));
      q.appendChild(typed);
      q.appendChild(caret);
      q.appendChild(rest);
      card.classList.add('hw-oai__card--anim');
      return { card: card, text: text, typed: typed, caret: caret, rest: rest, seen: false };
    });
    if (!items.length) return;

    var next = 0;
    var waiting = false;
    var watch;

    function laterSeen() {
      return items.slice(next + 1).some(function (item) { return item.seen; });
    }

    function finish(item) {
      item.typed.textContent = item.text;
      item.rest.textContent = '';
      item.caret.remove();
      item.card.classList.add('is-answered');
    }

    function type() {
      if (next >= items.length) {
        watch.disconnect();
        return;
      }
      var item = items[next];
      if (!item.seen) {
        if (laterSeen()) {
          finish(item);
          next += 1;
          type();
          return;
        }
        waiting = true;
        return;
      }
      var n = 0;
      item.caret.hidden = false;
      (function step() {
        n += 1;
        item.typed.textContent = item.text.slice(0, n);
        item.rest.textContent = item.text.slice(n);
        if (n < item.text.length) {
          setTimeout(step, item.text.charAt(n - 1) === ' ' ? 45 : 32);
          return;
        }
        setTimeout(function () {
          item.caret.remove();
          item.card.classList.add('is-answered');
          next += 1;
          setTimeout(type, 350);
        }, 250);
      })();
    }

    whenSettled(function () {
      watch = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          items.forEach(function (item) {
            if (item.card === entry.target) item.seen = entry.isIntersecting;
          });
        });
        if (waiting && next < items.length && (items[next].seen || laterSeen())) {
          waiting = false;
          type();
        }
      }, { rootMargin: '0px 0px -15% 0px' });
      items.forEach(function (item) { watch.observe(item.card); });

      new IntersectionObserver(function (entries, io) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect();
          setTimeout(type, 200);
        });
      }, { rootMargin: '0px 0px -25% 0px' }).observe(list);
    });
  }

  function start() {
    [].forEach.call(document.querySelectorAll('[data-hw-oai]'), init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
