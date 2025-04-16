$(document).ready(function() {
  $('#filterOptions li a').click(function(e) {
    e.preventDefault();
  $('#filterOptions li a').removeClass("active");
    var listVal = $(this).attr('class');
    console.log(listVal);
    $(this).addClass("active");

    $('.item').each(function() {
      var divVal = $(this).attr('data-attr');
      if(listVal == divVal) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });

    if($(this).hasClass('all')) {
      $('.item').show();
    }
  });



  $('#filterOptions li a').click(function() {
    $(".category-card-sub").addClass("newzerodddd");
    $(".category-card-sub").removeClass("newzero");
    $(".category-card-sub").removeClass("newnot");
    $(".category-card-outer-wrap").each(function () {
      var imgheights = $(this).height();
      console.log(imgheights);
      if (imgheights === 0) {
        $(this).parent().addClass('newzero');
        console.log(imgheights);
      } else {
        $(this).parent().addClass('newnot');
        console.log(imgheights);
      }

    });

  });



});




$(document).ready( function() {   




  $('<li id="more">More <i class="fas fa-chevron-down"></i><div class="more-item"></li>').insertAfter('ul.filter-button-inner li:nth-child(5)');

  $( "li .more-item" ).append( $( "ul.filter-button-inner li:nth-child(n+7)" ) );

});


