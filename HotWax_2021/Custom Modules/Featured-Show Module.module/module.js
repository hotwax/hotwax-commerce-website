$(function () {
    $(".feature-show-post").slice(0, 3).show();
    $("body").on('click touchstart', '.load-more', function (e) {
      e.preventDefault();
      $(".feature-show-post:hidden").slice(0, 3).slideDown();
      if ($(".feature-show-post:hidden").length == 0) {
        //$(".load-more").css('visibility', 'hidden');
        $(".load-more").text("No Content").addClass("noContent").css('visibility', 'visible');
      }
    });     
  });   
