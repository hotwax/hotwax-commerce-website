(function () {
  function init(CD) {
    document.querySelectorAll('[data-sd]').forEach(function (root) {
      if (root.hasAttribute('data-ready')) return;
      root.setAttribute('data-ready', '');
      var D = JSON.parse(root.querySelector('[data-sd-data]').textContent);
      var I = D.icons;
      var app = root.querySelector('[data-app]');
      var doneText = root.querySelector('[data-done-text]');
      var doneCopy = doneText ? doneText.textContent : '';
      var S;
      var G = CD.create(root, {
        reducedMs: 0,
        tipFade: false,
        ripple: '.fapp-btn,.fapp-big,.fapp-fab,.fapp-dialog__btns button,.fapp-pop__item',
        rippleClass: 'fapp-ripple',
        onShow: function (view) { nav(view); syncCallout(view); }
      });
      var esc = CD.esc, later = G.later, twoFrames = G.twoFrames;

      function q(sel) { return app.querySelector(sel); }
      function qa(sel) { return app.querySelectorAll(sel); }
      function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
      function byId(id) { return D.orders.filter(function (o) { return o.id === id; })[0]; }
      function firstName(n) { return n.split(' ')[0]; }

      function item(it, mode) {
        var extra = mode === 'progress'
          ? '<button type="button" class="fapp-select" data-info="boxsel">Box A ' + I.caret + '</button><button type="button" class="fapp-ico fapp-ico--danger" data-info="reject" aria-label="Reject item">' + I['trash-bin-outline'] + '</button>'
          : '';
        return '<div class="fapp-item"><img class="fapp-thumb" src="' + it[0][0] + '" alt="" width="27" height="47" loading="lazy" decoding="async"><div class="fapp-item__text"><p class="fapp-overline">' + it[0][1].toUpperCase() +
          '</p><p class="fapp-sku">' + it[1] + '</p><p class="fapp-variant">' + it[2] + '</p></div>' + extra +
          '<button type="button" class="fapp-ico" data-info="cube" aria-label="Check stock">' + I['cube-outline'] + '</button></div>';
      }
      function idchip(o, act) {
        return '<button type="button" class="fapp-idchip" data-' + (act ? 'act="opts"' : 'info="idchip-later"') + ' data-order="' + o.id + '">' + I['pricetag-outline'] + '<span>' + o.id + '</span>' + I.caret + '</button>';
      }
      function head(o, right, act, long) {
        return '<div class="fapp-card__head"><div><p class="fapp-name">' + o.name + '</p><p class="fapp-meta">Ordered ' + (long ? '23 October 2026 ' + o.t : '23 Oct 2026, ' + o.ts) +
          '</p></div><div class="fapp-card__mid">' + idchip(o, act) + '</div><div class="fapp-right">' + right + '</div></div>';
      }
      function openCard(o) {
        return '<article class="fapp-card" data-order="' + o.id + '">' + head(o, o.method, true, true) + o.items.map(function (i) { return item(i, 'open'); }).join('') + '</article>';
      }
      function progressCard(o, hero) {
        return '<article class="fapp-card" data-order="' + o.id + '">' + head(o, o.carrier, false) +
          '<div class="fapp-boxrow"><button type="button" class="fapp-pill fapp-pill--outline" data-info="addbox">' + I.add + 'ADD BOX</button><button type="button" class="fapp-pill fapp-pill--fill" data-info="boxtype">Box A | Standard Box ' + I.caret + '</button></div>' +
          o.items.map(function (i) { return item(i, 'progress'); }).join('') +
          '<div class="fapp-actions"><button type="button" class="fapp-btn fapp-btn--solid" ' + (hero ? 'data-t="pack"' : 'data-info="otherpack"') + '>PACK</button></div></article>';
      }
      function completedCard(o) {
        return '<article class="fapp-card" data-order="' + o.id + '">' + head(o, o.carrier + '<br>Tracking Code ' + o.trk, false) + o.items.map(function (i) { return item(i, 'completed'); }).join('') +
          '<div class="fapp-actions"><button type="button" class="fapp-btn fapp-btn--solid" data-t="ship">SHIP NOW</button><button type="button" class="fapp-btn fapp-btn--outline" data-info="printlabel">PRINT SHIPPING LABEL</button>' +
          '<button type="button" class="fapp-btn fapp-btn--outline fapp-hide-sm" data-info="printletter">PRINT CUSTOMER LETTER</button><button type="button" class="fapp-btn fapp-btn--outline fapp-btn--danger" data-info="unpack">UNPACK</button></div></article>';
      }
      function chip(label, sub, on, attrs, radio) {
        var ic = radio ? (on ? I['radio-button-on'] : I['radio-button-off']) : (on ? I.checkbox : I['square-outline']);
        return '<button type="button" class="fapp-filter' + (radio ? ' fapp-filter--radio' : '') + (on ? ' is-on' : '') + '" ' + attrs + '>' + ic + '<span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';
      }
      function visibleOpen() {
        return S.open.filter(function (o) { return !S.filters.length || S.filters.indexOf(o.method) > -1; });
      }
      function renderOpen() {
        var vis = visibleOpen();
        q('[data-methods]').innerHTML = D.methods.map(function (m) {
          var os = S.open.filter(function (o) { return o.method === m; });
          var items = os.reduce(function (n, o) { return n + o.items.length; }, 0);
          return chip(m, plural(os.length, 'order') + ', ' + plural(items, 'item'), S.filters.indexOf(m) > -1, 'data-act="method" data-method="' + m + '"');
        }).join('');
        q('[data-count="open"]').textContent = vis.length + ' of ' + plural(S.open.length, 'order');
        q('[data-list="open"]').innerHTML = vis.map(openCard).join('');
        var empty = q('[data-empty="open"]');
        empty.hidden = vis.length > 0;
        if (!vis.length) twoFrames(function () { empty.classList.add('is-in'); });
        q('[data-t="print"]').disabled = !vis.length;
      }
      function renderProgress() {
        q('[data-count="progress"]').textContent = S.progress.length + ' of ' + plural(S.progress.length, 'order');
        q('[data-pickers]').innerHTML = S.progress.length ? chip('All', '1 picklist', true, 'data-info="pickerchip"', true) + chip(S.picker[0], '11:40', false, 'data-info="pickerchip"', true) : '';
        q('[data-list="progress"]').innerHTML = S.progress.map(function (o) { return progressCard(o, S.hero && o.id === S.hero.id); }).join('');
        q('[data-empty="progress"]').hidden = S.progress.length > 0;
      }
      function renderCompleted() {
        q('[data-count="completed"]').textContent = S.completed.length + ' of ' + plural(S.completed.length, 'order');
        q('[data-carriers]').innerHTML = chip('All', '', true, 'data-info="shipfilter"', true) + chip('FedEx', '', false, 'data-info="shipfilter"', true) +
          ['Next Day', 'Two Day', 'FedEx Ground', 'Standard'].map(function (m) { return chip(m, '', false, 'data-info="shipfilter"'); }).join('');
        q('[data-list="completed"]').innerHTML = S.completed.map(completedCard).join('');
        q('[data-empty="completed"]').hidden = S.completed.length > 0;
      }
      function renderStaff() {
        q('[data-staff]').innerHTML = D.staff.map(function (p) {
          var on = S.picker.indexOf(p[0]) > -1;
          return '<button type="button" class="fapp-row" data-act="staff" data-name="' + esc(p[0]) + '"><span><span class="fapp-row__name">' + p[0] + '</span><span class="fapp-row__id">' + p[1] + '</span></span><span class="fapp-check' + (on ? ' is-on' : '') + '">' + I.checkmark + '</span></button>';
        }).join('');
        q('[data-selected]').innerHTML = S.picker.map(function (n) { return '<button type="button" class="fapp-pill fapp-pill--fill" data-act="staff" data-name="' + esc(n) + '" aria-label="Remove ' + esc(n) + '">' + n + ' ' + I['close-circle'] + '</button>'; }).join(' ');
        q('[data-t="save"]').disabled = !S.picker.length;
      }
      function papersPick() {
        var rows = [];
        S.batch.forEach(function (o) { o.items.forEach(function (it) { rows.push([o, it]); }); });
        q('[data-row="pick"]').innerHTML = '<div class="doc doc--pick" data-paper="pick"><p class="doc-store">Brooklyn</p><p class="doc-sub">Picklist · ' + S.picker.join(', ') + ' · 23 Oct 2026</p><table><thead><tr><th>Order #</th><th>Product</th><th>To Pick</th></tr></thead><tbody>' +
          rows.map(function (r, k) { return '<tr' + (k % 2 ? ' class="alt"' : '') + '><td>' + r[0].id + '</td><td><small>' + r[1][1] + '</small><b>' + r[1][0][1] + '</b><small>' + r[1][2] + '</small></td><td>1</td></tr>'; }).join('') + '</tbody></table><p class="doc-foot">' + plural(rows.length, 'item') + ' · ' + plural(S.batch.length, 'order') + '</p></div>';
      }
      function papersShip(o) {
        var label = '<div class="doc doc--label" data-paper="label"><div class="lbl-top"><div><p>FROM:</p><p>Brooklyn</p><p>440 Fulton St</p><p>Brooklyn NY 11201</p><p>US</p></div><div><p>SHIP DATE: 14OCT26</p><p>ACTWGT: ' + o.weight.toUpperCase() +
          '</p><p>DIMMED: 15 X 10 X 5 IN</p><p>BILL SENDER</p></div></div><div class="lbl-to"><span>TO</span><div><p class="lbl-big">' + o.name + '</p><p>' + o.addr[0] + '</p><p class="lbl-big">' + o.addr[1].replace(',', '') +
          '</p><p>REF: ' + o.id + '</p></div></div><div class="lbl-mid">' + code2d(o.trk) + '<div class="lbl-fx"><p class="lbl-fedex">FedEx</p><p>' + o.service + '</p><span class="lbl-g">' + o.letter + '</span></div></div><p class="lbl-trk"><small>TRK#</small> ' + o.trk + '</p>' + bars(o.trk) + '</div>';
        var slip = '<div class="doc doc--slip" data-paper="slip"><p class="doc-h">Packing Slip</p><table class="doc-kv"><tr><th>Shipment #</th><td>M1047' + o.id.slice(-2) + '</td></tr><tr><th>Status</th><td>Packed</td></tr><tr><th>Order #</th><td>' + o.id +
          '</td></tr></table><p class="doc-pkg">Package 1 of 1</p><div class="doc-two"><table><tr><th>Shipping Address</th></tr><tr><td>To: ' + o.name + '<br>' + o.addr[0] + '<br>' + o.addr[1] + ' USA</td></tr></table><table><tr><th>Shipment Method</th></tr><tr><td>FEDEX ' + o.carrier +
          '</td></tr></table></div><table class="doc-items"><tr><th></th><th>Name</th><th>Qty</th></tr>' + o.items.map(function (it) { return '<tr><td>' + it[3] + '</td><td><b>' + it[0][1] + '</b><br>' + it[4] + '</td><td>1</td></tr>'; }).join('') + '</table><table class="doc-wt"><tr><th>Weight</th><td>' + o.weight + '</td></tr></table></div>';
        q('[data-row="ship"]').innerHTML = label + slip;
      }
      function rng(seed) {
        var h = 0;
        for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        return function () { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
      }
      function bars(seed) {
        var r = rng(seed + 'b'), x = 0, out = '';
        while (x < 360) { var w = [1, 1, 2, 2, 3, 4][Math.floor(r() * 6)]; if (r() > 0.45) out += '<rect x="' + x + '" y="0" width="' + w + '" height="64"/>'; x += w; }
        return '<svg class="doc-bar" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
      }
      function code2d(seed) {
        var r = rng(seed + 'p'), out = '';
        for (var y = 0; y < 9; y++) for (var x = 0; x < 48; x++) if (r() > 0.5) out += '<rect x="' + x * 6 + '" y="' + y * 6 + '" width="6" height="6"/>';
        return '<svg class="doc-2d" viewBox="0 0 288 54" aria-hidden="true">' + out + '</svg>';
      }

      function targetEl(name) { return name === 'staff' ? q('[data-act="staff"][data-name="Casey Morgan"]') : q('[data-t="' + name + '"]'); }
      function target(name) {
        qa('.is-target').forEach(function (el) { el.classList.remove('is-target'); });
        S.target = name;
        if (name) {
          var el = targetEl(name);
          if (el) { el.classList.add('is-target'); if (G.keyboard && G.focusInApp()) el.focus({ preventScroll: true }); }
        }
        callout(name);
      }
      var inCallout = false;
      function callout(name) {
        var info = name && D.callouts[name], el = name && targetEl(name);
        var view = el && el.closest('[data-view]');
        if (view && view.hidden) { inCallout = true; G.show(view.dataset.view); inCallout = false; }
        if (!info || !el || !G.started) return G.hideCallout();
        G.showCallout(info, placeCallout);
      }
      function syncCallout(view) {
        if (inCallout || !S || !S.target) return;
        var c = G.calloutBox(), el = targetEl(S.target), tv = el && el.closest('[data-view]');
        if (!c || !tv) return;
        if (tv.dataset.view !== view) G.hideCallout();
        else if (c.hidden) twoFrames(function () { callout(S.target); });
      }
      function placeCallout() {
        var el = S && S.target && targetEl(S.target);
        if (!el) return;
        reveal(el);
        G.position(el, el, 24, true);
      }
      function followCallout() {
        var el = S && S.target && targetEl(S.target), c = G.calloutBox();
        if (!el || !c || c.hidden) return;
        G.position(el, el, 24, true);
        c.classList.toggle('is-in', c.classList.contains('is-docked') || visibleIn(el));
      }
      function nav(view) { qa('[data-nav]').forEach(function (n) { n.classList.toggle('is-active', n.dataset.nav === view); }); }
      function modal(name, on) { G.layer(q('[data-modal="' + name + '"]'), on, 420); }
      function papers(on, names) {
        q('[data-tray]').classList.toggle('is-on', on);
        (names || ['pick', 'label', 'slip']).forEach(function (n, k) {
          var p = q('[data-paper="' + n + '"]');
          if (!p) return;
          if (on) later(k * 260, function () { p.classList.remove('is-out'); p.classList.add('is-in'); });
          else { p.classList.remove('is-in'); p.classList.add('is-out'); }
        });
      }
      function visibleIn(el) {
        var c = el.closest('.fapp-content, .fapp-staff');
        if (!c) return true;
        var cr = c.getBoundingClientRect(), r = el.getBoundingClientRect();
        return r.bottom > cr.top + 4 && r.top < cr.bottom - 4;
      }
      function placePop() {
        var pop = q('[data-pop]'), el = S.popEl;
        if (!el || pop.hidden) return;
        var a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min(r.left - a.left, a.width - 208)) + 'px';
        var ph = pop.offsetHeight, top = r.bottom - a.top + 4;
        if (top + ph > a.height - 8) top = r.top - a.top - ph - 4;
        pop.style.top = Math.max(8, Math.min(top, a.height - ph - 8)) + 'px';
      }
      function reveal(el) {
        var c = el.closest('.fapp-content, .fapp-staff, .fapp-modal__panel');
        if (!c) return;
        var cr = c.getBoundingClientRect(), r = el.getBoundingClientRect();
        if (r.top < cr.top + 8) c.scrollTop -= (cr.top + 8 - r.top);
        else if (r.bottom > cr.bottom - 8) c.scrollTop += (r.bottom - cr.bottom + 8);
      }
      function nudge() { G.nudge(S.target && targetEl(S.target)); }
      function tip(el, text) {
        reveal(el);
        G.tip(el, text);
        nudge();
      }
      function closePop() {
        var p = q('[data-pop]');
        if (p.contains(document.activeElement)) app.focus({ preventScroll: true });
        p.classList.remove('is-in');
        setTimeout(function () { p.hidden = true; }, 250);
        S.popOrder = null;
      }
      var VIEW_OF = { print: 'open', staff: 'open', save: 'open', pack: 'progress', dlgpack: 'progress', ship: 'completed' };
      var VIEW_NAME = { open: 'Open', progress: 'In Progress', completed: 'Completed' };

      function startPick(batch) {
        S.batch = batch;
        target(null);
        S.lastPicker = S.picker.slice();
        S.picker = [];
        renderStaff();
        q('.fapp-staff').scrollTop = 0;
        modal('pickers', true);
        later(450, function () { target('staff'); });
      }
      function isOpen(name) { var m = q('[data-modal="' + name + '"]'); return !m.hidden && !m.classList.contains('is-out'); }
      function extraPick(el, batch) {
        if (!S.target && G.step < 4) return tip(el, 'One moment, the last step is still finishing.');
        S.extra = { resume: S.target };
        startPick(batch);
      }
      function cancelPick() { modal('pickers', false); S.picker = S.lastPicker || []; target(S.extra ? S.extra.resume : 'print'); S.extra = null; }
      function savePick(first) {
        var resume = S.extra && S.extra.resume;
        S.extra = null;
        target(null);
        modal('pickers', false);
        papersPick();
        later(300, function () { papers(true, ['pick']); });
        S.batch.forEach(function (o, n) {
          later(700 + n * 120, function () { var c = q('[data-list="open"] [data-order="' + o.id + '"]'); if (c) c.classList.add('is-gone'); });
        });
        later(1300, function () {
          S.open = S.open.filter(function (o) { return S.batch.indexOf(o) < 0; });
          S.filters = [];
          renderOpen();
          if (first) { S.progress = S.batch.slice(); S.hero = S.progress[0]; }
          else S.progress = S.progress.concat(S.batch);
          renderProgress();
        });
        later(2500, function () { papers(false, ['pick']); G.show('progress'); if (first) G.setStep(1); });
        later(3000, function () { target(first ? 'pack' : resume); });
      }
      var flow = {
        print: function () { startPick(visibleOpen()); },
        save: function () { savePick(!S.extra); },
        pack: function () { target(null); modal('pack', true); later(450, function () { target('dlgpack'); }); },
        dlgpack: function () {
          target(null);
          modal('pack', false);
          G.setStep(2);
          papersShip(S.hero);
          later(350, function () { papers(true, ['label', 'slip']); });
          later(1300, function () {
            var c = q('[data-list="progress"] [data-order="' + S.hero.id + '"]');
            if (c) c.classList.add('is-gone');
          });
          later(1850, function () {
            S.progress = S.progress.filter(function (o) { return o !== S.hero; });
            renderProgress();
            S.completed = [S.hero];
            renderCompleted();
          });
          later(3100, function () { papers(false, ['label', 'slip']); G.show('completed'); G.setStep(3); });
          later(3650, function () { target('ship'); });
        },
        ship: function () {
          target(null);
          var b = q('[data-t="ship"]');
          b.textContent = 'SHIPPED';
          b.classList.add('is-done');
          b.removeAttribute('data-t');
          var t = q('[data-toast]');
          t.hidden = false;
          twoFrames(function () { t.classList.add('is-in'); });
          if (doneText) doneText.textContent = doneCopy.replace('{name}', firstName(S.hero.name));
          later(900, function () { G.setStep(4); G.finish(); });
        }
      };

      app.addEventListener('click', function (e) {
        if (!G.started) return;
        var el = e.target.closest('button');
        if (!el || !app.contains(el)) {
          if (S.popOrder) { closePop(); return; }
          var m = e.target.closest('.fapp-modal');
          if (m && e.target === m) {
            if (m.dataset.modal === 'pickers' && isOpen('pickers')) cancelPick();
            else if (m.dataset.modal === 'pack' && isOpen('pack')) { modal('pack', false); target('pack'); }
            return;
          }
          if (e.target.closest('.fapp-main')) nudge();
          return;
        }
        if (el.disabled) return;
        G.press(el, e);
        if (S.popOrder && !el.closest('[data-pop]')) closePop();

        if (el.classList.contains('is-target') && flow[el.dataset.t]) return flow[el.dataset.t]();
        if (el.dataset.t === 'print' && G.step > 0 && !el.classList.contains('is-target')) return extraPick(el, visibleOpen());
        if (el.dataset.t && !el.classList.contains('is-target')) { if (S.target) tip(el, 'This is a later step. Follow the highlighted button first.'); return; }

        var act = el.dataset.act;
        if (act === 'method') {
          var meth = el.dataset.method, k = S.filters.indexOf(meth);
          if (k > -1) S.filters.splice(k, 1); else S.filters.push(meth);
          renderOpen();
          target(S.target);
          return;
        }
        if (act === 'opts') {
          reveal(el);
          var pop = q('[data-pop]');
          S.popOrder = el.dataset.order;
          pop.hidden = false;
          pop.classList.remove('is-in');
          S.popEl = el;
          placePop();
          twoFrames(function () { pop.classList.add('is-in'); });
          return;
        }
        if (act === 'closepickers') { cancelPick(); return; }
        if (act === 'cancelpack') { modal('pack', false); target('pack'); return; }
        if (act === 'pickone') { var o = byId(S.popOrder); closePop(); return G.step > 0 ? extraPick(el, [o]) : startPick([o]); }
        if (act === 'staff') {
          var n = el.dataset.name, j = S.picker.indexOf(n);
          if (j > -1) S.picker.splice(j, 1); else S.picker.push(n);
          renderStaff();
          target(S.picker.length ? 'save' : 'staff');
          return;
        }
        if (el.dataset.nav) {
          var v = el.dataset.nav;
          G.show(v);
          var need = VIEW_OF[S.target];
          if (need && need !== v) tip(el, 'You\'re looking at ' + VIEW_NAME[v] + '. The next step is in ' + VIEW_NAME[need] + '.');
          return;
        }
        if (el.dataset.info) {
          var text = D.info[el.dataset.info] || '';
          return tip(el, text.replace('{hero}', S.hero ? S.hero.name : 'the first'));
        }
      });
      document.addEventListener('click', function (e) { if (S && S.popOrder && !app.contains(e.target)) closePop(); });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !(app.contains(document.activeElement) || (G.keyboard && document.activeElement === document.body && S.target))) return;
        if (S.popOrder) return closePop();
        if (isOpen('pickers')) cancelPick();
        else if (isOpen('pack')) { modal('pack', false); target('pack'); }
      });
      app.addEventListener('scroll', function () {
        if (S.popOrder) { if (S.popEl && visibleIn(S.popEl)) placePop(); else closePop(); }
        if (G.tipEl) { if (visibleIn(G.tipEl)) G.placeTip(); else G.hideTip(); }
        followCallout();
      }, true);
      window.addEventListener('resize', function () { if (S.popOrder) placePop(); G.placeTip(); followCallout(); });

      G.onStart(function () { target(S.target); });
      var shell = app.innerHTML;
      function reset() {
        G.clearTimers();
        app.innerHTML = shell;
        G.tipEl = null;
        S = { open: D.orders.slice(), progress: [], completed: [], filters: [], picker: [], batch: [], hero: null, extra: null, target: null, popOrder: null };
        G.view = 'open';
        renderOpen();
        renderProgress();
        renderCompleted();
        nav('open');
        G.setStep(0);
        target('print');
      }
      G.onReplay(reset);
      reset();
    });
  }
  (window.hwClickDemos = window.hwClickDemos || []).push(init);
})();
