$(window).on('load resize', function(){
  $('.vc-hoverbox-inner').each(function(){
    $(this).css('min-height',$(this).children('.vc-hoverbox-back').children('.vc-hoverbox-back-inner').outerHeight())
  })
});
