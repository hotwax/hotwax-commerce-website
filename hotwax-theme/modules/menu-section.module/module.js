// Select all menu links, submenu items, arrows, and toggles to add event listeners.
var menuLinks = document.querySelectorAll('.submenu > li .menu-link');
var firstSubmenuItems = document.querySelectorAll(
  '.submenu.level-2 > *:nth-child(2)'
);
var menuArrows = document.querySelectorAll('.submenu.level-1 > .has-submenu > .menu-arrow');
var submenuToggles = document.querySelectorAll('.submenu .submenu-toggle');

/** 
 * Closes any open submenus when a new one is opened.
 * This ensures that only one dropdown is visible at a time on mobile.
 */
menuArrows.forEach(function(arrow) {
  arrow.addEventListener('click', function(e) {
    // Find the checkbox associated with the clicked arrow.
    let label = e.target.parentElement;
    let checkbox = label.previousElementSibling;

    // Loop through all submenu toggles (checkboxes).
    submenuToggles.forEach(element => {
      // If the current toggle is not the one that was just clicked, uncheck it.
      if(element !== checkbox) {
        element.checked = false;
      }
    });
  })
});
/** END Closing other dropdowns when clicking in one */

/**
 * Adds a 'focus' class to the parent list item when a menu link is focused.
 * This is used to control the visibility of submenus for keyboard navigation.
 */
menuLinks.forEach(function(link) {
  link.addEventListener('focus', function() {
    link.parentElement.classList.add('focus');
  });

  // If the link has a submenu that follows it...
  if (link.nextElementSibling) {
    // ...find the last link in that submenu.
    var subLinks = document.querySelectorAll('.level-2 li > .menu-link');
    var lastLinkIndex = subLinks.length - 1;
    var lastLink = subLinks[lastLinkIndex];
    
    // When the last link in the submenu loses focus (e.g., user tabs away),
    // remove the 'focus' class from the parent list item to hide the submenu.
    lastLink.addEventListener('blur', function() {
      link.parentElement.classList.remove('focus');
    });
  }
});

/**
 * Adds a 'hover' class to the decorative triangle element when hovering over the first item in a submenu.
 * This is a visual enhancement for the desktop dropdown menu.
 */
firstSubmenuItems.forEach(function(item) {
  // Do not run this script if in the HubSpot visual editor.
  if (window.hsInEditor) {
    return;
  } else if (item) {
    // When the mouse enters the first submenu item, add 'hover' to the triangle.
    item.addEventListener('mouseover', function() {
      item.previousElementSibling.classList.add('hover');
    });

    // When the mouse leaves the first submenu item, remove 'hover' from the triangle.
    item.addEventListener('mouseout', function() {
      item.previousElementSibling.classList.remove('hover');
    });
  }
})