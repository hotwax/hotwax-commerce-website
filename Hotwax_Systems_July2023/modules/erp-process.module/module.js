function prospect_canvas_figure() { 
  var len = $('[class^="figure_container"]').length;
  for (i = 0; i < len; i++) {
    var container = $('body').find('[class^="figure_container"]').eq(i),
        imgsource = container.children('img').attr('src'),
        figure = container.children('canvas')[0],
        prefix_2x = /@2x/g;
    if ($(container.children('img')).length == 0) continue;
    if (prefix_2x.test(imgsource)){
      imgsource = imgsource.replace(/@2x/g,"");
    }
    var fig = figure.getContext('2d');
    var img = new Image();
    img.src = imgsource;
    if (container.hasClass('medium')) {
      var num = 1.9;
    } else if (container.hasClass('mini2')) {
      var num = 6.65;
    } else if (container.hasClass('mini')) {
      var num = 4.8;
    } else if (container.hasClass('small')) {
      var num = 3.2;
    } else if (container.hasClass('big')) {
      var num = 1.375;
    } else if (container.hasClass('giant')) {
      var num = 1.04;
    } else if (container.hasClass('thumbnail')) {
      var num = 2.75;
    }
    fig.drawImage(img, 0, 0);
    fig.save();
    fig.globalCompositeOperation = 'destination-in';
    fig.beginPath();
    if (container.hasClass('hexagon')) {
      fig.moveTo(190 / num, 0 / num);
      fig.lineTo(380 / num, 100 / num);
      fig.lineTo(380 / num, 325 / num);
      fig.lineTo(190 / num, 425 / num);
      fig.lineTo(5 / num, 325 / num);
      fig.lineTo(5 / num, 100 / num);
      fig.lineTo(190 / num, 0 / num);
    }
    if (container.hasClass('pentagon')) {
      fig.moveTo(60 / num , 90 / num );
      fig.arcTo(195 / num, -10 / num , 335 / num , 80 / num , 50 / num );
      fig.arcTo(385 / num , 125 / num , 368 / num , 248 / num , 50 / num );
      fig.arcTo(315 / num , 353 / num , 255 / num , 355 / num , 50 / num );
      fig.arcTo(80 / num , 353 / num , 5 / num , 110 / num , 50 / num );
      fig.arcTo(3 / num , 125 / num , 78 / num , 85 / num , 50 / num );
    }
    if (container.hasClass('triangle')) {
      fig.moveTo(90 / num, 150 / num);
      fig.arcTo(180 / num, -10 / num, 270 / num, 90 / num, 50 / num);
      fig.arcTo(390 / num, 330 / num, 320 / num, 360 / num, 50 / num);
      fig.arcTo(-10 / num, 350 / num, 30 / num, 200 / num, 50 / num);
    }
    fig.fill();
    container.children('img').hide();
  }
}

function prospect_canvas_element() {
  var len = $('[class^="prospect_process_column_line"]').length;
  for (i = 0; i < len; i++) {
    var container = $('body').find('[class^="prospect_process_column_line"]').eq(i),
        figure = container.children('canvas')[0];
    var ctx = figure.getContext('2d');
    ctx.beginPath();
    ctx.setLineDash([10,5]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#475a67';
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(20,5,30,25,35,60);
    ctx.bezierCurveTo(40,125,50,145,70,150);
    ctx.stroke();
  }
}


prospect_canvas_figure();
prospect_canvas_element();