const tableWrapper = document.querySelector(".pricing_wrap .items");
const switchInputs = document.querySelectorAll(".pricing_wrap .switch-wrapper input");
const prices = tableWrapper.querySelectorAll(".pricing_wrap .items .item");
const toggleClass = "hide";

for (const switchInput of switchInputs) {
	switchInput.addEventListener("input", function () {
		for (const price of prices) {
			if(price.classList.contains(toggleClass)) {
				price.classList.remove(toggleClass);
			} else {
				price.classList.add(toggleClass);
			}
		}
		const activePrices = tableWrapper.querySelectorAll(
			`.price.${switchInput.id}`
		);
		for (const activePrice of activePrices) {
			activePrice.classList.remove(toggleClass);
		}
	});
}

// tooltip
var tooltips = document.querySelectorAll(".pric-tooltip");

if (tooltips) {
  tooltips.forEach(function(tooltip){
    initPopperTooltip(tooltip.querySelector(".tooltip-icon-price"), tooltip.querySelectorAll(".tooltip-popup-price"), {
      placement: "top",
      modifiers: [{
        name: "offset",
        options: {
          offset: [0, 10]
        }
      }, {
        name: "flip",
        options: {
          fallbackPlacements: ["bottom", "right", "left"]
        }
      }]
    })
  });
}