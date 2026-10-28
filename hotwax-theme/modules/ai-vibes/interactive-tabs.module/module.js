(function () {
  "use strict";

  var tabModules = document.querySelectorAll("[data-interactive-tabs]");

  tabModules.forEach(function (tabModule) {
    var tabs = Array.from(tabModule.querySelectorAll("[data-tabs-tab]"));
    var panels = Array.from(tabModule.querySelectorAll("[data-tabs-panel]"));
    var responsive = tabModule.querySelector(".interactive-tabs__responsive");
    var selectorWrap = tabModule.querySelector("[data-tabs-selector-wrap]");
    var selectorList = tabModule.querySelector("[data-tabs-selector-list]");
    var sticky = tabModule.querySelector(".interactive-tabs__sticky");
    var scrollSpacer = tabModule.querySelector(
      ".interactive-tabs__scroll-spacer"
    );
    var marks = Array.from(tabModule.querySelectorAll("[data-tabs-mark]"));
    var scrollEnabled = tabModule.getAttribute("data-tabs-scroll") === "true";
    var activeIndex = 0;
    var requestedIndex = null;
    var requestSettleTimer = null;
    var markObserver = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var stackedWidth = 900;

    if (!tabs.length || tabs.length !== panels.length) {
      return;
    }

    function isInlineEditor() {
      return Boolean(
        document.querySelector(".hs-inline-edit") ||
          tabModule.closest(".hs-inline-edit")
      );
    }

    function isStacked() {
      return Boolean(
        responsive &&
          responsive.getBoundingClientRect().width <= stackedWidth
      );
    }

    function updateStickyOffset() {
      var fixedHeader = document.querySelector(
        "header.header, header.header--fixed, .header--fixed"
      );
      var headerBottom = 0;

      if (fixedHeader) {
        var headerStyle = window.getComputedStyle(fixedHeader);

        if (
          headerStyle.position === "fixed" ||
          headerStyle.position === "sticky"
        ) {
          headerBottom = Math.max(
            0,
            fixedHeader.getBoundingClientRect().bottom
          );
        }
      }

      tabModule.style.setProperty(
        "--tabs-sticky-top",
        Math.ceil(headerBottom + 16) + "px"
      );
    }

    function activateItem(index, moveFocus) {
      if (index < 0 || index >= tabs.length) {
        return;
      }

      activeIndex = index;

      tabs.forEach(function (tab, tabIndex) {
        var isActive = tabIndex === index;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      var stacked = isStacked();

      panels.forEach(function (panel, panelIndex) {
        var isActive = panelIndex === index;
        var isHidden = !isActive && !stacked;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(isHidden));
        panel.toggleAttribute("inert", isHidden);
      });

      if (moveFocus) {
        tabs[index].focus();
      }
    }

    function keepTabInView(index) {
      var tab = tabs[index];

      if (!tab || !selectorList) {
        return;
      }

      var tabCenter = tab.offsetLeft + tab.offsetWidth / 2;
      var targetLeft = Math.max(0, tabCenter - selectorList.clientWidth / 2);

      selectorList.scrollTo({
        left: targetLeft,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    }

    function updateSelectorOverflow() {
      if (!selectorWrap || !selectorList) {
        return;
      }

      var maxScrollLeft = Math.max(
        0,
        selectorList.scrollWidth - selectorList.clientWidth
      );
      var scrollLeft = selectorList.scrollLeft;
      var threshold = 2;

      selectorWrap.classList.toggle(
        "has-overflow-start",
        scrollLeft > threshold
      );
      selectorWrap.classList.toggle(
        "has-overflow-end",
        scrollLeft < maxScrollLeft - threshold
      );
    }

    function getAnimationDistance() {
      if (scrollSpacer) {
        return Math.max(
          0,
          parseFloat(window.getComputedStyle(scrollSpacer).height) || 0
        );
      }

      return Math.max(0, tabModule.offsetHeight - sticky.offsetHeight);
    }

    function getScrollTarget(index) {
      var tabModuleRect = tabModule.getBoundingClientRect();
      var animationDistance = getAnimationDistance();
      var stickyTop = parseFloat(window.getComputedStyle(sticky).top) || 0;
      var tabModuleTop = window.scrollY + tabModuleRect.top;
      var progress = tabs.length > 1 ? index / (tabs.length - 1) : 0;

      return tabModuleTop - stickyTop + animationDistance * progress;
    }

    function onRequestScroll() {
      window.clearTimeout(requestSettleTimer);
      requestSettleTimer = window.setTimeout(finishRequestedScroll, 120);
    }

    function clearRequest() {
      window.removeEventListener("scroll", onRequestScroll);
      window.clearTimeout(requestSettleTimer);
      requestSettleTimer = null;
    }

    function finishRequestedScroll() {
      var targetTop;

      clearRequest();

      if (requestedIndex === null) {
        return;
      }

      targetTop = getScrollTarget(requestedIndex);

      if (Math.abs(window.scrollY - targetTop) > 1) {
        window.scrollTo({
          top: targetTop,
          behavior: "auto",
        });
      }

      requestedIndex = null;
      syncFromScroll();
    }

    function scrollToItem(index) {
      updateStickyOffset();

      if (
        !scrollEnabled ||
        isInlineEditor() ||
        !responsive ||
        isStacked() ||
        !sticky
      ) {
        return false;
      }

      clearRequest();

      var targetTop = getScrollTarget(index);

      if (Math.abs(window.scrollY - targetTop) <= 1) {
        requestedIndex = null;
        syncFromScroll();
        return true;
      }

      requestedIndex = index;
      window.addEventListener("scroll", onRequestScroll, { passive: true });
      requestSettleTimer = window.setTimeout(finishRequestedScroll, 600);

      window.scrollTo({
        top: targetTop,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
      return true;
    }

    function syncFromScroll() {
      if (
        !scrollEnabled ||
        isInlineEditor() ||
        !responsive ||
        isStacked() ||
        !sticky
      ) {
        return;
      }

      var stickyTop = parseFloat(window.getComputedStyle(sticky).top) || 0;
      var animationDistance = getAnimationDistance();

      if (animationDistance <= 0) {
        return;
      }

      var progress = Math.min(
        1,
        Math.max(0, (stickyTop - tabModule.getBoundingClientRect().top) / animationDistance)
      );
      var nextIndex = Math.round(progress * (tabs.length - 1));

      if (nextIndex !== activeIndex) {
        activateItem(nextIndex, false);
      }
    }

    function watchMarks() {
      if (markObserver) {
        markObserver.disconnect();
      }

      if (!("IntersectionObserver" in window) || !marks.length) {
        return;
      }

      var line = Math.round(parseFloat(window.getComputedStyle(sticky).top) || 0);

      markObserver = new IntersectionObserver(syncFromScroll, {
        rootMargin: -line + "px 0px 0px 0px",
      });
      marks.forEach(function (mark) {
        markObserver.observe(mark);
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateItem(index, false);
        keepTabInView(index);
        scrollToItem(index);
      });

      tab.addEventListener("keydown", function (event) {
        var nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();

        activateItem(nextIndex, true);
        keepTabInView(nextIndex);
        scrollToItem(nextIndex);
      });
    });

    var initialIndex = tabs.findIndex(function (tab) {
      return tab.getAttribute("aria-selected") === "true";
    });

    activateItem(initialIndex >= 0 ? initialIndex : 0, false);
    updateSelectorOverflow();

    if ("ResizeObserver" in window && responsive) {
      var wasStacked = isStacked();
      var stackObserver = new ResizeObserver(function () {
        if (isStacked() !== wasStacked) {
          wasStacked = isStacked();
          activateItem(activeIndex, false);
        }
      });
      stackObserver.observe(responsive);
    }

    if (selectorList) {
      selectorList.addEventListener("scroll", updateSelectorOverflow, {
        passive: true,
      });
    }

    if (scrollEnabled && sticky) {
      updateStickyOffset();
      watchMarks();
      syncFromScroll();
      window.addEventListener("resize", function () {
        updateStickyOffset();
        updateSelectorOverflow();
        watchMarks();
        syncFromScroll();
      });
    }
  });
})();
