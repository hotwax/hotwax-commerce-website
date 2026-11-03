(function () {
  function init(CD) {
    document.querySelectorAll('[data-cc]').forEach(function (root) {
      if (root.hasAttribute('data-ready')) return;
      root.setAttribute('data-ready', '');
      var D = JSON.parse(root.querySelector('[data-cc-data]').textContent), I = D.icons;
      var app = root.querySelector('[data-app]');
      var S, ticker;
      var G = CD.create(root, {
        reducedMs: 80,
        tipFade: true,
        ripple: '.cc-btn,.cc-mic,.cc-alert__b button,.cc-opt',
        rippleClass: 'cc-ripple'
      });
      var esc = CD.esc, later = G.later, twoFrames = G.twoFrames, reduce = G.reduce;
      var DESK = { open: '[data-session]', start: '[data-startbtn]', hand: '[data-hand]', qty: '[data-hqty]', save: '[data-hsave]',
        hback: '[data-hback]', submit: '[data-submit]', confirm: '[data-alert-ok]' };
      var PHONE = { start: '[data-scanbar]', recent: '[data-recent]', hand: '[data-sheet-hand]' };
      var ANCHOR = { submit: '.cc-dhead', open: '.cc-srow', confirm: '.cc-alert', qty: '.cc-hrow' };
      var WIDE = ['open', 'qty', 'submit'];
      var ALL = '[data-session],[data-startbtn],[data-scanbar],[data-recent],[data-hand],[data-sheet-hand],[data-hqty],[data-hsave],[data-hback],[data-submit],[data-alert-ok]';

      function q(s) { return app.querySelector(s); }
      function qa(s) { return [].slice.call(app.querySelectorAll(s)); }
      function phone() { return app.clientWidth < 841; }
      function sel(name) { return (phone() && PHONE[name]) || DESK[name]; }
      function find(sku) { return S.items.filter(function (it) { return it.sku === sku; })[0]; }
      function units() { return S.items.reduce(function (n, it) { return n + it.counted; }, 0); }
      function counted() { return S.items.filter(function (it) { return it.counted > 0; }); }
      function uncounted() { return S.items.filter(function (it) { return !it.counted; }); }
      function thumb(it) { return '<span class="cc-thumb"><img src="' + esc(it.img) + '" alt="" loading="lazy" decoding="async"></span>'; }
      function ago(t) {
        var s = Math.max(1, Math.round((Date.now() - t) / 1000));
        if (s < 60) return s === 1 ? '1 second ago' : s + ' seconds ago';
        var m = Math.round(s / 60);
        return m === 1 ? '1 minute ago' : m + ' minutes ago';
      }

      function reset() {
        G.clearTimers();
        clearInterval(ticker);
        S = {
          items: D.items.map(function (it) { return Object.assign({ counted: 0 }, it); }),
          events: [], seg: 'uncounted', target: null, busy: false, started: false, ready: false, typed: false,
          saved: false, submitted: false
        };
        G.view = 'list';
        ['[data-alert]', '[data-loader]', '[data-toast]', '[data-sheet]'].forEach(function (s) { q(s).hidden = true; });
        G.hideTip(true);
        qa('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== 'list'; v.classList.remove('is-leaving', 'is-entering'); });
        qa('[data-scroll]').forEach(function (b) { b.scrollTop = 0; });
        q('[data-evlist]').innerHTML = '';
        q('[data-sheetlist]').innerHTML = '';
        q('[data-scanf]').classList.remove('is-focus');
        session();
        hand();
        ticker = setInterval(tick, 1000);
      }
      function tick() {
        if (!S || !S.events.length) return;
        qa('[data-t]').forEach(function (el) { el.textContent = ago(+el.dataset.t); });
        q('[data-cur-ago]').textContent = ago(S.events[0].t);
      }

            function session() {
        var u = units(), c = counted().length, un = uncounted().length;
        qa('[data-uc]').forEach(function (el) { el.textContent = u; });
        qa('[data-pc]').forEach(function (el) { el.textContent = c; });
        var n = { uncounted: un, undirected: 0, unmatched: 0, counted: c };
        qa('[data-seg]').forEach(function (b) {
          b.classList.toggle('is-on', b.dataset.seg === S.seg);
          b.querySelectorAll('[data-n]').forEach(function (x) { x.textContent = n[b.dataset.seg]; });
        });
        var btn = q('[data-startbtn]'), lbl = q('[data-startlabel]');
        lbl.textContent = !S.started ? 'Start counting' : S.ready ? 'Scanner ready' : 'Resume counting';
        btn.classList.toggle('cc-btn--danger', S.started && !S.ready);
        btn.classList.toggle('cc-btn--success', !S.started || S.ready);
        q('[data-scanf]').classList.toggle('is-focus', S.ready);
        q('[data-submit]').hidden = !S.started || S.submitted;
        var act = q('.cc-actions');
        act.classList.toggle('is-submitted', S.submitted);
        q('[data-evempty]').hidden = S.events.length > 0;
        var r = q('[data-recentn]');
        r.hidden = !S.events.length;
        r.textContent = S.events.length;
        q('[data-sheetn]').textContent = S.events.length;
        current();
        list();
      }
      function current() {
        var e = S.events[0], box = q('[data-cur]');
        box.hidden = !e;
        if (!e) return;
        var it = find(e.sku), img = q('[data-cur-img]');
        if (img.getAttribute('src') !== it.img) img.setAttribute('src', it.img);
        q('[data-cur-sku]').textContent = it.sku;
        q('[data-cur-name]').textContent = it.name;
        q('[data-cur-ago]').textContent = ago(e.t);
        q('[data-cur-units]').textContent = it.counted;
      }
      function list() {
        var box = q('[data-slist]'), rows;
        if (S.seg === 'uncounted' || S.seg === 'counted') {
          rows = (S.seg === 'uncounted' ? uncounted() : counted()).map(function (it) {
            return '<div class="cc-prow">' + thumb(it) + '<div class="cc-prow__l"><p class="cc-h2">' + esc(it.sku) + '</p><p class="cc-p">' + esc(it.name) + '</p></div>' +
              (S.seg === 'counted' ? '<span class="cc-note">' + it.counted + ' Units</span>' : '') + '</div>';
          }).join('');
          box.innerHTML = rows;
        } else if (S.seg === 'undirected') {
          box.innerHTML = '<div class="cc-estate"><p class="cc-h2">No undirected items</p><p class="cc-p">Undirected items are products you counted but were not instructed to count in this session. Don’t worry about them during counting. You’ll have a chance to discard them when reviewing and completing this count.</p></div>';
        } else {
          box.innerHTML = '<div class="cc-estate"><p class="cc-h2">No unmatched items</p><p class="cc-p">Unmatched items are products you counted but were not found in your product catalog. Please match them before submitting for review and completing this count.</p></div>';
        }
        q('.cc-srch').hidden = S.seg === 'undirected';
      }
      function evRow(e, trash) {
        var it = find(e.sku);
        return '<div class="cc-ev"><span class="cc-evimg">' + thumb(it) + '<i class="cc-qb">' + e.qty + '</i></span><div class="cc-ev__l"><p>' + esc(e.sku) + '</p><p class="cc-ago" data-t="' + e.t + '">' + ago(e.t) + '</p></div>' +
          '<button type="button" class="cc-ib cc-ib--sm" data-info="' + (trash ? 'remove' : 'evmore') + '" aria-label="' + (trash ? 'Remove scan' : 'Scan actions') + '">' + (trash ? I['trash-outline'] : I['ellipsis-vertical-outline']) + '</button></div>';
      }
      function addEvent(sku, qty, isHand) {
        var e = { sku: sku, qty: qty, t: Date.now(), hand: !!isHand };
        S.events.unshift(e);
        var l = q('[data-evlist]');
        l.insertAdjacentHTML('afterbegin', evRow(e, false));
        var row = l.firstElementChild;
        row.classList.add('is-new');
        row.addEventListener('animationend', function () { row.classList.remove('is-new'); }, { once: true });
        l.scrollTop = 0;
        q('[data-sheetlist]').insertAdjacentHTML('afterbegin', evRow(e, true));
      }

            function hand() {
        var un = uncounted();
        qa('[data-ha]').forEach(function (el) { el.textContent = S.items.length; });
        qa('[data-hu]').forEach(function (el) { el.textContent = un.length; });
        qa('[data-hc]').forEach(function (el) { el.textContent = S.items.length - un.length; });
        var box = q('[data-hlist]');
        if (!un.length) {
          box.innerHTML = '<p class="cc-hempty">No assigned items in this view.</p>';
        } else {
          box.innerHTML = un.map(function (it) {
            var v = S.typed ? '4' : '';
            return '<div class="cc-hrow cc-hcols"><div class="cc-hprod">' + thumb(it) + '<div><p class="cc-h2">' + esc(it.sku) + '</p><p class="cc-p">' + esc(it.name) + '</p>' +
              (S.typed ? '<p class="cc-unsaved">Unsaved changes</p>' : '') + '</div></div>' +
              '<div class="cc-hzero"><button type="button" class="cc-cb" data-info="zero" aria-label="Not in stock: ' + esc(it.sku) + '"><i class="cc-box">' + I['checkmark-sharp'] + '</i></button><span>Not in stock</span></div>' +
              '<div class="cc-hqtyw"><button type="button" class="cc-qbtn" data-info="step" aria-label="Decrease quantity"' + (S.typed ? '' : ' aria-disabled="true"') + '>' + I['remove-outline'] + '</button>' +
              '<button type="button" class="cc-qin' + (S.typed ? ' has-v' : '') + '" data-hqty><i>Qty</i><b data-hv>' + v + '</b></button>' +
              '<button type="button" class="cc-qbtn" data-info="step" aria-label="Increase quantity">' + I['add-outline'] + '</button></div></div>';
          }).join('');
        }
        var drafts = S.typed && !S.saved ? 1 : 0;
        q('[data-hstatus]').textContent = drafts ? 'Unsaved changes: 1' : 'No unsaved changes';
        var b = q('[data-hsave]');
        b.textContent = drafts ? 'Save changes: 1' : 'Save progress';
        b.setAttribute('aria-disabled', drafts ? 'false' : 'true');
      }

            function visible(el) { return el && !el.closest('[hidden]') && el.offsetParent !== null; }
      function target(name) {
        if (name === 'recent' && !phone()) name = 'hand';
        qa('.is-target').forEach(function (el) { el.classList.remove('is-target'); });
        if (name && name !== S.target) G.hideTip(true);
        S.target = name;
        var el = name && q(sel(name)), ok = el && visible(el);
        if (ok) { el.classList.add('is-target'); if (G.keyboard && G.started && G.focusInApp()) el.focus({ preventScroll: true }); }
        callout(name, ok ? el : null);
      }
      function reveal(el, center) { G.reveal(el, el.closest('[data-scroll]'), center); }
      function callout(name, el) {
        var info = name && D.callouts[name];
        if (!info || !el || !G.started) { G.hideCallout(); return; }
        G.showCallout(info, function () { reveal(el); place(); });
      }
      function place() {
        var el = S && S.target && q(sel(S.target));
        if (!el || !visible(el)) return;
        if (S.target === 'start' && !phone()) {
          var c = G.calloutBox(), ar = app.getBoundingClientRect(), r = el.getBoundingClientRect();
          if (c.hidden) return;
          c.classList.remove('is-docked', 'is-top');
          c.style.width = Math.max(220, r.width) + 'px';
          c.style.left = (r.left - ar.left) + 'px';
          c.style.top = (r.bottom - ar.top + 16) + 'px';
          return;
        }
        var a = ANCHOR[S.target];
        G.position(el, (a && el.closest(a)) || el, 20, WIDE.indexOf(S.target) > -1);
      }
      function nudge() { var el = S.target && q(sel(S.target)); G.nudge(visible(el) ? el : null); }
      function tip(el, text) { G.tip(el, text); nudge(); }
      function toast(msg, ms) {
        var t = q('[data-toast]');
        q('[data-toast-msg]').textContent = msg;
        clearTimeout(S.toastT);
        if (t.hidden) { t.hidden = false; t.classList.remove('is-in'); twoFrames(function () { t.classList.add('is-in'); }); }
        S.toastT = setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.hidden = true; }, 300); }, G.T(ms || 2200));
      }
      function loader(msg, ms, fn) {
        q('[data-loader-msg]').textContent = msg;
        q('[data-loader]').hidden = false;
        later(ms, function () { q('[data-loader]').hidden = true; fn(); });
      }
      function layer(s, on) { G.layer(q(s), on, 320); }

      function scanAll() {
        var queue = [], last = null;
        S.items.forEach(function (it) { for (var k = 0; k < (it.scan || 0); k++) queue.push(it.sku); });
        (function next() {
          if (!queue.length) {
            S.busy = false;
            later(500, function () { target(phone() ? 'recent' : 'hand'); });
            return;
          }
          var sku = queue.shift(), it = find(sku);
          it.counted++;
          addEvent(sku, 1);
          session();
          if (sku !== last) { last = sku; later(420, next); } else later(150, next);
        })();
      }
      root.addEventListener('click', function (e) {
        var el = e.target.closest('button');
        if (!el || !app.contains(el) || !S) return;
        G.press(el, e);
        if (!G.started || S.busy) return;
        if (el.hasAttribute('data-seg')) {
          S.seg = el.dataset.seg;
          session();
          return tip(el, D.info.seg);
        }
        if (el.dataset.info) return tip(el, D.info[el.dataset.info] || '');
        var t = S.target;
        if (el.matches(DESK.open) && t === 'open') {
          target(null);
          G.show('session');
          session();
          G.setStep(1);
          later(300, function () { toast('Session ready to start counting', 2200); });
          later(700, function () { target('start'); });
          return;
        }
        if ((el.matches(DESK.start) || el.matches(PHONE.start)) && t === 'start') {
          target(null);
          S.busy = true;
          S.started = true;
          S.ready = !phone();
          session();
          later(350, scanAll);
          return;
        }
        if (el.matches(PHONE.recent) && t === 'recent') {
          target(null);
          layer('[data-sheet]', true);
          q('.cc-sheet__c').scrollTop = 0;
          later(380, function () { target('hand'); });
          return;
        }
        if ((el.matches(DESK.hand) || el.matches(PHONE.hand)) && t === 'hand') {
          target(null);
          S.ready = false;
          if (!q('[data-sheet]').hidden) layer('[data-sheet]', false);
          G.show('hand');
          q('.cc-hbody').scrollTop = 0;
          hand();
          later(550, function () { target('qty'); });
          return;
        }
        if (el.matches(DESK.qty) && t === 'qty') {
          target(null);
          S.busy = true;
          el.classList.add('is-typing');
          later(380, function () {
            S.typed = true;
            S.busy = false;
            hand();
            var inp = q('[data-hqty]');
            if (inp) inp.classList.add('is-typing');
            later(350, function () { target('save'); });
          });
          return;
        }
        if (el.matches(DESK.save) && t === 'save') {
          target(null);
          S.busy = true;
          el.setAttribute('aria-disabled', 'true');
          later(450, function () {
            var it = S.items.filter(function (x) { return x.hand; })[0];
            it.counted = it.hand;
            S.saved = true;
            addEvent(it.sku, it.hand, true);
            S.busy = false;
            hand();
            session();
            toast('Items Saved', 2000);
            later(700, function () { target('hback'); });
          });
          return;
        }
        if (el.matches(DESK.hback)) {
          if (t !== 'hback') return tip(el, D.info.later);
          target(null);
          G.show('session');
          q('[data-dash]').scrollTop = 0;
          S.seg = 'counted';
          session();
          G.setStep(2);
          later(600, function () { target('submit'); });
          return;
        }
        if (el.matches(DESK.submit) && t === 'submit') {
          target(null);
          layer('[data-alert]', true);
          later(360, function () { target('confirm'); });
          return;
        }
        if (el.hasAttribute('data-alert-cancel')) {
          if (t !== 'confirm') return;
          target(null);
          layer('[data-alert]', false);
          later(250, function () { target('submit'); });
          return;
        }
        if (el.matches(DESK.confirm) && t === 'confirm') {
          target(null);
          S.busy = true;
          layer('[data-alert]', false);
          later(150, function () {
            loader('Syncing count...', 1100, function () {
              S.submitted = true;
              S.ready = false;
              session();
              toast('Session submitted successfully', 2000);
              G.setStep(3);
              later(1700, function () { S.busy = false; G.finish(); });
            });
          });
          return;
        }
        if (el.matches(ALL)) return tip(el, D.info.later);
        nudge();
      });
      app.addEventListener('click', function (e) {
        if (!G.started || !S || S.busy || e.target.closest('button')) return;
        if (e.target.closest('.cc-sheet__bg') && S.target === 'hand' && phone()) {
          target(null);
          layer('[data-sheet]', false);
          later(330, function () { target('recent'); });
          return;
        }
        if (e.target.closest('[data-scroll], .cc-scrim')) nudge();
      });
      G.onStart(function () { G.setStep(0); later(650, function () { target('open'); }); });
      G.onReplay(function () { reset(); G.setStep(0); later(500, function () { target('open'); }); });
      var lastW = window.innerWidth;
      window.addEventListener('resize', function () {
        G.placeTip();
        if (window.innerWidth === lastW) { place(); return; }
        lastW = window.innerWidth;
        if (S && S.target) target(S.target);
      });
      app.addEventListener('scroll', function () { place(); G.placeTip(); }, true);
      reset();
    });
  }
  (window.hwClickDemos = window.hwClickDemos || []).push(init);
})();
