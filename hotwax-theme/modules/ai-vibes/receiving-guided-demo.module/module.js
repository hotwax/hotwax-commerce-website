(function () {
  function init(CD) {
    document.querySelectorAll('[data-rd]').forEach(function (root) {
      if (root.hasAttribute('data-ready')) return;
      root.setAttribute('data-ready', '');
      var D = JSON.parse(root.querySelector('[data-rd-data]').textContent), I = D.icons;
      var app = root.querySelector('[data-app]');
      var S;
      var G = CD.create(root, {
        reducedMs: 80,
        tipFade: true,
        ripple: '.rd-fbtn,.rd-mbtn,.rd-scan,.rd-rall,.rd-fab,.rd-toast button',
        rippleClass: 'rd-ripple'
      });
      var esc = CD.esc, later = G.later, twoFrames = G.twoFrames, reduce = G.reduce;
      var SEL = { open: '[data-to]', scan: '[data-scan]', add: '[data-toast-add]', complete: '[data-complete]',
        check: '[data-review] .rd-cb:not(.is-on)', confirm: '[data-confirm]' };
      var ANCHOR = { open: '.rd-row', check: '.rd-modal', confirm: '.rd-modal', add: '.rd-toast' };

      function q(s) { return app.querySelector(s); }
      function qa(s) { return [].slice.call(app.querySelectorAll(s)); }

      var listHTML = q('.rd-list').innerHTML;
      function reset() {
        G.clearTimers();
        q('.rd-list').innerHTML = listHTML;
        S = { items: D.items.map(function (it) { return Object.assign({ qty: null }, it); }), target: null, scanning: false };
        G.view = 'list';
        q('[data-modal]').hidden = true;
        q('[data-loader]').hidden = true;
        q('[data-toast]').hidden = true;
        G.hideTip(true);
        qa('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== 'list'; v.classList.remove('is-leaving', 'is-entering'); });
        q('.rd-list').parentNode.scrollTop = 0;
        items();
      }
      function total() { return S.items.reduce(function (n, it) { return n + (it.qty || 0); }, 0); }
      function card(it) {
        var qty = '<button type="button" class="rd-qty' + (it.qty === null ? ' is-empty' : '') + '" data-info="qty">' + (it.qty === null ? 'Qty' : '<i>Qty</i><b data-n>' + it.qty + '</b>') + '</button>';
        var p = it.ful ? Math.min((it.qty || 0) / it.ful, 1) : (it.qty ? 1 : 0);
        var tone = it.qty !== null && it.qty > it.ful ? ' is-over' : it.qty !== null && it.qty === it.ful ? ' is-ok' : '';
        return '<div class="rd-card" data-sku="' + esc(it.sku) + '"><div class="rd-prod"><div class="rd-info"><span class="rd-thumb"><img src="' + esc(it.img) + '" alt="" loading="lazy" decoding="async"></span><div><p class="rd-sku">' + esc(it.sku) + '</p><p>' + esc(it.name) + '</p><p>' + esc(it.feat) + '</p></div></div>' +
          '<span class="rd-chip">' + it.oh + ' on hand ' + I.cube + '</span>' + qty + '</div>' +
          '<div class="rd-act"><button type="button" class="rd-rall" data-info="rall">Receive all</button><span class="rd-pbar' + tone + '"><b style="--p:' + p + '"></b></span><span class="rd-chip" data-rcv>' + I.done + ' ' + (it.qty || 0) + ' received</span><span class="rd-ful">' + it.ful + ' fulfilled</span></div></div>';
      }
      function items() {
        q('[data-items]').innerHTML = S.items.map(card).join('');
        q('[data-units]').textContent = 'Save progress: ' + total() + ' / 24 units';
        q('[data-count]').textContent = S.items.length;
        q('[data-open]').textContent = S.items.length;
        q('[data-seg-open]').textContent = S.items.length + ' Open';
        target(S.target);
      }
      function update(it) {
        var c = q('.rd-card[data-sku="' + it.sku + '"]');
        if (!c) return;
        var box = c.querySelector('.rd-qty');
        box.classList.remove('is-empty');
        box.innerHTML = '<i>Qty</i><b data-n>' + it.qty + '</b>';
        var bar = c.querySelector('.rd-pbar'), p = it.ful ? Math.min(it.qty / it.ful, 1) : 1;
        bar.classList.toggle('is-ok', it.qty === it.ful);
        bar.classList.toggle('is-over', it.qty > it.ful);
        bar.querySelector('b').style.setProperty('--p', p);
        c.querySelector('[data-rcv]').innerHTML = I.done + ' ' + it.qty + ' received';
        q('[data-units]').textContent = 'Save progress: ' + total() + ' / 24 units';
      }
      function find(sku) { return S.items.filter(function (it) { return it.sku === sku; })[0]; }
      function visible(el) { return el && !el.closest('[hidden]') && el.offsetParent !== null; }
      function target(name) {
        qa('.is-target').forEach(function (el) { el.classList.remove('is-target'); });
        if (name && name !== S.target) G.hideTip(true);
        S.target = name;
        var el = name && q(SEL[name]), ok = el && visible(el);
        if (ok) { el.classList.add('is-target'); if (G.keyboard && G.started && G.focusInApp()) el.focus({ preventScroll: true }); }
        callout(name, ok ? el : null);
      }
      function reveal(el, center) {
        var box = el.closest('.rd-content, .rd-mc');
        if (!box) return;
        var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (center || er.bottom > br.bottom - 70 || er.top < br.top + 4) {
          var to = box.scrollTop + er.top - br.top - (center ? (br.height - er.height) / 2 : 80);
          if (box.scrollTo && !reduce) box.scrollTo({ top: to, behavior: 'smooth' }); else box.scrollTop = to;
        }
      }
      function callout(name, el) {
        var info = name && D.callouts[name];
        if (!info || !el || !G.started) { G.hideCallout(); return; }
        G.showCallout(info, function () { reveal(el); place(); });
      }
      function place() {
        var el = S && S.target && q(SEL[S.target]);
        if (!el || !visible(el)) return;
        if (S.target === 'add') {
          var c = G.calloutBox(), a = app.getBoundingClientRect(), t = q('[data-toast]').getBoundingClientRect();
          if (a.width < 640) { G.position(el, el, 20, false); return; }
          var w = Math.min(300, a.width - 24);
          c.classList.remove('is-docked', 'is-top');
          c.style.width = w + 'px';
          c.style.left = Math.max(12, Math.min(t.right - a.left - w, a.width - w - 12)) + 'px';
          c.style.top = Math.max(12, t.top - a.top - c.offsetHeight - 12) + 'px';
          return;
        }
        G.position(el, (ANCHOR[S.target] && el.closest(ANCHOR[S.target])) || el, 20, ['open', 'check', 'confirm'].indexOf(S.target) > -1);
      }
      function nudge() { var el = S.target && q(SEL[S.target]); G.nudge(visible(el) ? el : null); }
      function tip(el, text) { G.tip(el, text); nudge(); }
      function toast(msg, add, ms) {
        var t = q('[data-toast]');
        q('[data-toast-msg]').textContent = msg;
        q('[data-toast-add]').hidden = !add;
        clearTimeout(S.toastT);
        if (t.hidden) { t.hidden = false; t.classList.remove('is-in'); twoFrames(function () { t.classList.add('is-in'); }); }
        if (ms) S.toastT = setTimeout(hideToast, G.T(ms));
      }
      function hideToast() {
        var t = q('[data-toast]');
        t.classList.remove('is-in');
        setTimeout(function () { t.hidden = true; }, 300);
      }
      function scanAll() {
        var queue = [];
        D.scans.forEach(function (s) { for (var k = 0; k < s[1]; k++) queue.push(s[0]); });
        var last = null;
        (function next() {
          if (!queue.length) {
            later(500, function () {
              qa('.rd-card.is-scanned').forEach(function (x) { x.classList.remove('is-scanned'); });
              toast('Scanned item is not present within the shipment: ' + D.extra.sku, true);
              S.scanning = false;
              G.setStep(2);
              later(250, function () { target('add'); });
            });
            return;
          }
          var sku = queue.shift(), it = find(sku), c = q('.rd-card[data-sku="' + sku + '"]');
          it.qty = (it.qty || 0) + 1;
          update(it);
          if (sku !== last) {
            qa('.rd-card.is-scanned').forEach(function (x) { x.classList.remove('is-scanned'); });
            if (c) { c.classList.add('is-scanned'); reveal(c, true); }
            toast('Scanned ' + sku + ' successfully.', false);
            last = sku;
            later(420, next);
          } else later(150, next);
        })();
      }
      function review() {
        var off = S.items.filter(function (it) { return it.qty !== it.ful; });
        q('[data-review]').innerHTML = '<p class="rd-lh">' + off.length + ' out of ' + S.items.length + ' items were not received as expected. Please verify them before closing the transfer order</p>' +
          off.map(function (it) {
            var d = it.qty - it.ful, note = !it.ful ? 'Not expected: ' + it.qty : d < 0 ? 'Under received: ' + d : 'Over received: ' + d;
            return '<div class="rd-ri"><span class="rd-thumb"><img src="' + esc(it.img) + '" alt=""></span><div class="rd-lbl"><p class="rd-sku">' + esc(it.sku) + '</p><p>' + esc(it.name) + '</p><p>' + esc(it.feat) + '</p><p class="rd-note">' + note + '</p></div>' +
              '<button type="button" class="rd-cb" role="checkbox" aria-checked="false"><span>report discrepancy</span><i class="rd-box">' + I.check + '</i></button></div>';
          }).join('');
        q('[data-confirm]').setAttribute('aria-disabled', 'true');
        q('[data-review]').scrollTop = 0;
      }
      function layer(sel, on) { G.layer(q(sel), on, 320); }

      root.addEventListener('click', function (e) {
        var el = e.target.closest('button');
        if (!el || !app.contains(el) || !S) return;
        G.press(el, e);
        if (!G.started) return;
        if (S.scanning) return;
        if (el.dataset.info) return tip(el, D.info[el.dataset.info] || '');
        if (el.hasAttribute('data-to') && S.target === 'open') {
          G.hideTip(true);
          target(null);
          G.show('detail');
          q('[data-detail-scroll]').scrollTop = 0;
          items();
          G.setStep(1);
          later(500, function () { target('scan'); });
          return;
        }
        if (el.hasAttribute('data-back')) { tip(el, D.info.back); return; }
        if (el.hasAttribute('data-scan') && S.target === 'scan') {
          target(null);
          S.scanning = true;
          later(200, scanAll);
          return;
        }
        if (el.hasAttribute('data-toast-add') && S.target === 'add') {
          target(null);
          hideToast();
          var it = Object.assign({ qty: 1 }, D.extra);
          S.items.push(it);
          items();
          var c = q('.rd-card[data-sku="' + it.sku + '"]');
          if (c) { c.classList.add('is-new', 'is-scanned'); reveal(c, true); }
          G.setStep(3);
          later(1100, function () { qa('.rd-card.is-scanned').forEach(function (x) { x.classList.remove('is-scanned'); }); target('complete'); });
          return;
        }
        if (el.hasAttribute('data-complete') && S.target === 'complete') {
          target(null);
          review();
          layer('[data-modal]', true);
          later(380, function () { target('check'); });
          return;
        }
        if (el.classList.contains('rd-cb') && S.target === 'check') {
          el.classList.add('is-on');
          el.setAttribute('aria-checked', 'true');
          if (q(SEL.check)) { later(120, function () { target('check'); }); return; }
          q('[data-confirm]').setAttribute('aria-disabled', 'false');
          later(150, function () { target('confirm'); });
          return;
        }
        if (el.hasAttribute('data-modal-close')) { G.clearTimers(); layer('[data-modal]', false); later(200, function () { target('complete'); }); return; }
        if (el.hasAttribute('data-confirm') && S.target === 'confirm') {
          target(null);
          layer('[data-modal]', false);
          later(150, function () { q('[data-loader]').hidden = false; });
          later(1150, function () {
            q('[data-loader]').hidden = true;
            G.show('list');
            G.setStep(4);
            var row = q('[data-to]');
            later(550, function () {
              if (!row) return;
              row.style.maxHeight = row.offsetHeight + 'px';
              twoFrames(function () { row.classList.add('is-gone'); });
              later(700, function () { row.remove(); });
            });
            later(800, function () { toast('Transfer order received successfully', false, 2600); });
            later(3000, G.finish);
          });
          return;
        }
        if (SEL[S.target] && !el.matches(SEL[S.target]) && (el.matches('[data-to],[data-scan],[data-complete],[data-confirm],.rd-cb,[data-toast-add]'))) return tip(el, D.info.later);
        nudge();
      });
      app.addEventListener('click', function (e) { if (G.started && !S.scanning && !e.target.closest('button') && e.target.closest('.rd-content')) nudge(); });
      G.onStart(function () { G.setStep(0); later(650, function () { target('open'); }); });
      G.onReplay(function () { reset(); G.setStep(0); later(500, function () { target('open'); }); });
      window.addEventListener('resize', function () { place(); G.placeTip(); });
      app.addEventListener('scroll', function () { place(); G.placeTip(); }, true);
      reset();
    });
  }
  (window.hwClickDemos = window.hwClickDemos || []).push(init);
})();
