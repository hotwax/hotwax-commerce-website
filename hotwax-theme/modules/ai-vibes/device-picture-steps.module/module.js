(function () {
  document.querySelectorAll('[data-dps-try]').forEach(function (w) {
    var units = +w.dataset.units, safety = +w.dataset.safety, start = +w.dataset.start, pre, sold, received;
    var q = function (s) { return w.querySelector(s); };
    var buy = q('[data-dps-buy]'), date = q('[data-dps-date]'), recv = q('[data-dps-receive]'), reset = q('[data-dps-reset]'), status = q('[data-dps-status]');
    if (!buy || !(units > 0)) return;
    function render() {
      var left = units - safety - pre - sold;
      q('[data-dps-pre]').textContent = pre;
      q('[data-dps-left]').textContent = Math.max(left, 0);
      q('[data-dps-leftlabel]').textContent = received ? 'Left for regular orders' : 'Left to pre-order';
      q('[data-dps-barpre]').style.width = (pre / units * 100) + '%';
      if (received) { buy.textContent = left > 0 ? 'Add to cart' : 'Out of stock'; buy.disabled = left <= 0; date.hidden = true; }
      else if (left <= 0) { buy.textContent = 'Out of stock'; buy.disabled = true; date.hidden = true; }
      else { buy.textContent = 'Pre-order'; buy.disabled = false; date.hidden = false; }
      recv.disabled = received; reset.hidden = !(received || pre !== start || sold);
    }
    function init() { pre = start; sold = 0; received = false; render(); status.textContent = 'Press Pre-order to place a pre-order.'; }
    buy.addEventListener('click', function () {
      if (received) {
        if (units - safety - pre - sold <= 0) return;
        sold++; render();
        status.textContent = (units - safety - pre - sold <= 0) ? 'Added to cart. That was the last unit, so the button now reads Out of stock.' : 'Added to cart. The stock is in, so it ships as a regular order.';
        return;
      }
      if (units - safety - pre <= 0) return;
      pre++; render();
      status.textContent = (units - safety - pre <= 0) ? 'That was the last unit open to pre-order. The button now reads Out of stock, so shoppers never pre-order more than is coming.' : 'Pre-order placed. It waits until the stock arrives.';
    });
    recv.addEventListener('click', function () {
      received = true; render(); var left = units - safety - pre - sold;
      status.textContent = 'Stock received. The OMS releases all ' + pre + ' pre-orders first' + (left > 0 ? ', and the button now reads Add to cart for the ' + left + (left === 1 ? ' unit' : ' units') + ' left.' : '. The safety stock stays held back, so the button stays Out of stock.');
    });
    reset.addEventListener('click', init);
    init();
  });
})();
