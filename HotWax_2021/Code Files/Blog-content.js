
  document.addEventListener("DOMContentLoaded", function () {
    const blogContent = document.querySelector(".blog-post-text");
    if (blogContent) {
      const links = blogContent.querySelectorAll("a");
      links.forEach(link => {
        const href = link.getAttribute("href");
        if (
          href != "https://www.hotwax.co/connect" &&
          !link.hasAttribute("target")
        ) {
          link.setAttribute("target", "_blank");
        }
      });
    }
  });

