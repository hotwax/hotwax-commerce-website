(function () {
  "use strict";

  const modules = document.querySelectorAll("[data-interactive-card]");

  modules.forEach((moduleElement) => {
    const stock = Number(moduleElement.dataset.stock) || 0;
    const rows = Array.from(moduleElement.querySelectorAll("[data-interactive-card-row]"));

    if (!rows.length) {
      return;
    }

    const runningLabel = moduleElement.querySelector("[data-interactive-card-running-label]");
    const runningValue = moduleElement.querySelector("[data-interactive-card-running-value]");
    const resultValue = moduleElement.querySelector("[data-interactive-card-result-value]");
    const mobileRunningLabel = moduleElement.querySelector("[data-interactive-card-mobile-running-label]");
    const mobileRunningValue = moduleElement.querySelector("[data-interactive-card-mobile-running-value]");
    const mobileResultValue = moduleElement.querySelector("[data-interactive-card-mobile-result-value]");
    const details = Array.from(moduleElement.querySelectorAll("[data-interactive-card-detail]"));

    const getAmount = (row) => Math.abs(Number(row.dataset.amount) || 0);
    const getRunningAmount = (index) => rows.slice(0, index + 1).reduce((sum, row) => sum + getAmount(row), 0);

    const setText = (target, value) => {
      if (target) {
        target.textContent = value;
      }
    };

    const activateRow = (activeIndex) => {
      const activeRow = rows[activeIndex];
      const runningAmount = getRunningAmount(activeIndex);
      const resultAmount = Math.max(0, stock - runningAmount);

      rows.forEach((row, index) => {
        const isActive = index === activeIndex;
        const isApplied = index <= activeIndex;

        row.classList.toggle("is-active", isActive);
        row.classList.toggle("is-applied", index < activeIndex);
        row.setAttribute("aria-pressed", isApplied ? "true" : "false");
      });

      details.forEach((detail, index) => {
        const isActive = index === activeIndex;

        detail.classList.toggle("is-active", isActive);
        detail.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      setText(runningLabel, activeRow.dataset.runningLabel || "");
      setText(runningValue, runningAmount);
      setText(resultValue, resultAmount);
      setText(mobileRunningLabel, activeRow.dataset.runningLabel || "");
      setText(mobileRunningValue, runningAmount);
      setText(mobileResultValue, resultAmount);
    };

    rows.forEach((row, index) => {
      row.addEventListener("click", () => activateRow(index));
    });

    activateRow(0);
  });
})();
