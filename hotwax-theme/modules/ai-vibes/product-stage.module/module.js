(function () {
  function inView(entry, ratio) {
    var viewH = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;
    return entry.intersectionRatio >= ratio || entry.intersectionRect.height >= viewH * 0.5;
  }

  function initGlow(stage) {
    if (stage.classList.contains('is-glow-armed')) return;
    stage.classList.add('is-glow-armed');
    var io = new IntersectionObserver(function (entries) {
      var entry = entries[entries.length - 1];
      if (inView(entry, 0.25)) {
        stage.classList.add('is-glowing');
      } else if (!entry.isIntersecting) {
        stage.classList.remove('is-glowing');
      }
    }, { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25] });
    io.observe(stage);
  }

  function initChat(chat, reduce) {
    if (chat.classList.contains('is-on')) return;
    var win = chat.parentNode;
    var flow = chat.querySelector('.hw-ps__chat-flow');
    var log = chat.querySelector('.hw-ps__chat-log');
    var box = chat.querySelector('.hw-ps__chat-typed');
    var typed = chat.querySelector('.hw-ps__chat-typedtxt');
    var user = chat.querySelector('.hw-ps__chat-user');
    var prompt = user.querySelector('.hw-ps__chat-txt').textContent;
    var dots = chat.querySelector('.hw-ps__chat-dots');
    var cards = chat.querySelectorAll('.hw-ps__chat-card');
    var parts = [user, chat.querySelector('.hw-ps__chat-bot'), chat.querySelector('.hw-ps__chat-lead'), chat.querySelector('.hw-ps__chat-cards')]
      .concat(Array.prototype.slice.call(cards), [chat.querySelector('.hw-ps__chat-note')]);

    var phone = window.matchMedia('(max-width: 734px)');
    var full = 0;

    function measure() {
      var hidden = parts.filter(function (el) { return el && !el.classList.contains('is-shown'); });
      hidden.forEach(function (el) { el.classList.add('is-shown'); });
      full = flow.scrollHeight;
      hidden.forEach(function (el) { el.classList.remove('is-shown'); });
    }
    function scale() {
      var k = chat.clientWidth / 714;
      chat.style.setProperty('--chat-k', k);
      if (phone.matches) {
        var h = Math.max(1460, full + 293);
        chat.style.setProperty('--chat-h', h + 'px');
        chat.style.height = h * k + 'px';
      } else {
        chat.style.removeProperty('--chat-h');
        chat.style.height = '';
      }
    }
    function fit() {
      requestAnimationFrame(function () {
        var shift = Math.max(0, flow.scrollHeight - log.clientHeight);
        flow.style.transform = shift ? 'translateY(' + -shift + 'px)' : '';
      });
    }
    function show(el) {
      if (!el) return;
      el.classList.add('is-shown');
      fit();
    }
    function wait(ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    chat.classList.add('is-on');
    win.classList.add('has-chat');
    measure();
    scale();
    function onResize() {
      scale();
      fit();
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(onResize).observe(chat);
    } else {
      window.addEventListener('resize', onResize);
    }
    if (phone.addEventListener) {
      phone.addEventListener('change', function () {
        measure();
        onResize();
      });
    }

    if (reduce) {
      parts.forEach(show);
      chat.classList.add('is-tint', 'is-decide');
      return;
    }

    function type() {
      chat.classList.add('is-typing');
      var i = 0;
      return new Promise(function (resolve) {
        (function next() {
          if (i >= prompt.length) return resolve();
          var ch = prompt.charAt(i++);
          typed.textContent += ch;
          chat.classList.add('is-ready');
          if (box.scrollHeight > box.clientHeight) box.style.height = box.scrollHeight + 'px';
          setTimeout(next, ch === ' ' ? 55 : /[.,]/.test(ch) ? 160 : 28);
        })();
      });
    }

    function play() {
      var step = Promise.resolve();
      function then(fn, ms) {
        step = step.then(fn).then(function () { return wait(ms); });
      }
      then(function () {}, 700);
      then(type, 550);
      then(function () { chat.classList.remove('is-typing'); chat.classList.add('is-sent'); }, 160);
      then(function () { typed.textContent = ''; box.style.height = ''; chat.classList.remove('is-ready'); show(user); }, 300);
      then(function () { chat.classList.remove('is-sent'); }, 400);
      then(function () { show(parts[1]); show(dots); }, 1400);
      then(function () { dots.classList.remove('is-shown'); show(parts[2]); show(parts[3]); }, 300);
      Array.prototype.forEach.call(cards, function (card) {
        then(function () { show(card); }, 450);
      });
      then(function () { show(parts[parts.length - 1]); }, 300);
      then(function () { chat.classList.add('is-tint', 'is-decide'); }, 0);
    }

    var io = new IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].intersectionRatio >= 0.6) {
        io.disconnect();
        play();
      }
    }, { threshold: [0, 0.6] });
    io.observe(chat.querySelector('.hw-ps__chat-prompt'));
  }

  function init() {
    if (!('IntersectionObserver' in window)) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) document.querySelectorAll('.hw-ps__stage').forEach(initGlow);
    document.querySelectorAll('.hw-ps__chat').forEach(function (chat) {
      initChat(chat, reduce);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
