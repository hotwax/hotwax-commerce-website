(function () {
  function init(CD) {
    document.querySelectorAll('[data-pd]').forEach(function (root) {
      if (root.hasAttribute('data-ready')) return;
      root.setAttribute('data-ready', '');
      var D = JSON.parse(root.querySelector('[data-pd-data]').textContent), I = D.icons;
      var app = root.querySelector('[data-app]');
      var G = CD.create(root, { reducedMs: 80, tipFade: true, ripple: '.pd-btn,.pd-tb,.pd-alert__btns button,.pd-pop button,.pd-seg button,.fapp-btn,.fapp-big,.fapp-fab,.fapp-dialog__btns button,.fapp-pop__item', rippleClass: 'pd-ripple' });
      var FI = D.ficons, fshell = null, CFG = root.dataset.cfg, FUL = CFG === 'full', PDP = CFG === 'shopify';
      var NSTEPS = root.querySelectorAll('.sd-step').length;
      var esc = CD.esc, later = G.later, twoFrames = G.twoFrames, reduce = G.reduce;
      function q(s) { return app.querySelector(s); }
      function qa(s) { return [].slice.call(app.querySelectorAll(s)); }
      var SEL = { more: '[data-act="more"]', more2: '[data-act="more"]', arrival: '[data-act="arrival"]',
                  buy: '[data-store] [data-buy]', pselect: '[data-act="pselect"]', pall: '[data-act="pall"]', prelease: '[data-act="prelease"]', pconfirm: '[data-act="pconfirm"]', sell: '[data-act="sell"]', create: '[data-act="create"]', line: '[data-line="S"]', change: '[data-act="change"]',
                  day: '[data-day="13"]', confirm: '[data-act="confirm"]', back: '[data-act="back"]', ship: '[data-act="ship"]', receive: '[data-act="receive"]',
                  print: '[data-fapp] [data-t="print"]', staff: '[data-fapp] [data-act="staff"][data-name="Casey Morgan"]', save: '[data-fapp] [data-t="save"]',
                  pack: '[data-fapp] [data-t="pack"]', dlgpack: '[data-fapp] [data-t="dlgpack"]', fship: '[data-fapp] [data-t="ship"]' };
      var FW = { print: 1, staff: 1, save: 1, pack: 1, dlgpack: 1, fship: 1 };
      var ANCHOR = { more: '.pd-bar', more2: '.pd-bar', pconfirm: '.pd-alert', create: '.pd-alert', confirm: '.pd-sheet', day: '.pd-sheet' };
      var S;
      var sum = function (k) { return D.lines.reduce(function (a, l) { return a + l[k]; }, 0); };

      function reset() {
        G.clearTimers();
        S = { batches: false, reserved: false, date: 'Nov 11, 2026', dateRel: 'in 11 days', day: 11, received: false, target: null, view: 'po', psel: false, pall: false, released: false };
        if (q('[data-store]')) storeState('soldout', true);
        ['[data-pdpop]', '[data-alert]', '[data-alert2]', '[data-date]', '[data-loader]', '[data-toast]', '[data-prefoot]'].forEach(function (s) { q(s).hidden = true; });
        G.hideTip(); G.hideCallout();
        qa('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== 'po'; v.classList.remove('is-leaving', 'is-entering'); });
        G.view = 'po'; menu('po'); po(); if (q('[data-fapp]')) freset(); G.setStep(0);
      }
      function menu(k) { qa('[data-menu]').forEach(function (b) { b.classList.toggle('is-on', b.dataset.menu === k); }); }
      function prod(l) { return '<div class="pd-prod"><img src="' + root.dataset.img + '" alt="" width="40" height="54"><div><p>' + esc(l[1]) + '</p><small>Jade Yoga Jacket</small></div></div>'; }
      function chip(l, fresh) {
        if (!S.batches) return '<span class="pd-note">Not sold as pre-order</span>';
        var res = S.reserved ? l[3] : 0;
        return '<span class="pd-chip">' + I['layers-outline'] + '<span class="pd-num">' + (l[2] - res) + ' ATP, ' + res + ' reserved</span></span>';
      }
      function stat(t, n, s, attr) { return '<div class="pd-card pd-stat"' + (attr || '') + '><p class="pd-over">' + t + '</p><p class="pd-stat__n">' + n + '</p><p class="pd-stat__s">' + s + '</p></div>'; }
      function po(fresh) {
        var P = D.po, sold = S.reserved ? sum(3) : 0, received = S.received ? sum(2) : 0;
        q('[data-po]').innerHTML = '<section class="pd-summary"><div class="pd-card"><div class="pd-card__h"><p class="pd-card__sub">' + esc(P.ext) + '</p><p class="pd-card__t">' + esc(P.supplier) + '</p></div>' +
          '<div class="pd-it"><span class="pd-it__l">Status</span><span class="pd-badge pd-badge--primary">Approved</span></div>' +
          '<div class="pd-it"><span class="pd-it__l"><span class="pd-over">Destination</span>' + esc(P.dest) + '</span></div>' +
          '<div class="pd-it"><span class="pd-it__l">Ordered</span><span class="pd-note">' + esc(P.ordered) + '</span></div>' +
          '<div class="pd-it"><span class="pd-it__l">Total</span><span class="pd-note">' + esc(P.total) + '</span></div></div>' +
          '<div class="pd-stats">' + stat('Ordered', sum(2), D.lines.length + ' lines') + stat('Received', received, S.received ? '1 receipt' : '0 receipts') +
          stat('Still to arrive', sum(2) - received, S.received ? 'No arrival date' : 'Next arrival ' + esc(S.date)) +
          stat('Sold as pre-order', '<span class="pd-num" data-sold>' + sold + '</span>', (S.batches ? 4 : 0) + ' of 4 lines have a future inventory batch') + '</div></section>' +
          '<div class="pd-lh" data-lines>Lines</div>' + D.lines.map(function (l) {
            var link = S.batches;
            return '<' + (link ? 'button type="button"' : 'div') + ' class="pd-row pd-row--po' + (link ? ' is-link' : '') + '"' + (link ? ' data-line="' + l[0] + '"' : '') + '>' + prod(l) +
              '<span class="pd-mid"><p>' + l[2] + '</p><small>Ordered</small></span><span class="pd-mid"><p>' + (S.received ? l[2] : 0) + '</p><small>Received</small></span>' +
              '<span class="pd-mid" data-chip>' + chip(l, fresh) + '</span><span class="pd-mid"><span class="pd-badge pd-badge--primary">Approved</span></span>' +
              '<span><p>' + esc(S.date) + '</p><small>' + esc(S.received ? 'Received' : S.dateRel) + '</small></span></' + (link ? 'button' : 'div') + '>';
          }).join('') +
          '<div class="pd-lh">Inbound shipments</div><button type="button" class="pd-shiprow" data-act="ship">' + I['boat-outline'] + '<span class="pd-it__l">' + esc(D.ship.ext) +
          '<p>' + (S.received ? sum(2) : 0) + ' of ' + sum(2) + ' received</p></span><span class="pd-badge ' + (S.received ? 'pd-badge--success">Received' : 'pd-badge--primary">Shipped') + '</span><span class="pd-note">' + esc(D.ship.arrive) + '</span></button>';
        G.target && retarget();
      }
      function batch() {
        var l = D.lines[1], res = l[3], B = D.batch;
        q('[data-batch]').innerHTML = '<section class="pd-summary"><div class="pd-card"><div class="pd-it" style="padding-top:12px">' + prod(l) + '</div>' +
          '<div class="pd-it"><span class="pd-it__l">Status</span><span class="pd-badge pd-badge--success">Active</span></div>' +
          '<div class="pd-it"><span class="pd-it__l">Type</span><span class="pd-note">Purchase order</span></div>' +
          '<div class="pd-it"><span class="pd-it__l"><span class="pd-over">Facility</span>' + esc(D.po.dest) + '</span></div>' +
          '<button type="button" class="pd-it" data-info="po"><span class="pd-it__l"><span class="pd-over">Purchase order</span>' + esc(D.po.name) + '<p>Line ' + B.seq + ', ' + l[2] + ' ordered</p><p>Expected ' + esc(S.date) + '</p><p>Approved</p></span>' + I['chevron-forward'] + '</button>' +
          '<div class="pd-cardbtns"><button type="button" class="pd-tb" data-info="promise">Change promise date</button><button type="button" class="pd-tb" data-info="adjust">Adjust quantity</button><button type="button" class="pd-tb pd-tb--red" data-info="cancelbatch">Cancel batch</button></div></div>' +
          '<div class="pd-stats">' + stat('Promise date', '<span data-pdate>' + S.date + '</span>', '<span data-prel>' + S.dateRel + '</span>', ' data-pcard') + stat('On order', l[2], 'Supply still to arrive') +
          stat('Available to promise', l[2] - res, 'Can still be sold') + stat('Reserved', res, 'Sold before it arrives') + '</div></section>' +
          '<div class="pd-seg" role="tablist"><button type="button" class="is-on" data-info="waiting">Waiting orders</button><button type="button" data-info="ledger">Ledger</button></div>' +
          '<div class="pd-lh">' + D.waiting.length + ' orders waiting on this batch</div>' + D.waiting.map(function (w, i) {
            return '<div class="pd-row" style="--mid:3"><span><p>' + esc(w[0]) + '</p><small>' + esc(w[1]) + ' - ' + (10101 + i * 7) + '</small></span><span class="pd-mid"><p>Pre-order parking</p><small>Location</small></span>' +
              '<span class="pd-mid"><p>' + esc(w[2]) + '</p><small>Ordered</small></span><span class="pd-mid"><p>1</p><small>Reserved</small></span><span><p data-wdate>' + S.date + '</p><small>Promise date</small></span></div>';
          }).join('');
      }
      function pre() {
        var I2 = D.ficons, check = '<span class="pd-cbx is-on">' + I2.checkmark + '</span>', box = '<span class="pd-cbx"></span>';
        var html = '<div class="pd-card pd-searchcard"><button type="button" class="pd-sbar" data-info="presearch">' + I['search-outline'] + '<span>Order name</span></button><div class="pd-sel">' +
          [['Status', 'All statuses'], ['Future inventory type', 'All types'], ['Sales channel', 'All channels'], ['Shipping method', 'All methods']].map(function (f) {
            return '<button type="button" data-info="prefilter"><small>' + f[0] + '</small>' + f[1] + I['caret-down'] + '</button>'; }).join('') + '</div></div>';
        if (S.released) {
          q('[data-pre]').innerHTML = html + '<div class="pd-empty"><b>No matching pre-orders</b>Pre-orders are open orders with items still waiting on future inventory, with no stock reserved yet. Adjust the search text or filters to broaden the list.</div>';
          return;
        }
        html += '<div class="pd-plh">' + (S.psel ? '<button type="button" data-act="pall" aria-label="Select all loaded orders">' + (S.pall ? check : box) + '</button>' : '') +
          '<span>31 of 31 pre-orders</span><button type="button" class="pd-tb pd-tb--sm" data-info="presort">Newest first</button><button type="button" class="pd-tb pd-tb--sm" data-act="pselect">' + (S.psel ? 'Done' : 'Select') + '</button></div>';
        html += D.pre.map(function (r) {
          return '<div class="pd-row pd-row--pre" data-prerow><span class="pd-who">' + (S.psel ? (S.pall ? check : box) : '') + '<span><p>' + esc(r[0]) + '</p><small>' + r[1] + ' - ' + r[1].slice(3) + ' - Approved</small></span></span>' +
            '<span class="pd-mid"><p>1 pre-order item</p><small class="pd-amber">1 ready to release</small></span><span class="pd-mid"><p>Pre-order</p><small>Web Channel</small></span>' +
            '<span class="pd-mid"><p>' + r[2] + '</p><small>Ordered ' + r[3] + ' days ago</small></span><span><p>Nov 13, 2026</p><small>Promised today</small></span></div>';
        }).join('');
        q('[data-pre]').innerHTML = html;
        var foot = q('[data-prefoot]'); foot.hidden = !S.psel; q('[data-presel]').textContent = (S.pall ? 31 : 0) + ' selected';
        q('[data-act="prelease"]').setAttribute('aria-disabled', S.pall ? 'false' : 'true');
      }
      function pinStore() {
        var c = G.calloutBox(); if (c.classList.contains('is-docked')) return;
        var a = app.getBoundingClientRect(), m = q('[data-store] .pd-media').getBoundingClientRect();
        c.style.left = Math.max(12, m.left - a.left + 20) + 'px'; c.style.top = Math.max(12, m.top - a.top + 20) + 'px';
      }
      function pinPo() {
        var c = G.calloutBox(); if (c.classList.contains('is-docked')) return;
        var a = app.getBoundingClientRect(), card = q('[data-view="po"] .pd-summary > .pd-card').getBoundingClientRect(), box = q('[data-view="po"] .pd-content').getBoundingClientRect();
        c.style.left = Math.max(12, card.left - a.left) + 'px'; c.style.top = Math.max(12, box.top - a.top + 12) + 'px';
      }
      function storeState(state, hide, date) {
        var st = q('[data-store]'), b = q('[data-buy]');
        b.textContent = state === 'pre' ? 'Pre-Order' : 'Sold out'; b.classList.toggle('is-sold', state !== 'pre');
        q('[data-edd]').hidden = state !== 'pre'; if (date) q('[data-eddv]').textContent = date;
        if (hide) { st.hidden = true; st.classList.remove('is-out'); q('[data-cartn]').hidden = true; q('[data-eddv]').textContent = 'Wed 11 Nov'; }
      }
      function showStore(state, date) { var st = q('[data-store]'), t = q('[data-toast]'); t.classList.remove('is-in'); t.hidden = true; storeState(state, false, date); st.classList.add('is-out'); st.hidden = false; twoFrames(function () { st.classList.remove('is-out'); }); }
      function hideStore(then) { var st = q('[data-store]'); st.classList.add('is-out'); later(450, function () { st.hidden = true; if (then) then(); }); }
      function infoNote(key, anchorEl, ms, then) {
        function pl() { G.position(anchorEl, anchorEl, 16, true); if (anchorEl.closest('[data-view="po"]')) pinPo(); if (anchorEl.closest('[data-store]')) pinStore(); }
        G.showCallout(D.callouts[key], pl);
        later(ms, function () { G.hideCallout(); then(); });
      }
      function ship() {
        var Sh = D.ship, total = sum(2);
        q('[data-ship]').innerHTML = '<section class="pd-summary"><div class="pd-card"><div class="pd-card__h"><p class="pd-card__sub">' + esc(Sh.id) + '</p><p class="pd-card__t">' + esc(D.po.dest) + '</p></div>' +
          '<div class="pd-it"><span class="pd-it__l">Status</span><span class="pd-badge ' + (S.received ? 'pd-badge--success">Received' : 'pd-badge--primary">Shipped') + '</span></div>' +
          '<button type="button" class="pd-it" data-info="po"><span class="pd-it__l"><span class="pd-over">Purchase order</span>' + esc(D.po.name) + '</span>' + I['chevron-forward'] + '</button>' +
          '<div class="pd-it"><span class="pd-it__l">Shipped</span><span class="pd-note">' + esc(Sh.shipped) + '</span></div>' +
          '<div class="pd-it"><span class="pd-it__l">Created</span><span class="pd-note">' + esc(Sh.created) + '</span></div></div>' +
          '<div class="pd-stats">' + stat('Estimated arrival', esc(Sh.arrive), S.received ? '' : esc(Sh.arriveRel)) + stat('Shipped', total, D.lines.length + ' items') +
          stat('Received', '<span class="pd-num" data-rcv>' + (S.received ? total : 0) + '</span>', (S.received ? '1 receipt' : '0 receipts')) + '</div></section>' +
          '<div class="pd-lh">Items</div>' + D.lines.map(function (l) {
            return '<div class="pd-row" style="--mid:1">' + prod(l) + '<span class="pd-mid"><p>' + l[2] + '</p><small>Shipped</small></span><span><p class="pd-num">' + (S.received ? l[2] : 0) + '</p><small>Received</small></span></div>';
          }).join('') +
          (S.received ? '' : '<div class="pd-lh">Receive</div><p class="pd-help">Enter what arrived of each item: everything left is filled in. Receiving part of it keeps the shipment open for the rest.</p>' +
            D.lines.map(function (l) {
              return '<div class="pd-recv"><div class="pd-prod"><img src="' + root.dataset.img + '" alt="" width="40" height="54"><div><p>' + esc(l[1]) + '</p><small>' + l[2] + ' left to receive</small></div></div>' +
                '<span class="pd-in"><small>Accepted</small>' + l[2] + '</span><button type="button" class="pd-in" data-info="rejectqty"><small>Rejected</small></button></div>';
            }).join('') + '<div class="pd-actions"><button type="button" class="pd-btn pd-btn--solid" data-act="receive">Receive ' + total + ' units</button></div>');
      }
      function cal() {
        var g = '<div class="pd-cal__h"><span>November 2026</span><span>' + I['chevron-back'] + I['chevron-forward'] + '</span></div><div class="pd-cal__g">' +
          ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (d) { return '<b>' + d + '</b>'; }).join('');
        for (var d = 1; d <= 30; d++) {
          var off = d < 11;
          g += '<button type="button" class="pd-day' + (d === S.day ? ' is-sel' : '') + '"' + (off ? ' aria-disabled="true"' : '') + ' data-day="' + d + '">' + d + '</button>';
        }
        q('[data-cal]').innerHTML = g + '</div>';
        q('[data-date-label]').textContent = 'Nov ' + S.day + ', 2026';
      }
      function toast(msg, ms) {
        var t = q('[data-toast]'); t.textContent = msg; t.hidden = false; t.classList.remove('is-in');
        var c = G.calloutBox(); t.style.bottom = (!c.hidden && c.classList.contains('is-docked') && !c.classList.contains('is-top')) ? (c.offsetHeight + 24) + 'px' : '';
        twoFrames(function () { t.classList.add('is-in'); });
        clearTimeout(S.toastT); S.toastT = setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.hidden = true; }, 300); }, G.T(ms || 2600));
      }
      function loader(ms, then) { q('[data-loader]').hidden = false; later(ms, function () { q('[data-loader]').hidden = true; then(); }); }
      function visible(el) { return el && !el.closest('[hidden]') && el.offsetParent !== null; }
      function reveal(el) {
        var box = el.closest('.pd-content, .fapp-content, .fapp-staff, .fapp-modal__panel'); if (!box) return;
        var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (er.bottom > br.bottom - 90 || er.top < br.top + 4) box.scrollTo({ top: box.scrollTop + er.top - br.top - 110, behavior: reduce ? 'auto' : 'smooth' });
      }
      function target(name) {
        qa('.is-target').forEach(function (el) { el.classList.remove('is-target'); });
        S.target = name; G.target = name;
        var el = name && q(SEL[name]), ok = el && visible(el);
        if (!ok || !G.started) { G.hideCallout(); return; }
        el.classList.add('is-target');
        if (FW[name]) { reveal(el); G.showCallout(D.callouts[name], place); return; }
        if (G.keyboard && G.focusInApp()) el.focus({ preventScroll: true });
        reveal(el);
        later(reduce ? 0 : 260, function () { if (S.target === name) G.showCallout(D.callouts[name], place); });
      }
      function retarget() { if (S.target) { var el = q(SEL[S.target]); if (el && visible(el)) { qa('.is-target').forEach(function (x) { x.classList.remove('is-target'); }); el.classList.add('is-target'); place(); } } }
      function place() {
        var el = S.target && q(SEL[S.target]); if (!el || !visible(el)) return;
        var anchor = S.target === 'back' ? q('[data-view="batch"] .pd-stats') : (ANCHOR[S.target] && el.closest(ANCHOR[S.target])) || el;
        G.position(el, anchor, FW[S.target] ? 24 : 20, true);
        if (el.closest('[data-store]')) pinStore();
        var c = G.calloutBox();
        if (S.target === 'line' && !c.classList.contains('is-docked')) {
          var a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
          c.style.left = Math.max(12, r.left - a.left + 8) + 'px';
        }
      }
      function nudge() { var el = S.target && q(SEL[S.target]); G.nudge(el && visible(el) ? el : null); }
      function tip(el, text) { G.tip(el, text); nudge(); }
      function chips(res) {
        qa('[data-line]').forEach(function (row, i) { row.querySelector('.pd-num').textContent = (D.lines[i][2] - res[i]) + ' ATP, ' + res[i] + ' reserved'; });
        var s2 = q('[data-sold]'); if (s2) s2.textContent = res.reduce(function (a, b) { return a + b; }, 0);
      }
      function rise(els, step) {
        if (reduce) return;
        [].forEach.call(els, function (e, i) { if (e && e.animate) e.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: (step || 0) * i, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' }); });
      }
      function flash(el) { if (!el || reduce) return; el.classList.remove('pd-flash'); void el.offsetWidth; el.classList.add('pd-flash'); }
      function arrivals(done) {
        var res = [0, 0, 0, 0], total = sum(3), anchor = q('[data-view="po"] [data-lines]');
        function placeInfo() {
          G.position(anchor, anchor, 16, true);
          var c = G.calloutBox();
          if (c.classList.contains('is-docked')) return;
          var a = app.getBoundingClientRect(), card = q('[data-view="po"] .pd-summary > .pd-card').getBoundingClientRect(), box = q('[data-view="po"] .pd-content').getBoundingClientRect();
          c.style.left = Math.max(12, card.left - a.left) + 'px';
          c.style.top = Math.max(12, box.top - a.top + 12) + 'px';
        }
        reveal(anchor);
        G.showCallout(D.callouts.arrive, placeInfo);
        var text = G.calloutBox().querySelector('[data-callout-text]');
        text.insertAdjacentHTML('beforeend', '<span class="pd-feed" data-feed></span>');
        var feed = text.querySelector('[data-feed]'), k = 0;
        (function one() {
          if (k < D.arrive.length) {
            var a2 = D.arrive[k++]; res[a2[1]]++; chips(res); flash(qa('[data-line]')[a2[1]]);
            feed.insertAdjacentHTML('beforeend', '<i>New pre-order · ' + esc(a2[0]) + ' · Size ' + D.lines[a2[1]][0] + '</i>'); rise([feed.lastElementChild]);
            placeInfo(); later(650, one); return;
          }
          var start = res.slice(), steps = 12, n = 0;
          feed.insertAdjacentHTML('beforeend', '<i data-more></i>'); rise([feed.lastElementChild]);
          (function rest() {
            n++; var f = n / steps;
            for (var i = 0; i < 4; i++) res[i] = Math.round(start[i] + (D.lines[i][3] - start[i]) * f);
            chips(res);
            var got = res.reduce(function (a, b) { return a + b; }, 0) - D.arrive.length;
            feed.querySelector('[data-more]').textContent = '+ ' + got + ' more pre-orders';
            if (n < steps) later(110, rest); else { S.reserved = true; later(900, done); }
          })();
        })();
      }
      function layer(sel, on) { G.layer(q(sel), on, 320); }
      var F;
      function fq(s2) { return q('[data-fapp] ' + s2); }
      function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
      function fitem(it, mode) {
        var extra = mode === 'progress' ? '<button type="button" class="fapp-select" data-info="boxsel">Box A ' + FI.caret + '</button><button type="button" class="fapp-ico fapp-ico--danger" data-info="reject" aria-label="Reject item">' + FI['trash-bin-outline'] + '</button>' : '';
        return '<div class="fapp-item"><img class="fapp-thumb" src="' + it[0][0] + '" alt="" width="27" height="47"><div class="fapp-item__text"><p class="fapp-overline">' + it[0][1].toUpperCase() +
          '</p><p class="fapp-sku">' + it[1] + '</p><p class="fapp-variant">' + it[2] + '</p></div>' + extra + '<button type="button" class="fapp-ico" data-info="cube" aria-label="Check stock">' + FI['cube-outline'] + '</button></div>';
      }
      function fhead(o, right, long) {
        return '<div class="fapp-card__head"><div><p class="fapp-name">' + o.name + '</p><p class="fapp-meta">Ordered ' + o.date + (long ? ' ' + o.ts + ' AM' : ', ' + o.ts) +
          '</p></div><div class="fapp-card__mid"><button type="button" class="fapp-idchip" data-info="idchip-later">' + FI['pricetag-outline'] + '<span>' + o.id + '</span>' + FI.caret + '</button></div><div class="fapp-right">' + right + '</div></div>';
      }
      function fchip(label, sub, on, attrs, radio) {
        var icn = radio ? (on ? FI['radio-button-on'] : FI['radio-button-off']) : (on ? FI.checkbox : FI['square-outline']);
        return '<button type="button" class="fapp-filter' + (radio ? ' fapp-filter--radio' : '') + (on ? ' is-on' : '') + '" ' + attrs + '>' + icn + '<span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';
      }
      function frender() {
        fq('[data-methods]').innerHTML = D.fmethods.map(function (m) {
          var os = F.open.filter(function (o) { return o.method === m; });
          return fchip(m, plural(os.length, 'order') + ', ' + plural(os.length, 'item'), false, 'data-info="filter"');
        }).join('');
        fq('[data-count="open"]').textContent = F.open.length + ' of ' + plural(F.open.length, 'order');
        fq('[data-list="open"]').innerHTML = F.open.map(function (o) { return '<article class="fapp-card" data-order="' + o.id + '">' + fhead(o, o.method, true) + o.items.map(function (i) { return fitem(i, 'open'); }).join('') + '</article>'; }).join('');
        fq('[data-empty="open"]').hidden = F.open.length > 0;
        fq('[data-count="progress"]').textContent = F.progress.length + ' of ' + plural(F.progress.length, 'order');
        fq('[data-pickers]').innerHTML = F.progress.length ? fchip('All', '1 picklist', true, 'data-info="pickerchip"', true) + fchip(F.picker[0] || '', '9:52', false, 'data-info="pickerchip"', true) : '';
        fq('[data-list="progress"]').innerHTML = F.progress.map(function (o, k) {
          return '<article class="fapp-card" data-order="' + o.id + '">' + fhead(o, o.carrier) + '<div class="fapp-boxrow"><button type="button" class="fapp-pill fapp-pill--outline" data-info="addbox">' + FI.add + 'ADD BOX</button><button type="button" class="fapp-pill fapp-pill--fill" data-info="boxtype">Box A | Standard Box ' + FI.caret + '</button></div>' +
            o.items.map(function (i) { return fitem(i, 'progress'); }).join('') + '<div class="fapp-actions"><button type="button" class="fapp-btn fapp-btn--solid" ' + (k === 0 ? 'data-t="pack"' : 'data-info="otherpack"') + '>PACK</button></div></article>';
        }).join('');
        fq('[data-empty="progress"]').hidden = F.progress.length > 0;
        fq('[data-count="completed"]').textContent = F.completed.length + ' of ' + plural(F.completed.length, 'order');
        fq('[data-carriers]').innerHTML = fchip('All', '', true, 'data-info="shipfilter"', true) + fchip('FedEx', '', false, 'data-info="shipfilter"', true) +
          ['Next Day', 'Two Day', 'FedEx Ground', 'Standard'].map(function (m) { return fchip(m, '', false, 'data-info="shipfilter"'); }).join('');
        fq('[data-list="completed"]').innerHTML = F.completed.map(function (o) {
          return '<article class="fapp-card" data-order="' + o.id + '">' + fhead(o, o.carrier + '<br>Tracking Code ' + o.trk) + o.items.map(function (i) { return fitem(i, 'completed'); }).join('') +
            '<div class="fapp-actions"><button type="button" class="fapp-btn fapp-btn--solid" data-t="ship">SHIP NOW</button><button type="button" class="fapp-btn fapp-btn--outline" data-info="printlabel">PRINT SHIPPING LABEL</button>' +
            '<button type="button" class="fapp-btn fapp-btn--outline fapp-hide-sm" data-info="printletter">PRINT CUSTOMER LETTER</button><button type="button" class="fapp-btn fapp-btn--outline fapp-btn--danger" data-info="unpack">UNPACK</button></div></article>';
        }).join('');
        fq('[data-empty="completed"]').hidden = F.completed.length > 0;
      }
      function fstaff() {
        fq('[data-staff]').innerHTML = D.fstaff.map(function (st) {
          return '<button type="button" class="fapp-row" data-act="staff" data-name="' + esc(st[0]) + '"><span><span class="fapp-row__name">' + st[0] + '</span><span class="fapp-row__id">' + st[1] + '</span></span><span class="fapp-check' + (F.picker.indexOf(st[0]) > -1 ? ' is-on' : '') + '">' + FI.checkmark + '</span></button>';
        }).join('');
        fq('[data-selected]').innerHTML = F.picker.map(function (n) { return '<button type="button" class="fapp-pill fapp-pill--fill" data-act="staff" data-name="' + esc(n) + '">' + n + ' ' + FI['close-circle'] + '</button>'; }).join(' ');
        fq('[data-t="save"]').disabled = !F.picker.length;
      }
      function rng(seed) { var h = 0; for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return function () { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; }; }
      function bars(seed) { var r = rng(seed + 'b'), x = 0, out = ''; while (x < 360) { var w = [1, 1, 2, 2, 3, 4][Math.floor(r() * 6)]; if (r() > 0.45) out += '<rect x="' + x + '" y="0" width="' + w + '" height="64"/>'; x += w; } return '<svg class="doc-bar" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>'; }
      function code2d(seed) { var r = rng(seed + 'p'), out = ''; for (var y = 0; y < 9; y++) for (var x = 0; x < 48; x++) if (r() > 0.5) out += '<rect x="' + x * 6 + '" y="' + y * 6 + '" width="6" height="6"/>'; return '<svg class="doc-2d" viewBox="0 0 288 54" aria-hidden="true">' + out + '</svg>'; }
      function papersPick() {
        fq('[data-row="pick"]').innerHTML = '<div class="doc doc--pick" data-paper="pick"><p class="doc-store">Central Warehouse</p><p class="doc-sub">Picklist · ' + F.picker.join(', ') + ' · 13 Nov 2026</p><table><thead><tr><th>Order #</th><th>Product</th><th>To Pick</th></tr></thead><tbody>' +
          F.batch.slice(0, 7).map(function (o, k) { var it = o.items[0]; return '<tr' + (k % 2 ? ' class="alt"' : '') + '><td>' + o.id + '</td><td><small>' + it[1] + '</small><b>' + it[0][1] + '</b><small>' + it[2] + '</small></td><td>1</td></tr>'; }).join('') +
          '</tbody></table><p class="doc-foot">' + plural(F.batch.length, 'item') + ' · ' + plural(F.batch.length, 'order') + '</p></div>';
      }
      function papersShip(o) {
        var label = '<div class="doc doc--label" data-paper="label"><div class="lbl-top"><div><p>FROM:</p><p>Central Warehouse</p><p>1200 Harbor Blvd</p><p>Secaucus NJ 07094</p><p>US</p></div><div><p>SHIP DATE: 13NOV26</p><p>ACTWGT: ' + o.weight.toUpperCase() +
          '</p><p>DIMMED: 15 X 10 X 5 IN</p><p>BILL SENDER</p></div></div><div class="lbl-to"><span>TO</span><div><p class="lbl-big">' + o.name + '</p><p>' + o.addr[0] + '</p><p class="lbl-big">' + o.addr[1].replace(',', '') +
          '</p><p>REF: ' + o.id + '</p></div></div><div class="lbl-mid">' + code2d(o.trk) + '<div class="lbl-fx"><p class="lbl-fedex">FedEx</p><p>' + o.service + '</p><span class="lbl-g">' + o.letter + '</span></div></div><p class="lbl-trk"><small>TRK#</small> ' + o.trk + '</p>' + bars(o.trk) + '</div>';
        var slip = '<div class="doc doc--slip" data-paper="slip"><p class="doc-h">Packing Slip</p><table class="doc-kv"><tr><th>Shipment #</th><td>M1048' + o.id.slice(-2) + '</td></tr><tr><th>Status</th><td>Packed</td></tr><tr><th>Order #</th><td>' + o.id +
          '</td></tr></table><p class="doc-pkg">Package 1 of 1</p><div class="doc-two"><table><tr><th>Shipping Address</th></tr><tr><td>To: ' + o.name + '<br>' + o.addr[0] + '<br>' + o.addr[1] + ' USA</td></tr></table><table><tr><th>Shipment Method</th></tr><tr><td>FEDEX ' + o.carrier +
          '</td></tr></table></div><table class="doc-items"><tr><th></th><th>Name</th><th>Qty</th></tr>' + o.items.map(function (it) { return '<tr><td>' + it[3] + '</td><td><b>' + it[0][1] + '</b><br>' + it[4] + '</td><td>1</td></tr>'; }).join('') + '</table><table class="doc-wt"><tr><th>Weight</th><td>' + o.weight + '</td></tr></table></div>';
        fq('[data-row="ship"]').innerHTML = label + slip;
      }
      function papers(on, names) {
        fq('[data-tray]').classList.toggle('is-on', on);
        names.forEach(function (n, k) { var pp = fq('[data-paper="' + n + '"]'); if (!pp) return;
          if (on) later(k * 260, function () { pp.classList.remove('is-out'); pp.classList.add('is-in'); }); else { pp.classList.remove('is-in'); pp.classList.add('is-out'); } });
      }
      function fnav(v) { qa('[data-fapp] [data-nav]').forEach(function (n) { n.classList.toggle('is-active', n.dataset.nav === v); }); }
      function fshow(v) { fnav(v); G.show(v); }
      function fmodal(name, on) { G.layer(fq('[data-modal="' + name + '"]'), on, 420); }
      function freset() {
        var fa = q('[data-fapp]');
        if (fshell === null) fshell = fa.innerHTML; else fa.innerHTML = fshell;
        fa.hidden = true; fa.classList.remove('is-out');
        F = { open: D.forders.slice(), progress: [], completed: [], picker: [], batch: [] };
        frender(); fnav('open');
      }
      function fstart() {
        var fa = q('[data-fapp]'); fa.classList.add('is-out'); fa.hidden = false;
        fshow('open'); twoFrames(function () { fa.classList.remove('is-out'); });
        later(700, function () { target('print'); });
      }
      var fflow = {
        print: function () { F.batch = F.open.slice(); F.picker = []; fstaff(); target(null); fmodal('pickers', true); later(450, function () { target('staff'); }); },
        staff: function (el) { var n = el.dataset.name, j = F.picker.indexOf(n); if (j > -1) F.picker.splice(j, 1); else F.picker.push(n); fstaff(); target(F.picker.length ? 'save' : 'staff'); },
        save: function () {
          target(null); fmodal('pickers', false); papersPick(); later(300, function () { papers(true, ['pick']); });
          F.batch.forEach(function (o, n) { later(700 + n * 120, function () { var c = fq('[data-list="open"] [data-order="' + o.id + '"]'); if (c) c.classList.add('is-gone'); }); });
          later(1300, function () { F.open = []; F.progress = F.batch.slice(); frender(); });
          later(2500, function () { papers(false, ['pick']); fshow('progress'); });
          later(3000, function () { target('pack'); });
        },
        pack: function () { target(null); fmodal('pack', true); later(450, function () { target('dlgpack'); }); },
        dlgpack: function () {
          var hero = F.progress[0]; target(null); fmodal('pack', false); papersShip(hero);
          later(350, function () { papers(true, ['label', 'slip']); });
          later(1300, function () { var c = fq('[data-list="progress"] [data-order="' + hero.id + '"]'); if (c) c.classList.add('is-gone'); });
          later(1850, function () { F.progress = F.progress.slice(1); F.completed = [hero]; frender(); });
          later(3100, function () { papers(false, ['label', 'slip']); fshow('completed'); });
          later(3650, function () { target('fship'); });
        },
        fship: function () {
          target(null); var b = fq('[data-t="ship"]'); b.textContent = 'SHIPPED'; b.classList.add('is-done'); b.removeAttribute('data-t');
          toast('Order shipped successfully'); later(1100, function () { G.setStep(5); G.finish(); });
        }
      };
      app.addEventListener('click', function (e) {
        var el = e.target.closest('button'); if (!el || !app.contains(el)) return;
        G.press(el, e);
        if (!G.started) return;
        if (el.dataset.info) {
          if (!q('[data-pdpop]').hidden && el.closest('[data-pdpop]')) layer('[data-pdpop]', false);
          var key = el.dataset.info + (el.classList.contains('is-on') && D.info[el.dataset.info + '-on'] ? '-on' : '');
          return tip(el, D.info[key] || '');
        }
        if (el.hasAttribute('data-buy')) {
          if (S.target !== 'buy') return nudge();
          target(null); el.textContent = 'Adding...';
          later(600, function () { el.textContent = 'Pre-Order'; q('[data-cartn]').hidden = false; flash(q('.pd-bag')); });
          later(1500, function () { hideStore(function () { G.setStep(1); arrivals(function () { target('line'); }); }); });
          return;
        }
        if (el.closest('[data-fapp]')) {
          if (el.disabled) return;
          var t = el.dataset.t, fa = el.dataset.act;
          if (fa === 'staff' && (S.target === 'staff' || S.target === 'save')) return fflow.staff(el);
          if (t === 'print' && S.target === 'print') return fflow.print();
          if (t === 'save' && S.target === 'save') return fflow.save();
          if (t === 'pack' && S.target === 'pack') return fflow.pack();
          if (t === 'dlgpack' && S.target === 'dlgpack') return fflow.dlgpack();
          if (t === 'ship' && S.target === 'fship') return fflow.fship();
          if (fa === 'closepickers') { fmodal('pickers', false); F.picker = []; return target('print'); }
          if (fa === 'cancelpack') { fmodal('pack', false); return target('pack'); }
          if (el.dataset.nav) { fshow(el.dataset.nav); return; }
          if (t) return tip(el, D.info.later);
          return nudge();
        }
        var k = el.dataset.act;
        if (el.hasAttribute('data-alert-cancel')) { layer('[data-alert]', false); later(200, function () { target('more'); }); return; }
        if (el.hasAttribute('data-date-close')) { layer('[data-date]', false); later(200, function () { target('more2'); }); return; }
        if (el.hasAttribute('data-alert2-cancel')) { layer('[data-alert2]', false); later(200, function () { target('prelease'); }); return; }
        if (el.dataset.day && S.target === 'day') { if (el.getAttribute('aria-disabled') === 'true') return; S.day = +el.dataset.day; cal(); target(S.day === 13 ? 'confirm' : 'day'); return; }
        if (el.dataset.day) return;
        if (k === 'more' && S.target === 'more2') { layer('[data-pdpop]', true); target(null); later(240, function () { target('arrival'); }); return; }
        if (k === 'arrival' && S.target === 'arrival') { layer('[data-pdpop]', false); target(null); later(180, function () { cal(); layer('[data-date]', true); later(320, function () { target('day'); }); }); return; }
        if (k === 'sell' && S.batches) { layer('[data-pdpop]', false); return tip(q('[data-act="more"]'), D.info.sellagain); }
        if (k === 'more' && S.target === 'more') { layer('[data-pdpop]', true); target(null); later(240, function () { target('sell'); }); return; }
        if (k === 'sell' && S.target === 'sell') { layer('[data-pdpop]', false); later(180, function () { layer('[data-alert]', true); later(200, function () { target('create'); }); }); target(null); return; }
        if (k === 'create' && S.target === 'create') {
          target(null); layer('[data-alert]', false);
          later(160, function () { loader(800, function () {
            S.batches = true; po(true); rise(qa('[data-line] .pd-chip'), 90); toast('Future inventory created.');
            later(1500, function () {
              if (PDP) { showStore('pre'); later(600, function () { target('buy'); }); return; }
              G.setStep(1); arrivals(function () { target('line'); });
            });
          }); });
          return;
        }
        if (el.dataset.line && S.target === 'line') { target(null); menu('fi'); batch(); G.show('batch'); G.setStep(2); later(900, function () { target('back'); }); return; }
        if (el.dataset.line) return tip(el, D.info.line);
        if (k === 'confirm' && S.target === 'confirm') {
          target(null); layer('[data-date]', false);
          later(160, function () { loader(700, function () {
            S.date = 'Nov 13, 2026'; S.dateRel = 'in 13 days'; po();
            qa('[data-line]').forEach(function (row, i) { later(i * 90, function () { flash(row); }); });
            toast('Arrival date changed.');
            later(900, function () {
              if (PDP) {
                showStore('pre', 'Fri 13 Nov'); q('[data-cartn]').hidden = false; later(500, function () { flash(q('[data-edd]')); });
                later(700, function () { infoNote('toldpdp', q('[data-edd]'), 3800, function () { hideStore(function () { G.setStep(3); target('ship'); }); }); });
                return;
              }
              infoNote('told', q('[data-view="po"] [data-lines]'), 3600, function () { G.setStep(3); target('ship'); });
            });
          }); });
          return;
        }
        if (k === 'back' && S.target === 'back') { target(null); menu('po'); po(); G.show('po'); later(700, function () { target('more2'); }); return; }
        if (k === 'back') return tip(el, D.info.later);
        if (k && SEL[S.target] && !el.matches(SEL[S.target])) return tip(el, D.info.later);
        if (k === 'ship' && S.target === 'ship') { target(null); menu('ship'); ship(); G.show('ship'); later(800, function () { target('receive'); }); return; }
        if (k === 'pselect' && S.target === 'pselect') {
          S.psel = true; pre(); rise(qa('[data-view="pre"] .pd-cbx'), 12);
          var foot = q('[data-prefoot]'); if (!reduce && foot.animate) foot.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,.61,.36,1)' });
          target('pall'); return;
        }
        if (k === 'pall' && S.target === 'pall') {
          S.pall = true; pre();
          if (!reduce) qa('[data-view="pre"] .pd-cbx.is-on').forEach(function (b, i) { if (b.animate) b.animate([{ transform: 'scale(.6)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 260, delay: i * 14, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' }); });
          target('prelease'); return;
        }
        if (k === 'prelease' && S.target === 'prelease') { target(null); layer('[data-alert2]', true); later(200, function () { target('pconfirm'); }); return; }
        if (k === 'pconfirm' && S.target === 'pconfirm') {
          target(null); layer('[data-alert2]', false);
          later(160, function () { loader(900, function () {
            toast('31 items released to brokering.', 2600); q('[data-prefoot]').hidden = true;
            qa('[data-prerow]').forEach(function (r, i) { if (i < 9) later(i * 70, function () { r.classList.add('is-gone'); }); });
            later(900, function () {
              S.released = true; S.psel = false; pre(); rise([q('[data-view="pre"] .pd-empty')]);
              infoNote('routed', q('[data-view="pre"] .pd-empty'), 4200, function () {
                if (FUL) { G.setStep(4); fstart(); } else { G.setStep(NSTEPS); G.finish(); }
              });
            });
          }); });
          return;
        }
        if (k === 'receive' && S.target === 'receive') {
          target(null);
          loader(900, function () {
            S.received = true; ship(); toast('Shipment received.', 2400);
            q('[data-ship]').scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            later(2600, function () { menu('pre'); S.psel = false; S.pall = false; pre(); G.show('pre');
              later(800, function () { infoNote('auto', q('[data-view="pre"] .pd-plh'), 5200, function () { target('pselect'); }); }); });
          });
          return;
        }
        nudge();
      });
      app.addEventListener('click', function (e) {
        if (!G.started || e.target.closest('button')) return;
        if (!q('[data-pdpop]').hidden && !e.target.closest('[data-pdpop]')) { layer('[data-pdpop]', false); later(200, function () { target('more'); }); return; }
        if (e.target.closest('.pd-content, .fapp-main')) nudge();
      });
      function begin() {
        G.setStep(0);
        if (!PDP) return later(500, function () { target('more'); });
        showStore('soldout');
        later(700, function () { infoNote('pdp0', q('[data-buy]'), 4200, function () { hideStore(function () { later(300, function () { target('more'); }); }); }); });
      }
      G.onStart(begin);
      G.onReplay(function () { reset(); later(400, begin); });
      window.addEventListener('resize', function () { place(); G.placeTip(); });
      app.addEventListener('scroll', function () { place(); G.placeTip(); }, true);
      reset();
    });
  }
  (window.hwClickDemos = window.hwClickDemos || []).push(init);
})();
