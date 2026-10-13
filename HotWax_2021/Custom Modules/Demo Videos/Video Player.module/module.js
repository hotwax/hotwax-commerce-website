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




$(window).scroll(function() {
		var scrollDistance = $(window).scrollTop();
var scrollDistance2  = scrollDistance+150;
		$('.page-section').each(function(i) {
			var var333 = $(this).position().top - 150 ;
			console.log(var333,scrollDistance);
				if ((var333) <= scrollDistance) {
						$('.product-info-inner a.active').removeClass('active');
						$('.product-info-inner a').eq(i).addClass('active');
				}
		});
}).scroll();