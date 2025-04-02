// Check if the user's browser is Safari
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Add a class to the HTML element if the browser is Safari
if (isSafari()) {
  document.documentElement.classList.add('safari');
}

// Example usage
if (document.documentElement.classList.contains('safari')) {
  console.log("This is Safari browser.");
} else {
  console.log("This is not Safari browser.");
}