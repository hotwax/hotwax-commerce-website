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
    var scrollEnabled = tabModule.getAttribute("data-tabs-scroll") === "true";
    var activeIndex = 0;
    var scrollFrame = null;
    var requestedIndex = null;
    var requestSettleTimer = null;
    var isNearViewport = true;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!tabs.length || tabs.length !== panels.length) {
      return;
    }

    function isInlineEditor() {
      return Boolean(
        document.querySelector(".hs-inline-edit") ||
          tabModule.closest(".hs-inline-edit")
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

      panels.forEach(function (panel, panelIndex) {
        var isActive = panelIndex === index;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
        panel.toggleAttribute("inert", !isActive);
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

    function clearScrollVisuals() {
      panels.forEach(function (panel) {
        panel.classList.remove("is-scroll-visible");
        panel.style.removeProperty("--tabs-panel-offset");
        panel.style.removeProperty("z-index");
      });
    }

    function renderScrollProgress(progress) {
      var position = progress * (tabs.length - 1);
      var nearestIndex = Math.round(position);

      if (Math.abs(position - nearestIndex) < 0.01) {
        position = nearestIndex;
      }

      var currentIndex = Math.min(Math.floor(position), tabs.length - 1);
      var nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
      var localProgress = position - currentIndex;
      var easedProgress =
        localProgress * localProgress * (3 - 2 * localProgress);
      var travel = panels[0].parentElement.offsetHeight;

      panels.forEach(function (panel, panelIndex) {
        var offset = travel;
        var isVisible = false;

        if (panelIndex === currentIndex) {
          offset = 0;
          isVisible = true;
        }

        if (
          panelIndex === nextIndex &&
          (currentIndex === nextIndex || localProgress > 0.001)
        ) {
          offset = currentIndex === nextIndex ? 0 : (1 - easedProgress) * travel;
          isVisible = true;
        }

        panel.classList.toggle("is-scroll-visible", isVisible);

        if (isVisible) {
          panel.style.setProperty(
            "--tabs-panel-offset",
            offset.toFixed(2) + "px"
          );
          panel.style.zIndex = String(panelIndex + 2);
        } else {
          panel.style.removeProperty("--tabs-panel-offset");
          panel.style.removeProperty("z-index");
        }
      });

      return Math.round(position);
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

    function finishRequestedScroll() {
      var targetTop;

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
      requestSettleTimer = null;
      requestScrollUpdate();
    }

    function scheduleRequestedScrollSettle() {
      window.clearTimeout(requestSettleTimer);
      requestSettleTimer = window.setTimeout(finishRequestedScroll, 120);
    }

    function scrollToItem(index) {
      updateStickyOffset();

      if (
        !scrollEnabled ||
        isInlineEditor() ||
        !responsive ||
        responsive.clientWidth <= 700 ||
        !sticky
      ) {
        clearScrollVisuals();
        return false;
      }

      requestedIndex = index;

      window.scrollTo({
        top: getScrollTarget(index),
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });

      scheduleRequestedScrollSettle();
      return true;
    }

    function updateFromScroll() {
      scrollFrame = null;
      updateStickyOffset();

      if (
        !scrollEnabled ||
        isInlineEditor() ||
        !responsive ||
        responsive.clientWidth <= 700 ||
        !sticky
      ) {
        clearScrollVisuals();
        return;
      }

      var tabModuleRect = tabModule.getBoundingClientRect();
      var stickyTop = parseFloat(window.getComputedStyle(sticky).top) || 0;
      var animationDistance = getAnimationDistance();

      if (animationDistance <= 0) {
        return;
      }

      var progress = Math.min(
        1,
        Math.max(0, (stickyTop - tabModuleRect.top) / animationDistance)
      );
      var nextIndex = reduceMotion.matches
        ? Math.round(progress * (tabs.length - 1))
        : renderScrollProgress(progress);

      if (reduceMotion.matches) {
        clearScrollVisuals();
      }

      if (nextIndex !== activeIndex) {
        activateItem(nextIndex, false);
      }
    }

    function requestScrollUpdate() {
      updateSelectorOverflow();

      if (isNearViewport && scrollFrame === null) {
        scrollFrame = window.requestAnimationFrame(updateFromScroll);
      }
    }

    function handleScroll() {
      if (requestedIndex !== null) {
        scheduleRequestedScrollSettle();
      }

      requestScrollUpdate();
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

    if (selectorList) {
      selectorList.addEventListener("scroll", updateSelectorOverflow, {
        passive: true,
      });
    }

    if (scrollEnabled && sticky) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", requestScrollUpdate);

      if ("IntersectionObserver" in window) {
        var visibilityObserver = new IntersectionObserver(
          function (entries) {
            isNearViewport = entries[0].isIntersecting;

            if (isNearViewport) {
              requestScrollUpdate();
            }
          },
          { rootMargin: "200px 0px" }
        );

        visibilityObserver.observe(tabModule);
      }

      if ("ResizeObserver" in window && responsive) {
        var resizeObserver = new ResizeObserver(requestScrollUpdate);
        resizeObserver.observe(responsive);
      }

      requestScrollUpdate();
    }
  });
})();
