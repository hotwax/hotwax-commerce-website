(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  function named(text, first) {
    return (text || '').split('{name}').join(first || '').replace(/\s+([,.!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  }

  function pop(el) {
    if (reduce.matches) return;
    el.classList.remove('is-new');
    void el.offsetWidth;
    el.classList.add('is-new');
  }

  function cookie(key) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function setUp(root) {
    if (root.hasAttribute('data-hw-drh-ready')) return;
    root.setAttribute('data-hw-drh-ready', '');

    var formId = root.getAttribute('data-form');
    var holder = root.querySelector('.hw-drh__form');
    var line = root.querySelector('.hw-drh__line');
    var say = root.querySelector('.hw-drh__sr');
    var bars = root.querySelectorAll('.hw-drh__meter i');
    var person = { first: '', email: '' };
    var hooked = null;
    var lastCount = 0;

    function field(form, key) { return form.querySelector('[name="' + key + '"]'); }

    function react() {
      if (!hooked) return;
      var fn = field(hooked, 'firstname');
      var ln = field(hooked, 'lastname');
      var em = field(hooked, 'email');
      var first = fn ? fn.value.trim() : '';
      var emailOk = em && em.value && (!em.checkValidity || em.checkValidity()) && /\S+@\S+\.\S+/.test(em.value);
      var count = (first ? 1 : 0) + (ln && ln.value.trim() ? 1 : 0) + (emailOk ? 1 : 0);
      var text;
      if (count === 0) text = root.getAttribute('data-line-start');
      else if (count >= 3) text = named(root.getAttribute('data-line-done'), first);
      else if (count === 2) text = root.getAttribute('data-line-two');
      else text = first ? named(root.getAttribute('data-line-one'), first) : root.getAttribute('data-line-one-plain');
      each(bars, function (bar, i) { bar.classList.toggle('is-on', i < count); });
      if (line.textContent !== text) line.textContent = text;
      if (count !== lastCount) { pop(line); if (say) say.textContent = text; lastCount = count; }
      person.first = first;
      if (em) person.email = em.value.trim();
    }

    function blanks() {
      if (!hooked) return;
      each(hooked.querySelectorAll('.hs-form-field'), function (box) {
        var input = box.querySelector('.hs-input:not([type="hidden"])');
        if (!input) return;
        if (input.value.trim()) box.removeAttribute('data-blank');
        else box.setAttribute('data-blank', '');
      });
    }

    function tried(event) {
      if (event.type === 'click' && !event.target.closest('input[type="submit"], button[type="submit"]')) return;
      root.classList.add('is-tried');
    }

    function hook(form) {
      if (!form || form === hooked) return;
      hooked = form;
      var label = root.getAttribute('data-button');
      if (label) each(form.querySelectorAll('input[type="submit"], button[type="submit"]'), function (b) {
        if (b.tagName === 'INPUT') b.value = label; else b.textContent = label;
      });
      form.addEventListener('input', blanks);
      form.addEventListener('focusin', blanks);
      form.addEventListener('focusout', blanks);
      form.addEventListener('change', react);
      form.addEventListener('focusout', react);
      form.addEventListener('click', tried, true);
      form.addEventListener('submit', tried, true);
      form.addEventListener('submit', react, true);
      blanks();
      react();
    }

    function sent() {
      if (root.classList.contains('is-sent')) return;
      root.classList.add('is-sent');
      var step1 = root.querySelector('.hw-drh__step1');
      var step2 = root.querySelector('.hw-drh__step2');
      var title = root.querySelector('.hw-drh__done-title');
      title.textContent = named(title.getAttribute('data-text'), person.first || 'there');
      step1.hidden = true;
      step2.hidden = false;
      var extra = root.querySelector('.hw-drh__extra');
      if (extra && !person.email) {
        extra.hidden = true;
        root.querySelector('.hw-drh__thanks').hidden = false;
      }
      title.focus({ preventScroll: true });
      if (title.getBoundingClientRect().top < 0) root.querySelector('.hw-drh__card').scrollIntoView({ block: 'start' });
    }

    window.addEventListener('message', function (event) {
      if (event.source !== window && event.origin !== location.origin) return;
      var d = event.data;
      if (!d || d.type !== 'hsFormCallback' || d.id !== formId) return;
      if (d.eventName === 'onFormReady') { hook(holder.querySelector('form')); blanks(); react(); }
      if (d.eventName === 'onFormSubmitted') sent();
    });

    hook(holder.querySelector('form'));
    if (!hooked && 'MutationObserver' in window) {
      var watch = new MutationObserver(function () {
        var form = holder.querySelector('form');
        if (form) { hook(form); watch.disconnect(); }
      });
      watch.observe(holder, { childList: true, subtree: true });
    }

    var extra = root.querySelector('.hw-drh__extra');
    if (extra) answers(root, extra, person);
  }

  function answers(root, extra, person) {
    var progress = root.querySelector('.hw-drh__progress');
    var plan = root.querySelector('.hw-drh__plan');
    var list = root.querySelector('.hw-drh__plan-list');
    var lines = [];
    try { lines = JSON.parse(extra.getAttribute('data-progress')) || []; } catch (e) {}
    var groups = extra.querySelectorAll('.hw-drh__q');
    var shown = {};

    function picks(group) {
      return Array.prototype.filter.call(group.querySelectorAll('.hw-drh__chip'), function (c) {
        return c.getAttribute('aria-pressed') === 'true';
      });
    }

    function render() {
      var done = 0;
      var first = extra.getAttribute('data-plan-first');
      var middle = [];
      each(groups, function (group) {
        var chosen = picks(group);
        if (chosen.length) done += 1;
        if (+group.getAttribute('data-max') === 1 && chosen.length && first === extra.getAttribute('data-plan-first')) {
          first = chosen[0].getAttribute('data-line') || first;
        } else {
          chosen.forEach(function (c) { if (c.getAttribute('data-line')) middle.push(c.getAttribute('data-line')); });
        }
      });
      var items = [first].concat(middle, [extra.getAttribute('data-plan-last')]).filter(Boolean);
      var now = {};
      list.textContent = '';
      items.forEach(function (text) {
        var li = document.createElement('li');
        li.textContent = text;
        if (!shown[text] && Object.keys(shown).length) pop(li);
        now[text] = 1;
        list.appendChild(li);
      });
      shown = now;
      plan.hidden = !done;
      var index = done === 0 ? 0 : (done >= groups.length ? 3 : Math.min(done, 2));
      var text = lines[index] || '';
      if (progress.textContent !== text) progress.textContent = text;
    }

    each(groups, function (group) {
      var max = +group.getAttribute('data-max') || 1;
      var cap = group.querySelector('.hw-drh__cap');
      group.addEventListener('click', function (event) {
        var chip = event.target.closest('.hw-drh__chip');
        if (!chip) return;
        var on = chip.getAttribute('aria-pressed') === 'true';
        if (max === 1) {
          each(group.querySelectorAll('.hw-drh__chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
          chip.setAttribute('aria-pressed', on ? 'false' : 'true');
        } else {
          if (!on && picks(group).length >= max) {
            if (cap) cap.textContent = extra.getAttribute('data-cap');
            return;
          }
          if (cap) cap.textContent = '';
          chip.setAttribute('aria-pressed', on ? 'false' : 'true');
        }
        render();
      });
    });

    function finish(key) {
      var thanks = root.querySelector('.hw-drh__thanks');
      thanks.querySelector('p').textContent = thanks.getAttribute(key);
      extra.hidden = true;
      thanks.hidden = false;
      thanks.querySelector('p').focus({ preventScroll: true });
    }

    root.querySelector('.hw-drh__skip').addEventListener('click', function () { finish('data-skip'); });

    root.querySelector('.hw-drh__send').addEventListener('click', function () {
      var fields = [];
      each(groups, function (group) {
        var prop = group.getAttribute('data-property');
        var values = picks(group).map(function (c) { return c.getAttribute('data-value'); });
        if (prop && values.length) fields.push({ objectTypeId: '0-1', name: prop, value: values.join(';') });
      });
      if (!fields.length || !person.email) { finish('data-skip'); return; }
      fields.unshift({ objectTypeId: '0-1', name: 'email', value: person.email });
      var context = { pageUri: location.href, pageName: document.title };
      var hutk = cookie('hubspotutk');
      if (hutk) context.hutk = hutk;
      var button = this;
      button.disabled = true;
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + root.getAttribute('data-portal') + '/' + root.getAttribute('data-answers-form'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields, context: context }),
        keepalive: true
      }).then(function (res) {
        if (!res.ok && window.console) console.warn('Demo Request Hero: answers not saved (' + res.status + ')');
        finish(res.ok ? 'data-sent' : 'data-skip');
      }, function () {
        if (window.console) console.warn('Demo Request Hero: answers not saved (network)');
        finish('data-skip');
      });
    });

    render();
  }

  function init() { each(document.querySelectorAll('[data-hw-drh]'), setUp); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
