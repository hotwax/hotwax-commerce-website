document.addEventListener( 'DOMContentLoaded', function () {
   new Splide('.case-slider', {
      type: 'slide',
      perPage: 3,
      autoplay: false,
      interval: 8000,
      flickMaxPages: 3,
      arrows: false,
      speed: 1000,
      updateOnMove: true,
      pagination: true,
      breakpoints: {
         991: {
            perPage: 2
         },
         767: {
            perPage: 1
         }
      }
   }).mount();
});
