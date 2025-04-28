
$('.sandwich_switcher').click(function(){
  $(this).toggleClass('active');
  $('.custom-menu-primary').slideToggle(350); 
});

$('.custom-menu-primary .hs-menu-wrapper > ul li').each(function(){
  $(this).addClass($(this).children('a').text().split(" ").join('-').toLowerCase());  
})
$('.hs_header .header-searchicon .head-icon-bg').click(function(){
  $("body").addClass('search_open');
  setTimeout(function() {
    $('.hs_header .hs-search-field__input').focus(); 
  }, 100);
});
$('.hs_header .search_back_button').click(function(){
  $("body").removeClass('search_open')  
});


$('.contact-page-1').closest('.body-wrapper').addClass('contact-page-1-wrap');