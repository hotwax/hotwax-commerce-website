(function() {  
  var HIDE_FOCUS_STYLES_CLASS = 'disable-focus-styles';
  var SHOW_FOCUS_STYLES_CLASS = 'enable-focus-styles';

  var scrollPosition =  window.pageYOffset || document.documentElement.scrollTop;
  var scrollDirection; 

  var header = document.querySelector('header.header');
  
  var headerHeight;
  var transparentHeader = header.classList.contains('header--transparent') == true ? true : false;
  
  var nav = document.querySelector('.header__navigation');
  var langSwitcher = document.querySelector('.header__language-switcher');
  var search = document.querySelector('.header__search');
  var searchInput = document.querySelector('.hs-search-field__input');

  var navToggle = document.querySelector('.header__navigation--toggle');
  var langToggle = document.querySelector('.header__language-switcher--toggle');
  var searchToggle = document.querySelector('.header__search--toggle');
  var searchClose = document.querySelector('.header__search--close');
  var bodyContainer = document.querySelector('.body-container-wrapper');

  var isHeaderFixed = header.dataset.position == 'fixed' ? true : false;

  function domReady(callback) {
    if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function positionElements() {    
    nav ? nav.style.top = `${headerHeight}px` : '';
    searchInput ? searchInput.style.height = `${headerHeight}px` : '';
    langSwitcher ? langSwitcher.style.top = `${headerHeight}px` : '';

    // Header height is adjustable in the CMS editor so
    // push body content down equal to header height  
    if(!transparentHeader) {
      bodyContainer.style.marginTop = `${headerHeight}px`;
    }

  }

  function showFocusOutline() {
    document.body.classList.add(SHOW_FOCUS_STYLES_CLASS);
    document.body.classList.remove(HIDE_FOCUS_STYLES_CLASS);
  }

  function hideFocusOutline() {
    document.body.classList.add(HIDE_FOCUS_STYLES_CLASS);
    document.body.classList.remove(SHOW_FOCUS_STYLES_CLASS);
  }

  function closeAll() {    
    document.querySelectorAll('.header__navigation, .header__language-switcher, .header__search').forEach(function( item ) {
      item.classList.remove('open');
    })
    document.body.classList.remove('no-scroll');
  }

  function toggleNav() {
    if(nav.classList.contains('open')) {
      closeAll();
      return;
    }
    closeAll();
    document.body.classList.add('no-scroll');
    nav.classList.toggle('open');
    nav.style.height = `calc(100vh - ${headerHeight}px )`;
  }

  function toggleLang() {
    if(langSwitcher.classList.contains('open')) {
      closeAll();
      return;
    }
    closeAll();
    langSwitcher.classList.toggle('open');
  }

  function toggleSearch() {
    if(search.classList.contains('open')) {
      closeAll();
      return;
    }
    closeAll();
    search.classList.toggle('open');
  }

  // Show the focus outline when keyboard activity occurs
  document.body.addEventListener('keydown', showFocusOutline);
  // Hide the focus outline when mouse activity occurs
  document.body.addEventListener('mousemove', hideFocusOutline);
  document.body.addEventListener('mousedown', hideFocusOutline);
  document.body.addEventListener('mouseup', hideFocusOutline);    

  // Toggles
  navToggle ? navToggle.addEventListener('click', toggleNav) : '' ;
  searchToggle ? searchToggle.addEventListener('click', toggleSearch) : '';
  searchClose ? searchClose.addEventListener('click', toggleSearch) : '';
  langToggle ? langToggle.addEventListener('click', toggleLang) : '';
  

      
  // HEADER STICKY 
  isHeaderFixed ? window.addEventListener('scroll', headerSticky): '';
  function headerSticky() {
    // get current scroll position
    let scroll =  window.pageYOffset || document.documentElement.scrollTop;

    // if scrolling down
    if(scroll > scrollPosition && scroll > headerHeight ) {
      header.classList.add('header--sticky');
    } 

    if(scroll <= headerHeight) {
      header.classList.remove('header--sticky');
    }
  }

  //Fixes when changing from mobile to desktop *
  window.addEventListener('resize', function() {
    if(window.innerWidth >= 992) {
      document.body.classList.remove('no-scroll');
      nav ? nav.classList.remove('open') : '';
      nav ? nav.style.height = 'unset' : '';
    }
    headerHeight = header.offsetHeight;
    positionElements();
  });

  document.addEventListener('DOMContentLoaded', function() {
    // get header height once dom and window are fully loaded
    headerHeight = header.offsetHeight;
    positionElements();
  });
  
  document.querySelector('.header__cta') ? document.querySelector('.header__cta').classList.remove('hidden') : '';

  // HEADER REVEAL

  if(header.dataset.scrollupReveal && !header.classList.contains('header--fixed')) {
    window.addEventListener('scroll', function() {
      // get current scroll position
      var scroll = window.pageYOffset || document.documentElement.scrollTop;
      // if top reached
      if(scroll == 0) {
        if(transparentHeader) {
          header.classList.add('header--transparent');
        }
        header.style.top = '0';
        header.style.position = 'absolute';
      }

      // if scrolling down 
      if(scroll > scrollPosition && scroll > headerHeight) {
        if (scrollDirection != 'down' || typeof scrollDirection === 'undefined') {
          scrollDirection = 'down';
          header.style.top = -headerHeight;
          header.style.position = 'absolute';
          if(transparentHeader) {
            header.classList.add('header--transparent');
          }
        }
      }

      // if scrolling up
      if(scroll < scrollPosition) {
        if (scrollDirection != 'up' || typeof scrollDirection === 'undefined') {
          scrollDirection = 'up';
          header.classList.remove('header--transparent');
          header.style.position = 'fixed';
          header.style.top = -headerHeight;
        }
      }

      scrollPosition = scroll;
    });
  }
  
  // Add smooth scrolling to menu links
  document.querySelectorAll('.button, a.menu-link, .footer__menu a').forEach(function(item) {
    item.addEventListener('click', function(event) {
      // Make sure this.hash has a value before overriding default behavior
      if (item.hash) {        
        let hash = item.hash;
        let sectionNum = hash.replace('#section-', '');
        let elm = document.querySelectorAll('.dnd-section')[sectionNum - 1];
        if(elm){
          
          var urlPage = item.href.split('?')[0]
          var urlOrigin = window.location.origin + window.location.pathname
          if( urlPage == urlOrigin) {   
            event.preventDefault();
            let offsetY = isHeaderFixed || header.dataset.scrollupReveal ? -header.offsetHeight : 0 ;
            let scrollToPos = elm.getBoundingClientRect().top + window.pageYOffset + offsetY;
            window.scrollTo({top: scrollToPos, behavior: 'smooth'});  
          }              
        }        
      }
    });
  });
  
  let hash = window.location.hash;
  if (hash) { 
    let sectionNum = hash.replace('#section-', '');
    let elm = document.querySelectorAll('.dnd-section')[sectionNum - 1];
    let offsetY = isHeaderFixed || header.dataset.scrollupReveal ? -header.offsetHeight : 0 ;
    let scrollToPos = elm.getBoundingClientRect().top + window.pageYOffset + offsetY;
    window.scrollTo({top: scrollToPos, behavior: 'smooth'});
  }
  
})();