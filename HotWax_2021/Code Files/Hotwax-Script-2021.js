$(function () {
    $(".desktop-post-wrappper .pod-post-item").slice(0, 10).show();
    $("body").on('click touchstart', '.load-more', function (e) {
      e.preventDefault();
      $(".desktop-post-wrappper .pod-post-item:hidden").slice(0, 10).slideDown();
      if ($(".desktop-post-wrappper .pod-post-item:hidden").length == 0) {
        //$(".load-more").css('visibility', 'hidden');
        $(".load-more").text("No Content").addClass("noContent").css('visibility', 'visible');
      }
    });     
  });   


$(document).ready(function(){
$(function() {
    $('.blogcarousel').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
        mobileFirst: true,
        arrows: true,
        dots: false,
        nextArrow: '<div class="slick-custom-arrow slick-custom-arrow-right"><i class="fas fa-arrow-right"></i></div>',
        prevArrow: '<div class="slick-custom-arrow slick-custom-arrow-left"><i class="fas fa-arrow-left"></i></div>',
        responsive: [
            {
                breakpoint: 813,
                settings: 'unslick'
            }
        ]
    });

    $(window).on('resize', function() {
        $('.blogcarousel').slick('resize');
    });
});

});


$(document).ready(function(){
$(function() {
    $('.blogcarousel').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
        mobileFirst: true,
        arrows: true,
        dots: false,
        nextArrow: '<div class="slick-custom-arrow slick-custom-arrow-right"><i class="fas fa-arrow-right"></i></div>',
        prevArrow: '<div class="slick-custom-arrow slick-custom-arrow-left"><i class="fas fa-arrow-left"></i></div>',
        responsive: [
            {
                breakpoint: 767,
                settings: 'unslick'
            }
        ]
    });

    $(window).on('resize', function() {
        $('.blogcarousel').slick('resize');
    });
});

});