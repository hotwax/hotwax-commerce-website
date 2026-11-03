(function () {
  function init(CD) {
    document.querySelectorAll('[data-bd]').forEach(function (root) {
      if (root.hasAttribute('data-ready')) return;
      root.setAttribute('data-ready', '');
      var D = JSON.parse(root.querySelector('[data-bd-data]').textContent), I = D.icons;
      var app = root.querySelector('[data-app]'), grid = root.querySelector('[data-grid]');
      var S;
      var G = CD.create(root, {
        reducedMs: 80,
        tipFade: true,
        ripple: '.bd-btn,.bd-tb,.bd-fab,.bd-alert__btns button,.bd-seg button',
        rippleClass: 'bd-ripple'
      });
      var esc = CD.esc, later = G.later, twoFrames = G.twoFrames, reduce = G.reduce;

      function q(s) { return app.querySelector(s); }
      function qa(s) { return [].slice.call(app.querySelectorAll(s)); }
      function first(n) { return n.split(' ')[0]; }
      var SEG_NAME = { open: 'Open', packed: 'Packed', completed: 'Completed' };
      var SEG_I = { open: 0, packed: 1, completed: 2 };
      var SEL = { open: '[data-hero] [data-act="open"]', ready: '[data-act="ready"]', confirm: '[data-alert-ok]', back: '[data-view="detail"] [data-back]', handover: '[data-hero] [data-act="handover"]',
        pod: '[data-hero] [data-act="pod"]', id: '[data-pod-id]', save: '[data-pod-save]', reopen: '[data-hero] [data-act="open"]' };
      var NEED_SEG = { open: 'open', reopen: 'open', handover: 'packed', pod: 'completed' };
      var ANCHOR = { open: '.bd-card', reopen: '.bd-card', handover: '.bd-card', pod: '.bd-card', confirm: '.bd-alert' };
      D.callouts.reopen = [first(D.hero.name) + '\'s order', 'The next step is on this order. Open it again.'];

      function reset() {
        G.clearTimers();
        S = { seg: 'open', shown: null, open: D.open.slice(), packed: D.packed.slice(), done: D.done.slice(), hero: null, where: 'open', target: null, id: '' };
        G.view = 'list';
        q('[data-bell]').hidden = true;
        q('[data-alert]').hidden = true;
        q('[data-modal]').hidden = true;
        q('[data-loader]').hidden = true;
        q('[data-toast]').hidden = true;
        G.hideTip(true);
        qa('.bd-ghost').forEach(function (g) { g.remove(); });
        qa('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== 'list'; v.classList.remove('is-leaving', 'is-entering'); });
        render();
      }
      function items(o, where) {
        return o.items.map(function (it) {
          var icon = where === 'packed' ? '<button type="button" class="bd-ib" data-info="mail" aria-label="Resend email">' + I['mail-outline'] + '</button>'
            : where === 'detail' ? '<span class="bd-ibs"><button type="button" class="bd-ib bd-ib--red" data-info="reject" aria-label="Reject item">' + I['trash-bin-outline'] + '</button><button type="button" class="bd-ib" data-info="cube" aria-label="Check stock">' + I['cube-outline'] + '</button></span>'
            : '<button type="button" class="bd-ib" data-info="cube" aria-label="Check stock">' + I['cube-outline'] + '</button>';
          return '<div class="bd-item"><img src="' + esc(it[0]) + '" alt="" width="40" height="50" loading="lazy" decoding="async"><div><p class="bd-sku">' + esc(it[1]) + '</p><p class="bd-meta">' + esc(it[2]) + '</p><p class="bd-meta">' + esc(it[3]) + '</p></div>' + icon + '</div>';
        }).join('');
      }
      function card(o, hero, seg, cls) {
        var foot = seg === 'open' ? '<button type="button" class="bd-tb" data-info="' + (hero ? 'openfirst' : 'other') + '">Ready for pickup</button><button type="button" class="bd-tb bd-tb--red" data-info="' + (hero ? 'reject' : 'other') + '">Reject</button><button type="button" class="bd-ib bd-ib--blue" data-info="print" aria-label="Print picklist">' + I['print-outline'] + '</button>'
          : seg === 'packed' ? '<button type="button" class="bd-tb" ' + (hero ? 'data-act="handover"' : 'data-info="other"') + '>Handover</button>'
          : '<button type="button" class="bd-tb" ' + (hero ? 'data-act="pod"' : 'data-info="other"') + '>Proof of Delivery</button>';
        var name = hero && seg === 'open' ? '<button type="button" class="bd-name" data-act="open">' + esc(o.name) + '</button>' : '<p class="bd-name">' + esc(o.name) + '</p>';
        return '<div class="bd-card' + (cls || '') + '" data-o="' + esc(o.id) + '"' + (hero ? ' data-hero' : '') + '><div class="bd-card__h"><div>' + name + '<p class="bd-oid">' + esc(o.id) + '</p></div><span class="bd-badge">' + esc(o.t) + '</span></div>' + items(o, seg) + '<div class="bd-foot">' + foot + '</div></div>';
      }
      function render(fresh) {
        qa('[data-seg]').forEach(function (b) { var on = b.dataset.seg === S.seg; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
        q('.bd-seg__ink').style.setProperty('--i', SEG_I[S.seg]);
        var dir = S.shown && S.shown !== S.seg ? (SEG_I[S.seg] > SEG_I[S.shown] ? 1 : -1) : 0;
        S.shown = S.seg;
        var list = S.seg === 'open' ? S.open : S.seg === 'packed' ? S.packed : S.done;
        var html = (S.hero && S.where === S.seg ? card(S.hero, true, S.seg, fresh && !dir ? ' is-new' : '') : '') + list.map(function (o) { return card(o, false, S.seg); }).join('');
        if (dir && !reduce && grid.animate) {
          var box = q('.bd-content'), ghost = grid.cloneNode(true);
          G.calloutBox().classList.remove('is-in');
          ghost.removeAttribute('data-grid');
          ghost.classList.add('bd-ghost');
          ghost.setAttribute('aria-hidden', 'true');
          ghost.style.top = (grid.offsetTop - box.scrollTop) + 'px';
          ghost.style.left = grid.offsetLeft + 'px';
          ghost.style.width = grid.offsetWidth + 'px';
          box.appendChild(ghost);
          grid.innerHTML = html || '<p class="bd-empty">No orders</p>';
          box.scrollTop = 0;
          var o = { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)' };
          ghost.animate([{ transform: 'none' }, { transform: 'translateX(' + (-dir * 100) + '%)' }], o).onfinish = function () { ghost.remove(); };
          setTimeout(function () { ghost.remove(); place(); }, 650);
          grid.animate([{ transform: 'translateX(' + (dir * 100) + '%)' }, { transform: 'none' }], o).onfinish = function () { place(); };
          target(S.target);
        } else {
          grid.innerHTML = html || '<p class="bd-empty">No orders</p>';
          q('.bd-content').scrollTop = 0;
          target(S.target);
        }
      }
      function detail() {
        var o = S.hero, ready = !!S.readied;
        q('[data-detail]').innerHTML = '<div class="bd-detail"><div>' +
          '<div class="bd-ordh">' + I['ticket-outline'] + '<div><b>' + esc(o.id) + '</b><span>' + esc(o.oid) + '</span></div></div>' +
          '<div class="bd-card">' + items(o, 'detail') + '</div>' +
          '<div class="bd-btns"><button type="button" class="bd-btn bd-btn--solid" data-act="ready"' + (ready ? ' disabled' : '') + '>' + I['checkmark-done-outline'] + 'Ready for pickup</button><button type="button" class="bd-btn bd-btn--line" data-info="reject"' + (ready ? ' disabled' : '') + '>Reject items</button></div>' +
          '<div class="bd-cards2"><div class="bd-card bd-info"><div class="bd-info__row">' + I['mail-outline'] + '<span>' + esc(o.email) + '</span></div><div class="bd-info__row">' + I['call-outline'] + '<span>' + esc(o.phone) + '</span></div><div class="bd-info__row">' + I['storefront-outline'] + '<span>Broadway<br>540 Broadway<br>New York, NY 10012</span></div></div>' +
          '<div class="bd-card bd-pay"><p class="bd-pay__h">Payment</p><p class="bd-over">Credit card</p><div class="bd-pay__row"><div><p>Card payment</p><p class="bd-ok">Settled at : ' + esc(o.paid) + '</p></div><b>' + esc(o.total) + '</b></div></div></div>' +
          '</div><div><div class="bd-tl__h">Timeline<span class="bd-chip' + (ready ? ' bd-chip--ok' : '') + '">' + (ready ? 'Ready for pickup' : 'Reserved') + '</span></div>' +
          '<div class="bd-tl">' + I['cube-outline'] + '<span>Created online</span><small>26 Oct 2026, 10:42 am</small></div>' +
          '<div class="bd-tl">' + I['storefront-outline'] + '<span>Routed to Broadway for pickup</span><small>26 Oct 2026, 10:43 am</small></div>' +
          (ready ? '<div class="bd-tl is-new">' + I['checkmark-done-outline'] + '<span>Ready for pickup, email sent to ' + esc(first(o.name)) + '</span><small>26 Oct 2026, 10:51 am</small></div>' : '') + '</div></div>';
        target(S.target);
      }
      function pod() {
        var o = S.hero;
        q('[data-pod]').innerHTML = '<p class="bd-pod__h">Billing Details</p><p class="bd-pod__bill">' + esc(o.name) + '<br>' + esc(o.addr[0]) + '<br>' + esc(o.addr[1]) + '</p>' +
          '<p class="bd-pod__lead">Please enter the details of the person picking up the order.</p>' +
          '<div class="bd-check"><i>' + I['checkmark-done-outline'] + '</i>Same person as the billing customer</div>' +
          '<div class="bd-field is-off"><small>Name <b>*</b></small><span>' + esc(o.name) + '</span></div>' +
          '<button type="button" class="bd-field" data-pod-id><small>ID Number <b>*</b></small><span data-id>' + esc(S.id) + '</span></button>' +
          '<div class="bd-field"><small>Relation to customer</small><span>Self</span></div>' +
          '<div class="bd-field is-off"><small>Phone</small><span>' + esc(o.phone) + '</span></div>' +
          '<div class="bd-field is-off"><small>Email</small><span>' + esc(o.email) + '</span></div>';
        q('[data-pod-save]').setAttribute('aria-disabled', S.id ? 'false' : 'true');
      }
      function liftToast() {
        var t = q('[data-toast]'), c = G.calloutBox();
        t.style.bottom = (!c.hidden && c.classList.contains('is-docked') && !c.classList.contains('is-top')) ? (c.offsetHeight + 24) + 'px' : '';
      }
      function toast(msg, ms) {
        var t = q('[data-toast]');
        liftToast();
        t.textContent = msg;
        t.hidden = false;
        t.classList.remove('is-in');
        twoFrames(function () { t.classList.add('is-in'); });
        clearTimeout(S.toastT);
        S.toastT = setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.hidden = true; }, 300); }, G.T(ms || 2600));
      }
      function visible(el) { return el && !el.closest('[hidden]') && !el.closest('.is-leaving') && el.offsetParent !== null; }
      function target(name) {
        qa('.is-target').forEach(function (el) { el.classList.remove('is-target'); });
        S.target = name;
        var el = name && q(SEL[name]), ok = el && visible(el);
        if (ok) { el.classList.add('is-target'); if (G.keyboard && G.started && G.focusInApp()) el.focus({ preventScroll: true }); }
        callout(name, ok ? el : null);
      }
      function reveal(el) {
        var box = el.closest('.bd-content');
        if (!box) return;
        var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (er.bottom > br.bottom - 70 || er.top < br.top + 4) box.scrollTop += er.top - br.top - 80;
      }
      function callout(name, el) {
        var info = name && D.callouts[name];
        if (!info || !el || !G.started) { G.hideCallout(); liftToast(); return; }
        G.showCallout(info, function () { reveal(el); place(); liftToast(); });
      }
      function place() {
        var el = S && S.target && q(SEL[S.target]);
        if (!el || !visible(el)) return;
        G.position(el, (ANCHOR[S.target] && el.closest(ANCHOR[S.target])) || el, 20, false);
        if (G.calloutBox().classList.contains('is-docked')) liftToast();
      }
      function nudge() {
        var el = S.target && q(SEL[S.target]);
        G.nudge(visible(el) ? el : null);
      }
      function tip(el, text) {
        G.tip(el, text);
        nudge();
      }
      function layer(sel, on) { G.layer(q(sel), on, 380); }
      function arrive() {
        var before = {};
        qa('[data-grid] .bd-card').forEach(function (c) { before[c.dataset.o] = c.getBoundingClientRect(); });
        S.hero = D.hero;
        S.where = 'open';
        q('[data-bell]').hidden = false;
        S.seg = 'open';
        G.show('list');
        render(true);
        if (!reduce) qa('[data-grid] .bd-card:not([data-hero])').forEach(function (c) {
          var b = before[c.dataset.o], a = c.getBoundingClientRect();
          if (!b || !c.animate) return;
          var dx = b.left - a.left, dy = b.top - a.top;
          if (!dx && !dy) return;
          c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.22,.61,.36,1)' });
        });
        later(520, function () { target('open'); });
      }
      function flyTo(seg, nextTarget, then) {
        var c = q('[data-hero]'), tab = q('[data-seg="' + seg + '"]');
        if (!c || reduce || !c.animate) { S.where = seg; S.seg = seg; render(); target(nextTarget); if (then) then(); return; }
        var a = c.getBoundingClientRect(), b = tab.getBoundingClientRect();
        var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
        c.style.zIndex = 5;
        c.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx * .55 + 'px,' + dy * .55 + 'px) scale(.62)', opacity: .9, offset: .55 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.18)', opacity: 0 }],
          { duration: 720, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        later(620, function () { tab.classList.add('is-flash'); setTimeout(function () { tab.classList.remove('is-flash'); }, 700); });
        later(780, function () { S.where = seg; S.seg = seg; render(); later(520, function () { target(nextTarget); if (then) then(); }); });
      }

      root.addEventListener('click', function (e) {
        var el = e.target.closest('button');
        if (!el && S && (S.target === 'open' || S.target === 'reopen')) { var hc = e.target.closest('[data-hero]'); if (hc) el = hc.querySelector('[data-act="open"]'); }
        if (!el || !app.contains(el) || !S) return;
        G.press(el, e);
        if (el.hasAttribute('data-seg')) {
          S.seg = el.dataset.seg;
          G.hideTip(true);
          render();
          var need = NEED_SEG[S.target];
          if (G.started && need && need !== S.seg) tip(el, 'You\'re looking at ' + SEG_NAME[S.seg] + '. The next step is in ' + SEG_NAME[need] + '.');
          return;
        }
        if (!G.started) return;
        if (el.dataset.info) return tip(el, (D.info[el.dataset.info] || '').replace('{hero}', first(D.hero.name)));
        var k = el.dataset.act;
        if (k === 'open') {
          if (S.target === 'open') { q('[data-bell]').hidden = true; G.hideTip(true); G.show('detail'); detail(); G.setStep(1); later(300, function () { target('ready'); }); }
          else if (S.target === 'reopen') { S.target = S.resume || 'ready'; G.hideTip(true); G.show('detail'); detail(); }
          else if (S.target === 'ready' || S.target === 'confirm' || S.target === 'back') { G.show('detail'); detail(); }
          return;
        }
        if (el.hasAttribute('data-back') && S.busy) { nudge(); return; }
        if (el.hasAttribute('data-back') && S.target === 'back') {
          target(null);
          G.show('list');
          S.seg = 'open';
          render();
          later(650, function () { flyTo('packed', 'handover', function () { G.setStep(2); }); });
          return;
        }
        if (el.hasAttribute('data-back')) {
          G.show('list');
          render();
          if (S.target === 'ready' || S.target === 'confirm' || S.target === 'back') { S.resume = S.target; target('reopen'); }
          return;
        }
        if (k === 'ready' && S.target === 'ready') {
          q('[data-alert-msg]').textContent = 'An email notification will be sent to ' + S.hero.name + ' that their order is ready for pickup. This order will also be moved to the packed orders tab.';
          layer('[data-alert]', true);
          later(180, function () { target('confirm'); });
          return;
        }
        if (el.hasAttribute('data-alert-cancel')) { layer('[data-alert]', false); later(200, function () { target('ready'); }); return; }
        if (el.hasAttribute('data-alert-ok') && S.target === 'confirm') {
          target(null);
          S.busy = true;
          layer('[data-alert]', false);
          later(150, function () { q('[data-loader]').hidden = false; });
          later(950, function () {
            q('[data-loader]').hidden = true;
            S.readied = true;
            detail();
            var row = q('.bd-tl.is-new');
            if (row) row.classList.add('is-flash');
            later(700, function () { S.busy = false; target('back'); });
          });
          return;
        }
        if (k === 'handover' && S.target === 'handover') {
          target(null);
          toast('Order delivered to ' + S.hero.name, 2400);
          later(1700, function () { flyTo('completed', 'pod', function () { G.setStep(3); }); });
          return;
        }
        if (k === 'pod' && S.target === 'pod') { S.id = ''; pod(); G.hideTip(true); layer('[data-modal]', true); target(null); later(320, function () { target('id'); }); return; }
        if (el.hasAttribute('data-modal-close')) { layer('[data-modal]', false); later(200, function () { target('pod'); }); return; }
        if (el.hasAttribute('data-pod-id') && S.target === 'id') {
          target(null);
          var f = q('[data-pod-id]'), v = 'D4417 2093', i = 0;
          f.classList.add('is-typing');
          (function type() {
            S.id = v.slice(0, ++i);
            q('[data-id]').textContent = S.id;
            if (i < v.length) later(60, type);
            else { f.classList.remove('is-typing'); q('[data-pod-save]').setAttribute('aria-disabled', 'false'); later(200, function () { target('save'); }); }
          })();
          return;
        }
        if (el.hasAttribute('data-pod-save') && S.target === 'save') {
          target(null);
          layer('[data-modal]', false);
          G.setStep(4);
          later(250, function () { toast('Details have been successfully saved, and an email has been sent to the customer.', 3200); });
          later(2200, G.finish);
          return;
        }
        if (SEL[S.target] && !el.matches(SEL[S.target]) && (el.dataset.act || el.matches('[data-pod-save],[data-pod-id]'))) return tip(el, D.info.later);
        nudge();
      });
      app.addEventListener('click', function (e) { if (G.started && !e.target.closest('button') && e.target.closest('.bd-content')) nudge(); });
      G.onStart(function () { G.setStep(0); later(650, arrive); });
      G.onReplay(function () { reset(); G.setStep(0); later(500, arrive); });
      window.addEventListener('resize', function () { place(); G.placeTip(); });
      app.addEventListener('scroll', function () { place(); G.placeTip(); }, true);
      reset();
    });
  }
  (window.hwClickDemos = window.hwClickDemos || []).push(init);
})();
