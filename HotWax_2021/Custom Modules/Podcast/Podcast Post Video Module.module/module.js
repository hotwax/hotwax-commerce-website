$(document).ready(function () {
  $(".pod-video-transcipt p").hide();
  $('#showLess').hide();
  $(".pod-video-transcipt p:nth-child(1)").show()
  $(".pod-video-transcipt p:nth-child(2)").show()
    $('#loadMore').click(function () {
      $(".pod-video-transcipt p").slideDown(200);
      $('#showLess').show();
      $('#loadMore').hide();
    
    });
    $('#showLess').click(function () {
      $(".pod-video-transcipt p").slideUp(200);
      $(".pod-video-transcipt p:nth-child(1)").slideDown();
      $(".pod-video-transcipt p:nth-child(2)").slideDown();
      $('#showLess').hide();
      $('#loadMore').show();
    });
});