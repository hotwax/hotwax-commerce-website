(function(){document.querySelectorAll('[data-rtm]').forEach(function(b){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){b.classList.add('is-on');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    var full=e.intersectionRatio>=.98||(e.rootBounds&&e.intersectionRect.height>=e.rootBounds.height-2);
    if(e.isIntersecting&&full){b.classList.add('is-on');io.disconnect();}
  });},{threshold:[0,.5,.75,.9,.95,.98,1]});
  io.observe(b);});})();
