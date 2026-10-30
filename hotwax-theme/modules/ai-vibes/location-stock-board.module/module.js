(function(){document.querySelectorAll('[data-lsb]').forEach(function(b){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){b.classList.add('is-on');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){b.classList.add('is-on');io.disconnect();}});},{threshold:.35});
  io.observe(b);});})();
