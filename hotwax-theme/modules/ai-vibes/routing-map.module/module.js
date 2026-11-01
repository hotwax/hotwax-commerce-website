(function(){document.querySelectorAll('[data-rtm]').forEach(function(b){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){b.classList.add('is-on');return;}
  for(var t=[],i=0;i<=50;i++)t.push(i/50);
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    var v=e.rootBounds?e.rootBounds.height:innerHeight;
    if(e.isIntersecting&&e.intersectionRect.height>=Math.min(e.boundingClientRect.height,v)*.98){b.classList.add('is-on');io.disconnect();}
  });},{threshold:t});
  io.observe(b);});})();
