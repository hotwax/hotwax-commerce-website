document.addEventListener("DOMContentLoaded", function () {
  const mainItems = document.querySelectorAll(".main-item h2");

  mainItems.forEach((item) => {
    item.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.classList.toggle("open");
    });
  });
});
