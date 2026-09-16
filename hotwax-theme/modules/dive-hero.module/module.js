(() => {
  'use strict';
  /* Dive Hero — the endless zoom. Four levels nest inside each other, each K times smaller than the last:
     network → real-time sellable inventory → intelligent routing → store fulfillment → network. Every door is the
     content's own shape. All drawn code: no images, no video. Source of truth: homepage-proposal/first-fold/V2.10. */
  const init = (root) => {
  var c=root.querySelector('.dive-hero__canvas');if(!c)return;var ctx=c.getContext('2d');
  var animate=root.getAttribute('data-animate')!=='false';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||!animate;
  /* type from the theme: --font-family-special for figures and headings, --font-family-body for text; a monospace stack for the small caps */
  var CSV=getComputedStyle(root);var FD=(CSV.getPropertyValue('--font-family-special')||'').trim()||(CSV.getPropertyValue('--font-family-body')||'').trim()||'system-ui, sans-serif';var FB=(CSV.getPropertyValue('--font-family-body')||'').trim()||'system-ui, sans-serif';var FM='ui-monospace, SFMono-Regular, Menlo, monospace';
  var q=Object.fromEntries(new URLSearchParams(location.search));
  var W,H,dpr;
  var off=document.createElement('canvas'),offctx=off.getContext('2d'),msk=document.createElement('canvas'),mskctx=msk.getContext('2d'),CX=0,CY=0;
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=root.clientWidth;H=root.clientHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';off.width=msk.width=c.width;off.height=msk.height=c.height;mode()}
  size();addEventListener('resize',size);

  /* ── the dive, product edition ──
     Four scenes nest inside each other, each K times smaller than the last. Each is drawn in a unit space of
     half-size 1 with its target (the thing the camera enters next) at the origin:
       0 network      → the lit cell at the origin is one location
       1 inventory    → the ATP figure of the first row
       2 routing      → the rule that wins for this order
       3 fulfillment  → the Pack action; the packed order is the network again
     The camera pushes in at a constant exponential rate, so the loop never cuts. */
  var K=14, LOGK=Math.log(K), S0=150;
  var PH,PS,TF;function mode(){PH=W<821;PS=PH?Math.max(0.28,Math.min(1,W/1150)):Math.min(1,Math.max(0.6,W/1440));TF=PH?1.5:1}mode();   // phone: stacked layout, smaller scene, bigger small type, no fine print
  var RATE=parseFloat(q.rate)||0.3;                  // base levels per second; slowed to 0.4× while a level is readable (loop ≈ 18 s)
  var SQ3=Math.sqrt(3);
  function hash(a,b,l){var h=(a*374761393+b*668265263+l*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296}
  function hexPath(x,y,r){ctx.beginPath();for(var i=0;i<6;i++){var a=Math.PI/180*(60*i-30);var px=x+r*Math.cos(a),py=y+r*Math.sin(a);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
  var glow=document.createElement('canvas');glow.width=glow.height=256;(function(){var g=glow.getContext('2d');var gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,214,170,1)');gr.addColorStop(.25,'rgba(247,148,33,.55)');gr.addColorStop(1,'rgba(247,148,33,0)');g.fillStyle=gr;g.fillRect(0,0,256,256)})();
  function glowAt(x,y,s,a){ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.drawImage(glow,x-s/2,y-s/2,s,s);ctx.globalAlpha=1}

  /* product screens: real crops from the HotWax app designs */
  

  /* ── scene 0 · network. Cells radius 0.085; the origin cell is the location we enter. No names. ── */
  function drawNetwork(S,a,t,i){
    ctx.save();circleWindow(S);
    var r=0.085,w=SQ3*r,h=1.5*r;var lw=Math.max(0.6,Math.min(2.2,S*0.006));
    var reach=Math.min(4,(Math.hypot(W,H)/2)/S+0.3);
    var qmax=Math.ceil(reach/w)+1,rmax=Math.ceil(reach/h)+1;
    ctx.lineWidth=lw;
    for(var rw=-rmax;rw<=rmax;rw++){for(var qq=-qmax;qq<=qmax;qq++){
      var x=(qq+(rw&1?0.5:0))*w,y=rw*h;var d=Math.hypot(x,y);if(d>reach)continue;
      var fog=Math.max(0,1-d/reach);var hv=hash(qq,rw,7+i);if(d>0)fog*=ease(Math.max(0,Math.min(1,(S-80)/320)));   // other locations light after the centre one
      var isLoc=(hv<0.06&&d>2.2*w)||(qq===0&&rw===0);          // the cells around the one we enter stay dark, so it always reads as one location
      ctx.strokeStyle='rgba(245,244,240,'+(a*(0.06+0.11*fog)).toFixed(3)+')';hexPath(x*S,y*S,(r-0.006)*S);ctx.stroke();
      if(isLoc&&S*r>3){
        var p=(qq===0&&rw===0)?1:0.5+0.5*Math.sin(t*(0.5+hv*6)*2+hv*30);
        glowAt(x*S,y*S,r*S*3.2,a*(0.35+0.5*p)*fog);
        ctx.strokeStyle='rgba(247,148,33,'+(a*(0.5+0.5*p)*fog).toFixed(3)+')';ctx.lineWidth=lw*1.2;hexPath(x*S,y*S,(r-0.006)*S);ctx.stroke();ctx.lineWidth=lw;
        ctx.fillStyle='rgba(255,224,190,'+(a*p*fog).toFixed(3)+')';ctx.beginPath();ctx.arc(x*S,y*S,Math.max(1.2,r*S*0.08),0,7);ctx.fill();
      }
    }}
    /* orders gliding toward the origin location */
    var ao=ease(Math.max(0,Math.min(1,(S-120)/320)));
    for(var k=0;k<10;k++){var ph=((t*0.4+k*0.2)%1);var ang=k*1.256+i*0.7+k*0.37;var d0=1.6;var e=1-Math.pow(1-ph,2);var x=Math.cos(ang)*d0*(1-e),y=Math.sin(ang)*d0*(1-e);
      ctx.strokeStyle='rgba(247,148,33,'+(a*ao*0.18*(1-ph)).toFixed(3)+')';ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(Math.cos(ang)*d0*S,Math.sin(ang)*d0*S);ctx.lineTo(x*S,y*S);ctx.stroke();
      glowAt(x*S,y*S,Math.max(6,0.05*S),a*ao*0.9)}
    ctx.restore();
  }

  /* ── drawn levels. One grammar: a charcoal surface, a mono label, a display figure or a lit row, amber for
     the active thing, grey for the rest. Numbers count, lines draw, states pop. The door to the next level
     sits at the origin. u = how far the camera has pushed into this level (0 just arrived, 1 leaving). ── */
  var AMB='247,148,33', FG='245,244,240';
  function prog(S){return Math.max(0,Math.min(1,Math.log(S/S0)/LOGK))}
  function ease(x){return x<=0?0:x>=1?1:1-Math.pow(1-x,3)}
  function stepIn(u,at,len){return ease((u-at)/(len||0.08))}
  function surface(S,a,x,y,w,h){ctx.save();ctx.globalAlpha=a;if(S<650){ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=Math.min(60,0.14*S);ctx.shadowOffsetY=Math.min(14,0.03*S)}ctx.fillStyle='#222428';rr(x*S,y*S,w*S,h*S,Math.max(2,0.03*S));ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='rgba('+FG+',.12)';ctx.lineWidth=Math.max(0.6,0.004*S);ctx.stroke();ctx.restore()}
  function mono(S,k,al,col){ctx.font='400 '+(k*S)+'px '+FM;ctx.fillStyle='rgba('+(col||FG)+','+(PH?0:al).toFixed(3)+')'}
  function sub(S,a){if(PH)return false;body(S,0.036,a*0.5);return true}
  function body(S,k,al,col,w){if(k<0.055)k*=TF;ctx.font=(w||400)+' '+(k*S)+'px '+FB;ctx.fillStyle='rgba('+(col||FG)+','+al.toFixed(3)+')'}
  function disp(S,k,al,col){ctx.font='500 '+(k*S)+'px '+FD;ctx.fillStyle='rgba('+(col||FG)+','+al.toFixed(3)+')'}
  function door(S,a,r){var k=Math.max(0,Math.min(1,(S-260)/900));if(k<=0)return;ctx.save();ctx.globalAlpha=a*k;glowAt(0,0,r*S*3.4,0.35*k);ctx.strokeStyle='#F79421';ctx.lineWidth=Math.max(1,0.006*S);hexPath(0,0,r*S);ctx.stroke();ctx.fillStyle='rgba('+AMB+','+(0.07*k).toFixed(3)+')';ctx.fill();ctx.restore()}
  /* each level arrives through a window shaped like the door it came through: hex cell, the figure, the rule row, the Shipped circle */
  function wk(S){return ease(Math.max(0,Math.min(1,(S-150)/720)))}
  function hexWindow(S){var r=0.32+3.2*wk(S);hexPath(0,0,r*S);ctx.clip()}
  function figureWindow(S){var k=wk(S);var w=0.56+3.4*k,h=0.4+3.4*k;rr(-w/2*S,-h/2*S,w*S,h*S,Math.max(2,(0.06+0.1*k)*S));ctx.clip()}
  function bandWindow(S){var k=wk(S);var h=0.22+1.1*k;ctx.beginPath();ctx.rect(-40*S,(-0.6-0.05)*S*k+(-h/2)*S*(1-k),80*S,h*S*(1-k)+1.1*S*k);ctx.clip()}   // opens from a slit to the card's own height, centred on the card
  function circleWindow(S){var k=Math.max(0,Math.min(1,(S-60)/420));if(k>=1)return;var r=0.78+9*ease(k);ctx.beginPath();ctx.arc(0,0,r*S,0,7);ctx.clip()}   // 0.78 = the Shipped circle in network units
  function hline(S,a,x1,x2,y,al){ctx.strokeStyle='rgba('+FG+','+(a*al).toFixed(3)+')';ctx.lineWidth=Math.max(0.6,0.003*S);ctx.beginPath();ctx.moveTo(x1*S,y*S);ctx.lineTo(x2*S,y*S);ctx.stroke()}

  /* ── level 1 · correct inventory. The Online ATP calculation resolves to one figure; the figure is the door. ── */
  function drawInventory(S,a,t,i){
    var u=prog(S);var W_=1.55,H_=1.18;var x0=-1.12,y0=-0.68;ctx.save();hexWindow(S);if(wk(S)<1){ctx.fillStyle='#222428';ctx.globalAlpha=a;ctx.fillRect(-6*S,-6*S,12*S,12*S);ctx.globalAlpha=1}             // surface placed so the final figure sits at the origin
    surface(S,a,x0,y0,W_,H_);
    if(S<70){ctx.restore();return}
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
    mono(S,0.034,a*0.6);ctx.fillText('REAL-TIME SELLABLE INVENTORY',(x0+0.1)*S,(y0+0.12)*S);
    body(S,0.06,a*0.9,FG,500);ctx.fillText('Merino Scarf',(x0+0.1)*S,(y0+0.25)*S);
    if(sub(S,a))ctx.fillText('SKU 10044 · all locations',(x0+0.1)*S,(y0+0.32)*S);
    var rows=[['Quantity on hand','94',0.1],['Reserved for orders','−3',0.2],['Safety stock','−10',0.3],['Threshold','−5',0.4]];
    var ry=y0+0.48,rh=0.13,val=94,subs=[3,10,5];
    rows.forEach(function(r,k){var k2=stepIn(u,r[2],0.1);if(k2<=0)return;var y=ry+k*rh;
      body(S,0.042,a*0.7*k2);ctx.textAlign='left';ctx.fillText(r[0],(x0+0.1)*S,y*S);
      body(S,0.042,a*k2*(k?0.95:0.9),k?AMB:FG,500);ctx.textAlign='right';ctx.fillText(r[1],(x0+0.78)*S,y*S);
      hline(S,a*k2,x0+0.1,x0+0.78,y+0.04,0.1);
      if(k)val-=subs[k-1]*k2});
    var k3=stepIn(u,0.5,0.14),kw=wk(S);
    /* the figure. Centred in the small hex; as the card opens it slides so the bowl of the 6 sits on the zoom axis.
       The bowl is the door: a real hole in the number, lit from inside as the camera closes in. */
    ctx.textAlign='left';ctx.textBaseline='alphabetic';
    var f=0.34*S;ctx.font='500 '+f+'px '+FD;
    var txt=String(Math.round(val)),wAll=ctx.measureText(txt).width,w7=ctx.measureText(txt.charAt(0)).width,w6=wAll-w7;
    var bowlDx=-wAll/2+w7+w6*0.5, bowlDy=-0.24*f;                                   // bowl centre relative to (text left, baseline)
    var cxT=-wAll/2, cyT=(-0.02*kw+0.35*0.34)*S;                                    // centred placement (text left x, baseline y)
    var bxT=-(w7+w6*0.5), byT=-bowlDy;                                              // bowl-on-axis placement: text left sits so the 6's bowl is at 0,0
    var m=ease(kw);var tx=cxT+(bxT-cxT)*m, ty=cyT+(byT-cyT)*m;
    var kd=Math.max(0,Math.min(1,(S-260)/900));var rb=0.16*f;
    if(kd>0)glowAt(0,0,rb*4.2,a*kd*0.7);
    disp(S,0.34,a,kd>0?(Math.round(247+(245-247)*(1-kd))+','+Math.round(148+(244-148)*(1-kd))+','+Math.round(33+(240-33)*(1-kd))):FG);ctx.fillText(txt,tx,ty);
    if(kd>0){ctx.fillStyle='rgba('+AMB+','+(a*kd*0.22).toFixed(3)+')';ctx.beginPath();ctx.arc(0,0,rb,0,7);ctx.fill()}
    var lx=tx+wAll/2, ly=ty-0.35*0.34*S;                                            // labels follow the figure's centre
    ctx.textAlign='center';
    if(kw>0){mono(S,0.032,a*kw*(0.35+0.55*k3),k3>0.5?AMB:FG);ctx.fillText('ONLINE ATP',lx,ly+0.31*S);
    if(k3>0){mono(S,0.03,a*kw*0.7*k3,AMB);ctx.fillText('PUBLISHED TO EVERY CHANNEL',lx,ly+0.4*S)}}
    ctx.textBaseline='alphabetic';
    ctx.restore();
  }

  /* ── level 2 · smart routing. The waterfall: the order drops through rule 1 and rule 2 holds it. The lit rule is the door. ── */
  function drawRouting(S,a,t,i){
    /* arrives inside the bowl of the 6: a circular window the size of the bowl (0.76 units here), widening past the
       stroke of the digit into the full card. The bowl interior is already the card's charcoal, so it just looks like a hole. */
    var kw=wk(S);
    ctx.save();
    if(kw<1){var r=0.76+7*ease(kw);ctx.beginPath();ctx.arc(0,0,r*S,0,7);ctx.clip()}
    drawRoutingInner(S,a,t,i,kw);
    ctx.restore();
  }
  function drawRoutingInner(S,a,t,i,kw){
    var a0=a;
    var u=prog(S);var W_=1.7,H_=1.36;var x0=-0.85,y0=-0.78;ctx.save();   // rule 2 sits on the origin line
    var ke=ease(Math.max(0,(kw-0.15)/0.5));                                       // card edges appear once the window is past the digit
    ctx.fillStyle='#222428';ctx.globalAlpha=a*(1-ke);ctx.fillRect(-20*S,-20*S,40*S,40*S);ctx.globalAlpha=1;
    surface(S,a*ke,x0,y0,W_,H_);
    if(S<70){ctx.restore();return}
    var kc=ease(Math.max(0,(kw-0.1)/0.5));if(kc<=0){glowAt(0,0,1.1*S,a*0.45);ctx.fillStyle='rgba('+AMB+','+(a*0.9).toFixed(3)+')';ctx.beginPath();ctx.arc(0,0,Math.max(1.5,0.018*S),0,7);ctx.fill();ctx.restore();return}a=a*kc;   // content fades in after the edges
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
    mono(S,0.034,a*0.6);ctx.fillText('INTELLIGENT ROUTING',(x0+0.1)*S,(y0+0.12)*S);
    body(S,0.06,a*0.9,FG,500);ctx.fillText('Order NN10584 · Next day',(x0+0.1)*S,(y0+0.25)*S);
    if(sub(S,a))ctx.fillText('2 × Merino Scarf · rules run in order · keep the order together',(x0+0.1)*S,(y0+0.32)*S);
    var rules=[['Warehouse only','No stock · pass','-'],['Warehouse and stores','Allocated in full · 76 available · no split','+'],['Any location','Not needed','-']];
    var ys=[-0.34,0,0.34],rh=0.28;
    var hit=stepIn(u,0.3,0.12),landed=stepIn(u,0.5,0.12);
    rules.forEach(function(r,k){var y=ys[k];var lit=k===1&&landed>0;var seen=k===0?stepIn(u,0.08,0.1):k===1?stepIn(u,0.22,0.1):stepIn(u,0.36,0.1);if(seen<=0)return;
      if(lit){ctx.fillStyle='rgba('+AMB+','+(a*0.1*landed).toFixed(3)+')';ctx.fillRect(x0*S,(y-rh/2)*S,W_*S,rh*S)}
      mono(S,0.03,a*0.5*seen);ctx.textAlign='left';ctx.fillText('RULE '+(k+1),(x0+0.2)*S,(y-0.03)*S);
      body(S,0.05,a*seen*(lit?1:0.75),FG,500);ctx.fillText(r[0],(x0+0.2)*S,(y+0.05)*S);
      var st=k===0?hit:k===1?landed:0;                                             // status sits under the rule name, so it never runs off the right edge
      if(st>0){body(S,0.036,a*st*0.9,k===1?AMB:FG);ctx.textAlign='left';ctx.fillText(r[1],(x0+0.2)*S,(y+0.105)*S)}
      else if(k===2&&seen>0){body(S,0.036,a*seen*0.4);ctx.textAlign='left';ctx.fillText('Waiting',(x0+0.2)*S,(y+0.105)*S)}
      if(k<2)hline(S,a*seen,x0+0.06,x0+W_-0.06,y+rh/2,0.1)});
    /* the order. The amber light in the bowl of the 6 is the order itself: it travels from the bowl to rule 1,
       turns white as it lands, then drops to rule 2 when rule 1 passes. */
    var dy=ys[0]+(ys[1]-ys[0])*ease((u-0.32)/0.16);
    var m=ease(Math.max(0,Math.min(1,(kw-0.05)/0.6)));
    var px0=x0+0.12;var px=px0*m, py=dy*m;
    var gs=(1.1*(1-m)+0.09*m)*S, ga=a0*(0.45*(1-m)+0.9*m);
    glowAt(px*S,py*S,Math.max(8,gs),ga);
    var cr=Math.max(1.5,(0.018*(1-m)+0.011*m)*S);
    ctx.fillStyle='rgba('+Math.round(247+(255-247)*m)+','+Math.round(148+(255-148)*m)+','+Math.round(33+(255-33)*m)+','+a0.toFixed(2)+')';
    ctx.beginPath();ctx.arc(px*S,py*S,cr,0,7);ctx.fill();
    var kd=Math.max(0,Math.min(1,(S-260)/900));if(kd>0&&landed>0){var ad=kd*Math.max(a,0.45*fade(S))*landed;ctx.save();glowAt(0,0,1.6*S,0.3*ad);ctx.globalAlpha=ad;ctx.strokeStyle='#F79421';ctx.lineWidth=Math.max(1,0.005*S);ctx.beginPath();ctx.moveTo(x0*S,-rh/2*S);ctx.lineTo((x0+W_)*S,-rh/2*S);ctx.moveTo(x0*S,rh/2*S);ctx.lineTo((x0+W_)*S,rh/2*S);ctx.stroke();ctx.fillStyle='rgba('+AMB+','+(0.08*kd*landed).toFixed(3)+')';ctx.fillRect(x0*S,-rh/2*S,W_*S,rh*S);ctx.restore()}   // the lit rule runs edge to edge of the box
    ctx.restore();
  }

  /* ── level 3 · store fulfillment. Picked → Packed → Shipped tick on in turn. Shipped is the door. ── */
  function drawPack(S,a,t,i){
    var u=prog(S);var W_=1.95,H_=1.0;var x0=-1.35,y0=-0.6;ctx.save();bandWindow(S);    // Shipped sits at the origin; box has room around the circle (right edge 0.60)
    var kw=wk(S);
    if(kw<1){ /* the lit rule row thickens into the panel: no side edges, warm ground cooling to charcoal */
      /* the band starts as exactly what is behind it (the routing row at its current brightness) and cools to the card's charcoal */
      var Sp=S*K,ap=fade(Sp);if(Sp>700)ap*=Math.max(0.12,1-(Sp-700)/800);ap=Math.max(ap,0.45*fade(Sp))*0.6;
      var b0=[27+(74-27)*ap*0.9,28+(52-28)*ap*0.9,32+(32-32)*ap*0.9];var kc0=ease(Math.max(0,(kw-0.1)/0.4));
      var col='rgb('+Math.round(b0[0]+(34-b0[0])*kc0)+','+Math.round(b0[1]+(36-b0[1])*kc0)+','+Math.round(b0[2]+(40-b0[2])*kc0)+')';
      var kb=1-ease(Math.max(0,(kw-0.2)/0.5));ctx.globalAlpha=a*kb;ctx.fillStyle=col;ctx.fillRect(-40*S,-6*S,80*S,12*S);ctx.globalAlpha=1;   // hands over to the card smoothly
      /* one amber hairline runs through the slit and becomes the Picked → Packed → Shipped line */
      ctx.strokeStyle='rgba('+AMB+','+(a*0.9*(1-kw)).toFixed(3)+')';ctx.lineWidth=Math.max(1,0.006*S);ctx.beginPath();ctx.moveTo(-40*S,0);ctx.lineTo(40*S,0);ctx.stroke();
    }
    surface(S,a*ease(Math.max(0,(kw-0.2)/0.5)),x0,y0,W_,H_);   // the panel's edges come in early and slowly, overlapping the card being left
    if(S<70){ctx.restore();return}
    var ko=ease(Math.max(0,(kw-0.15)/0.5));if(ko<=0){ctx.restore();return}a=a*ko;             // content fades in once the slit has opened
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
    mono(S,0.034,a*0.6);ctx.fillText('STORE FULFILLMENT',(x0+0.1)*S,(y0+0.12)*S);
    body(S,0.06,a*0.9,FG,500);ctx.fillText('Order NN10584',(x0+0.1)*S,(y0+0.25)*S);
    if(sub(S,a))ctx.fillText('2 × Merino Scarf · one box · Next day',(x0+0.1)*S,(y0+0.32)*S);
    var steps=[['Picked',0.1],['Packed',0.34],['Shipped',0.58]];var xs=[-1.1,-0.55,0],y=0;
    /* the line draws itself between the states */
    var drawn=Math.max(0,Math.min(1,(u-0.1)/0.55));
    hline(S,a,xs[0],xs[2],y,0.12);
    if(drawn>0){ctx.strokeStyle='rgba('+AMB+','+(a*0.9).toFixed(3)+')';ctx.lineWidth=Math.max(1,0.006*S);ctx.beginPath();ctx.moveTo(xs[0]*S,y*S);ctx.lineTo((xs[0]+(xs[2]-xs[0])*drawn)*S,y*S);ctx.stroke()}
    steps.forEach(function(st,k){var on=stepIn(u,st[1],0.08);var r=0.055;
      ctx.beginPath();ctx.arc(xs[k]*S,y*S,r*S,0,7);ctx.fillStyle='#222428';ctx.fill();
      ctx.strokeStyle=on>0?'rgba('+AMB+','+(a*0.95).toFixed(3)+')':'rgba('+FG+','+(a*0.25).toFixed(3)+')';ctx.lineWidth=Math.max(1,0.006*S);ctx.stroke();
      if(on>0){var pop=1+0.25*Math.sin(Math.min(1,on)*Math.PI);ctx.fillStyle='rgba('+AMB+','+(a*on).toFixed(3)+')';ctx.beginPath();ctx.arc(xs[k]*S,y*S,r*0.5*pop*S,0,7);ctx.fill();if(k===2)glowAt(0,0,0.5*S,a*on*0.9)}
      ctx.textAlign='center';body(S,0.046,a*(on>0?0.95:0.45),FG,on>0?500:400);ctx.fillText(st[0],xs[k]*S,(y+0.16)*S)});
    var done=stepIn(u,0.7,0.12);
    if(done>0){ctx.textAlign='left';mono(S,0.03,a*0.8*done,AMB);ctx.fillText('PROMISE MET · NEXT DAY',(x0+0.1)*S,(y0+H_-0.1)*S)}
        var kd=Math.max(0,Math.min(1,(S-260)/900));if(kd>0){glowAt(0,0,1.05*S,0.45*a*kd)}
    ctx.restore();
  }

  var scenes=[drawNetwork,drawInventory,drawRouting,drawPack];
  var names=[['Network','every store and warehouse'],['Real-time sellable inventory','one number every channel can sell'],['Intelligent routing','rules run in order'],['Store fulfillment','picked · packed · shipped']];

  var depthEl=root.querySelector('.dive-hero__depth'),lastName=-1;
  var mx=0,my=0,tx=0,ty=0;root.addEventListener('pointermove',function(e){var b=root.getBoundingClientRect();tx=((e.clientX-b.left)/W-.5)*2;ty=((e.clientY-b.top)/H-.5)*2},{passive:true});
  var t0=performance.now(),paused=false,raf,hiddenAt=0,Lacc=parseFloat(q.L)||parseFloat(q.start)||0.5,lastNow=t0,frozen=('L' in q);   // ?start= begins the live loop at a depth; ?L= freezes it
  function fade(S){var a=1;if(S<5)a=0;else if(S<40)a=(S-5)/35;if(S>1500)a*=Math.max(0,1-(S-1500)/2000);return a}

  function frame(now){
    if(paused)return;
    if(root.clientWidth!==W||root.clientHeight!==H)size();                                   // phones change viewport after load (address bar, emulation); re-measure per frame
    var t=(now-t0)/1000;var dt=Math.min(0.05,(now-lastNow)/1000);lastNow=now;var f=Lacc-Math.floor(Lacc);var mult=0.6+0.5*Math.min(1,Math.abs(f-0.5)/0.35);if(!frozen)Lacc+=dt*RATE*mult;
    mx+=(tx-mx)*.02;my+=(ty-my)*.02;
    var L=Lacc,cx,cy;
    CX=cx=(PH?W*.58:W*.74)+Math.sin(t*.09)*W*.015+mx*14,CY=cy=(PH?H*.74:H*.5)+Math.cos(t*.06)*H*.015+my*10;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.8);bg.addColorStop(0,'#26272C');bg.addColorStop(.6,'#1C1D21');bg.addColorStop(1,'#141517');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var iMin=Math.floor(L-1.2),iMax=Math.ceil(L+2.2),cur=-1;
    for(var i=iMin;i<=iMax;i++){
      var S=S0*Math.exp((L-i)*LOGK);var type=((i%4)+4)%4;var a=fade(S);if(type){if(S<140)a*=Math.max(0,(S-40)/100);if(S>700)a*=Math.max(0.12,1-(S-700)/900)}if(a<=0.01)continue;
      if(S>=S0*0.9&&S<S0*K*0.9)cur=i;
      ctx.save();ctx.translate(cx,cy);ctx.scale(PS,PS);scenes[type](S,a,t,i);ctx.restore();
    }
    if(depthEl&&cur!==lastName&&cur>-1){lastName=cur;var nm=names[((cur%4)+4)%4];depthEl.innerHTML='<b>'+nm[0]+'</b>'+nm[1]}
    var vg=ctx.createRadialGradient(cx,cy,Math.min(W,H)*.3,cx,cy,Math.max(W,H)*.78);vg.addColorStop(0,'rgba(20,21,23,0)');vg.addColorStop(1,'rgba(20,21,23,.6)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    if(true&&PH){var st=ctx.createLinearGradient(0,H*.42,0,H*.58);st.addColorStop(0,'rgba(27,28,32,1)');st.addColorStop(1,'rgba(27,28,32,0)');ctx.fillStyle=st;ctx.fillRect(0,0,W,H*.58)}
    if(true&&!PH){var sc=ctx.createLinearGradient(0,0,W*.56,0);sc.addColorStop(0,'rgba(27,28,32,.9)');sc.addColorStop(.7,'rgba(27,28,32,.5)');sc.addColorStop(1,'rgba(27,28,32,0)');ctx.fillStyle=sc;ctx.fillRect(0,0,W,H);
      var sb=ctx.createLinearGradient(0,H*.45,0,H);sb.addColorStop(0,'rgba(27,28,32,0)');sb.addColorStop(1,'rgba(27,28,32,.7)');ctx.fillStyle=sb;ctx.fillRect(0,0,W,H)}
    raf=requestAnimationFrame(frame);
  }
  function start(){if(reduce&&!('L' in q)){Lacc=0.5;frame(performance.now());paused=true}else raf=requestAnimationFrame(frame)}
  var ready=false;function go(){if(ready)return;ready=true;start()}
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('500 20px '+FD),document.fonts.load('400 14px '+FB)]).then(go,go);setTimeout(go,1800)}else go();
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){var on=es[0].isIntersecting;if(reduce)return;if(!on&&!paused){paused=true;hiddenAt=performance.now();cancelAnimationFrame(raf)}else if(on&&paused){paused=false;t0+=performance.now()-hiddenAt;lastNow=performance.now();raf=requestAnimationFrame(frame)}},{threshold:0.05}).observe(root)}
  document.addEventListener('visibilitychange',function(){if(reduce)return;if(document.hidden){paused=true;hiddenAt=performance.now();cancelAnimationFrame(raf)}else{paused=false;t0+=performance.now()-hiddenAt;lastNow=performance.now();raf=requestAnimationFrame(frame)}});
  };
  const start = () => document.querySelectorAll('.dive-hero').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
