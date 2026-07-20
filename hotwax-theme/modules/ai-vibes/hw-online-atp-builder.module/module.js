(function () {
  const modules = document.querySelectorAll("[data-hw-atp-builder]");

  modules.forEach((moduleElement) => {
    const stock = Number(moduleElement.dataset.stock) || 0;
    const rows = Array.from(moduleElement.querySelectorAll("[data-hw-atp-row]"));

    if (!rows.length) {
      return;
    }

    const runningLabel = moduleElement.querySelector("[data-hw-atp-running-label]");
    const runningValue = moduleElement.querySelector("[data-hw-atp-running-value]");
    const resultValue = moduleElement.querySelector("[data-hw-atp-result-value]");
    const mobileRunningLabel = moduleElement.querySelector("[data-hw-atp-mobile-running-label]");
    const mobileRunningValue = moduleElement.querySelector("[data-hw-atp-mobile-running-value]");
    const mobileResultValue = moduleElement.querySelector("[data-hw-atp-mobile-result-value]");
    const chip = moduleElement.querySelector("[data-hw-atp-chip]");
    const title = moduleElement.querySelector("[data-hw-atp-title]");
    const copy = moduleElement.querySelector("[data-hw-atp-copy]");

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
      const resultAmount = stock - runningAmount;

      rows.forEach((row, index) => {
        const isActive = index === activeIndex;
        row.classList.toggle("is-active", isActive);
        row.classList.toggle("is-applied", index <= activeIndex);
        row.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      setText(runningLabel, activeRow.dataset.runningLabel || "");
      setText(runningValue, runningAmount);
      setText(resultValue, resultAmount);
      setText(mobileRunningLabel, activeRow.dataset.runningLabel || "");
      setText(mobileRunningValue, runningAmount);
      setText(mobileResultValue, resultAmount);
      setText(chip, activeRow.dataset.chip || "");
      setText(title, activeRow.dataset.title || "");
      setText(copy, activeRow.dataset.copy || "");
    };

    rows.forEach((row, index) => {
      row.addEventListener("click", () => activateRow(index));
    });

    activateRow(0);
  });
})();
