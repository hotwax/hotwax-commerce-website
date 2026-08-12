(function () {
  "use strict";

  var timelines = document.querySelectorAll("[data-interactive-timeline]");
  var timelineStates = [];
  var progressFrame = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getDotCenter(dot) {
    var rect = dot.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  function measureTimeline(state) {
    var activationPoint = window.innerHeight * 0.55;
    var listRect = state.list.getBoundingClientRect();
    var dotCenters = state.dots.map(getDotCenter);
    var firstCenter = dotCenters[0];
    var lastCenter = dotCenters[dotCenters.length - 1];
    var railHeight = Math.max(lastCenter - firstCenter, 0);
    var progressHeight = clamp(activationPoint - firstCenter, 0, railHeight);
    var activeIndex = dotCenters.reduce(function (reachedIndex, center, index) {
      return center <= activationPoint + 1 ? index : reachedIndex;
    }, 0);

    return {
      activeIndex: activeIndex,
      progressHeight: progressHeight,
      railHeight: railHeight,
      railTop: firstCenter - listRect.top,
      state: state
    };
  }

  function renderTimeline(measurement) {
    var state = measurement.state;

    state.list.style.setProperty("--timeline-rail-top", measurement.railTop + "px");
    state.list.style.setProperty("--timeline-rail-height", measurement.railHeight + "px");
    state.list.style.setProperty("--timeline-progress-height", measurement.progressHeight + "px");
    state.activateItem(state.items[measurement.activeIndex]);
  }

  function updateAllTimelines() {
    timelineStates.map(measureTimeline).forEach(renderTimeline);
    progressFrame = null;
  }

  function requestProgressUpdate() {
    if (progressFrame !== null) {
      return;
    }

    progressFrame = window.requestAnimationFrame(updateAllTimelines);
  }

  timelines.forEach(function (timeline) {
    var items = Array.prototype.slice.call(
      timeline.querySelectorAll("[data-interactive-timeline-item]")
    );

    if (!items.length) {
      return;
    }

    function activateItem(activeItem) {
      var activeIndex = items.indexOf(activeItem);

      items.forEach(function (item, index) {
        var isActive = item === activeItem;
        var isPassed = index < activeIndex;
        var trigger = item.querySelector("[data-interactive-timeline-step]");

        item.classList.toggle("is-active", isActive);
        item.classList.toggle("is-passed", isPassed);

        if (trigger) {
          trigger.setAttribute("aria-pressed", isActive ? "true" : "false");
        }
      });
    }

    var list = timeline.querySelector(".interactive-timeline__list");
    var dots = items.map(function (item) {
      return item.querySelector(".interactive-timeline__dot");
    }).filter(Boolean);

    if (!list || dots.length !== items.length) {
      return;
    }

    var state = {
      activateItem: activateItem,
      dots: dots,
      items: items,
      list: list,
      resizeObserver: null
    };

    timelineStates.push(state);

    items.forEach(function (item) {
      var trigger = item.querySelector("[data-interactive-timeline-step]");

      if (!trigger) {
        return;
      }

      trigger.addEventListener("click", function () {
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var dot = item.querySelector(".interactive-timeline__dot");
        var dotRect = dot.getBoundingClientRect();
        var targetTop = window.scrollY + dotRect.top + dotRect.height / 2 - window.innerHeight * 0.55;

        window.scrollTo({
          behavior: reduceMotion ? "auto" : "smooth",
          top: Math.max(targetTop, 0)
        });
        requestProgressUpdate();
      });
    });

    if ("ResizeObserver" in window) {
      state.resizeObserver = new ResizeObserver(requestProgressUpdate);
      state.resizeObserver.observe(timeline);
    }
  });

  if (timelineStates.length) {
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
    requestProgressUpdate();
  }
})();
