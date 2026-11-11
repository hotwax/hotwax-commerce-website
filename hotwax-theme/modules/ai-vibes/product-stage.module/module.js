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
    var reply = chat.querySelector('.hw-ps__chat-reply');
    var replyDots = reply.querySelector('.hw-ps__chat-dots');
    var answer = reply.querySelector('.hw-ps__chat-answer');
    var accept = chat.querySelector('[data-accept]');
    var tip = chat.querySelector('.hw-ps__chat-tip');
    var done = win.querySelector('.hw-ps__end [data-done]');
    var run = 0;
    var tipTimer;
    var keyboard = false;
    var refocus = false;

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

    function showAll() {
      parts.forEach(show);
      chat.classList.add('is-tint', 'is-decide');
    }

    function hideTip() {
      clearTimeout(tipTimer);
      tip.classList.remove('is-in');
    }

    function showTip(text) {
      clearTimeout(tipTimer);
      tip.textContent = text;
      tip.classList.add('is-in');
      tipTimer = setTimeout(hideTip, 5000);
    }

    function reset() {
      run++;
      hideTip();
      parts.concat([dots, reply, replyDots, answer]).forEach(function (el) {
        if (el) el.classList.remove('is-shown');
      });
      chat.classList.remove('is-tint', 'is-decide', 'is-typing', 'is-sent', 'is-ready');
      typed.textContent = '';
      box.style.height = '';
      flow.style.transform = '';
    }

    function finish() {
      if (!done) return;
      done.hidden = false;
      chat.inert = true;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          done.classList.add('is-in');
          var again = done.querySelector('[data-replay]');
          if (keyboard && again) again.focus({ preventScroll: true });
        });
      });
    }

    accept.addEventListener('click', function () {
      if (!chat.classList.contains('is-decide')) return;
      var mine = run;
      hideTip();
      chat.classList.remove('is-decide');
      show(reply);
      show(replyDots);
      wait(reduce ? 0 : 900).then(function () {
        if (mine !== run) return;
        replyDots.classList.remove('is-shown');
        show(answer);
        return wait(reduce ? 0 : 1800).then(function () {
          if (mine === run) finish();
        });
      });
    });

    chat.querySelectorAll('[data-note]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('data-note')) showTip(btn.getAttribute('data-note'));
        if (btn.classList.contains('hw-ps__chat-discard')) {
          accept.classList.add('is-nudge');
          setTimeout(function () { accept.classList.remove('is-nudge'); }, 600);
        }
      });
    });

    if (done) {
      done.querySelector('[data-replay]').addEventListener('click', function () {
        done.classList.remove('is-in');
        done.hidden = true;
        chat.inert = false;
        reset();
        if (reduce) {
          showAll();
          if (keyboard) accept.focus({ preventScroll: true });
        } else {
          refocus = keyboard;
          play();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') keyboard = true;
    });
    document.addEventListener('pointerdown', function () { keyboard = false; });

    if (reduce) {
      showAll();
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
      var mine = run;
      var step = Promise.resolve();
      function then(fn, ms) {
        step = step.then(function () {
          if (mine !== run) throw mine;
          return fn();
        }).then(function () { return wait(ms); });
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
      then(function () {
        chat.classList.add('is-tint', 'is-decide');
        if (refocus) accept.focus({ preventScroll: true });
        refocus = false;
      }, 0);
      step.catch(function () {});
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
