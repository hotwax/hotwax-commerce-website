(function () {
  if (window.hwSettled) return;
  window.hwSettled = new Promise(function (resolve) {
    function go() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { setTimeout(resolve, 120); });
      });
    }
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  });
})();
