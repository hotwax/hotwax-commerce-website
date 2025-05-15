var menuLinks = document.querySelectorAll('.submenu > li .menu-link');
var firstSubmenuItems = document.querySelectorAll(
  '.submenu.level-2 > *:nth-child(2)'
);
var menuArrows = document.querySelectorAll('.submenu.level-1 > .has-submenu > .menu-arrow');
var submenuToggles = document.querySelectorAll('.submenu .submenu-toggle');

/** Closing other dropdowns when clicking in one */
menuArrows.forEach(function(arrow) {
  arrow.addEventListener('click', function(e) {
    let label = e.target.parentElement;
    let checkbox = label.previousElementSibling;

    submenuToggles.forEach(element => {
      if(element !== checkbox) {
        element.checked = false;
      }
    });
  })
});
/** END Closing other dropdowns when clicking in one */

menuLinks.forEach(function(link) {
  link.addEventListener('focus', function() {
    link.parentElement.classList.add('focus');
  });

  if (link.nextElementSibling) {
    var subLinks = document.querySelectorAll('.level-2 li > .menu-link');
    var lastLinkIndex = subLinks.length - 1;
    var lastLink = subLinks[lastLinkIndex];
    lastLink.addEventListener('blur', function() {
      link.parentElement.classList.remove('focus');
    });
  }
});

firstSubmenuItems.forEach(function(item) {
  if (window.hsInEditor) {
    return;
  } else if (item) {
    item.addEventListener('mouseover', function() {
      item.previousElementSibling.classList.add('hover');
    });

    item.addEventListener('mouseout', function() {
      item.previousElementSibling.classList.remove('hover');
    });
  }
});
