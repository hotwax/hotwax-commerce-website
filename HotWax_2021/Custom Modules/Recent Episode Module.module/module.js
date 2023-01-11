$(document).ready(function(){
$(function() {
    $('.carousel').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
        mobileFirst: true,
        arrows: true,
        dots: false,
        nextArrow: '<div class="slick-custom-arrow slick-custom-arrow-right"><i class="fas fa-arrow-right"></i></div>',
        prevArrow: '<div class="slick-custom-arrow slick-custom-arrow-left"><i class="fas fa-arrow-left"></i></div>',
        responsive: [
            {
                breakpoint: 769,
                settings: 'unslick'
            }
        ]
    });

    $(window).on('resize', function() {
        $('.carousel').slick('resize');
    });
});

});