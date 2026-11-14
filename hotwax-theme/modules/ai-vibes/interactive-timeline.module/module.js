(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-interactive-timeline]").forEach(function (timeline) {
    var items = Array.prototype.slice.call(timeline.querySelectorAll("[data-interactive-timeline-item]"));
    var marks = items.map(function (item) {
      return item.querySelector(".interactive-timeline__mark");
    });
    var below = marks.map(function () {
      return true;
    });

    if (!("IntersectionObserver" in window) || marks.some(function (mark) { return !mark || !mark.offsetParent; })) {
      return;
    }

    function update(entries) {
      var current = 0;

      entries.forEach(function (entry) {
        below[marks.indexOf(entry.target)] = entry.isIntersecting;
      });
      below.forEach(function (isBelow, index) {
        if (!isBelow) {
          current = index;
        }
      });
      items.forEach(function (item, index) {
        item.classList.toggle("is-lit", index === current);
      });
    }

    var observer = new IntersectionObserver(update, { rootMargin: "-55% 0px 100000% 0px" });

    marks.forEach(function (mark) {
      observer.observe(mark);
    });
  });

  document.querySelectorAll("[data-interactive-timeline-step]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var dot = trigger.querySelector(".interactive-timeline__dot");

      if (dot) {
        dot.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      }
    });
  });
})();
