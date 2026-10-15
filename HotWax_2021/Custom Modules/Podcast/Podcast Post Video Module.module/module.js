document.addEventListener('DOMContentLoaded', function () {
  var transcript = document.querySelector('.pod-video-transcipt');
  var showMore = document.getElementById('loadMore');
  var showLess = document.getElementById('showLess');
  if (!transcript || !showMore || !showLess) return;

  function setVisible(el, visible) {
    el.style.display = visible ? '' : 'none';
  }

  function collapse() {
    transcript.querySelectorAll('p').forEach(function (p) {
      setVisible(p, p.matches(':nth-child(1), :nth-child(2)'));
    });
    setVisible(showLess, false);
    setVisible(showMore, true);
  }

  showMore.addEventListener('click', function () {
    transcript.querySelectorAll('p').forEach(function (p) {
      setVisible(p, true);
    });
    setVisible(showLess, true);
    setVisible(showMore, false);
  });

  showLess.addEventListener('click', collapse);

  collapse();
});
