  function labnolIframe(div) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://www.youtube.com/embed/' + div.dataset.id + '?autoplay=1&rel=0');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '1');
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
    div.parentNode.replaceChild(iframe, div);
  }

  function initYouTubeVideos() {
    var thumbs = document.querySelectorAll('.youtube-player > div[data-id]');
    for (var n = 0; n < thumbs.length; n++) {
      thumbs[n].onclick = function () {
        labnolIframe(this);
      };
    }
  }

  document.addEventListener('DOMContentLoaded', initYouTubeVideos);




(function () {
  function initSectionHighlight() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.product-info-inner a[href^="#"]'))
      .map(function (link) {
        return { link: link, section: document.getElementById(link.getAttribute('href').slice(1)) };
      })
      .filter(function (item) {
        return item.section;
      });
    if (!items.length) return;

    var pending = false;

    function update() {
      pending = false;
      var current = null;
      items.forEach(function (item) {
        var top = item.section.getBoundingClientRect().top;
        if (top <= 150 && (!current || top > current.top)) {
          current = { link: item.link, top: top };
        }
      });
      items.forEach(function (item) {
        item.link.classList.toggle('active', !!current && item.link === current.link);
      });
    }

    window.addEventListener('scroll', function () {
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionHighlight);
  } else {
    initSectionHighlight();
  }
})();
