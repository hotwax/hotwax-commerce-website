$(document).ready(function(){
		    $("#player").click(function(){


		    	$(".feed-item--video").fadeOut(4000).css("display", "none");

		    	
		        $(".video-player-main .iframe").fadeIn(2000).css("display", "block");

				return false;
				

			   
		        
		    });
		});

// $(document).ready(function(){
//    $('.video-link').hide();
//    $('.video-wrapper').click(function(){     
//      $(this).parents('.ppc-video-group').addClass('active_video-parent').siblings().removeClass('active_video-parent');       
//       var tenpr = $(this).find('.video-link iframe').attr('data-src')+'?rel=0&enablejsapi=1&playsinline=1&autoplay=1';
//       $(this).find('.video-link iframe').attr('src',tenpr);
//       $(this).find('.video-link').fadeIn();
//    });
// });

