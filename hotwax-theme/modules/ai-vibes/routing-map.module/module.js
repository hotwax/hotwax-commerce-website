(function(){document.querySelectorAll('[data-rtm]').forEach(function(b){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){b.classList.add('is-on');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){b.classList.add('is-on');io.disconnect();}});},{threshold:.4});
  io.observe(b);});})();
