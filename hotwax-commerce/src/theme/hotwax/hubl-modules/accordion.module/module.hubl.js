function accordion(el) {
  var dropDown = $(el).closest("li").find(".accordion-content");

  $(el)
    .closest(".accordion")
    .find(".accordion-content")
    .not(dropDown)
    .slideUp();

  if ($(el).parent().hasClass("active")) {
    $(el).parent().removeClass("active");
  } else {
    $(el).closest(".accordion").find("li.active").removeClass("active");
    $(el).parent().addClass("active");
  }

  dropDown.stop(false, true).slideToggle();
}

function openAccordion() {
  var idHash = window.location.hash.split("#")[1];
  if (idHash) {
    var dataId = $('[data-id="' + idHash + '"]');
    console.log(dataId);
    dataId.click();

    dataId[0].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

$(function () {
  openAccordion();
});

$(".accordion a.accordion-title").on("click", function (e) {
  e.preventDefault();
  accordion(this);
});

