var drawPos = {x:0,y:0,w:500,h:500};
var options = {};
var timer = null;
var canvas1 = null,
	canvas2 = null;
var cxt1 = null,
	cxt2 = null;

$(window).ready(function(){
    canvas1 = document.getElementById("first"),
	canvas2 = document.getElementById("second");
    cxt1 = canvas1.getContext("2d");
	cxt2 = canvas2.getContext("2d");

	init();

	$("#draw").click(function(){
		//get options
		var sx = parseInt($("input[name=sx]").val()),
			sy = parseInt($("input[name=sy]").val()),
			rows = parseInt($("input[name=rows]").val()),
			cols = parseInt($("input[name=cols]").val()),
			duration = parseInt($("input[name=duration]").val()),
			interval = parseInt($("input[name=interval]").val()),
			shift = parseInt($("input[name=shift]").val());
		
		options.sx = validate(sx,0,canvas2.width)?sx:canvas2.width/2;
		options.sy = validate(sy,0,canvas2.height)?sy:canvas2.height/2;
		options.rows = validate(rows,1,drawPos.w)?rows:drawPos.w/2;
		options.cols = validate(rows,1,drawPos.h)?cols:drawPos.h/2;
		options.duration = duration>100?duration:100;
		options.interval = validate(interval,1,options.duration)?interval:20;
		options.shift = validate(shift,0,Math.min(drawPos.w,drawPos.h))?shift:20;
		options.ease = $("select[name=ease]").val();

		//draw particles
		particle(options);
	});
});

function validate(value,min,max){
	if(value>=min&&value<=max) return true;
	else return false;
}

//initial function
function init(){
	cxt1.font="40px Georgia";
	cxt1.fillStyle="#000000";
	cxt1.fillText("Please select a picture!",10,100);
	cxt1.fillText("png only!",10,200)
	cxt2.font="40px Georgia";
	cxt2.fillStyle="#000000";
	cxt2.fillText("Here to show the results.",10,100);
}

//preview the selected picture
function preview(file){
	var image = new Image();
	image.onload = function(){
		cxt1.clearRect(0,0,canvas1.width,canvas1.height);
		if(image.width<=canvas1.width && image.height<=canvas1.height){
			drawPos.x = Math.round((canvas1.width-image.width)/2);
			drawPos.y = Math.round((canvas1.height-image.height)/2);
			drawPos.w = Math.round(image.width);
			drawPos.h = Math.round(image.height);
		}else if(image.width>canvas1.width && image.height<=canvas1.height){
			drawPos.w = Math.round(canvas1.width);
			drawPos.h = Math.round(image.height*canvas1.width/image.width);
			drawPos.x = Math.round(0);
			drawPos.y = Math.round((canvas1.height-drawPos.h)/2);
		}else if(image.width<=canvas1.width && image.height>canvas1.height){
			drawPos.w = Math.round(image.width*canvas1.height/image.height);
			drawPos.h = Math.round(canvas1.height);
			drawPos.x = Math.round((canvas1.width-drawPos.w)/2);
			drawPos.y = Math.round(0);
		}else if(image.width/canvas1.width > image.height/canvas1.height){
			var scale = canvas1.width/image.width;
			drawPos.w = Math.round(image.width*scale);
			drawPos.h = Math.round(image.height*scale);
			drawPos.x = Math.round((canvas1.width-drawPos.w)/2);
			drawPos.y = Math.round((canvas1.height-drawPos.h)/2);
		}else{
			var scale = canvas1.height/image.height;
			drawPos.w = Math.round(image.width*scale);
			drawPos.h = Math.round(image.height*scale);
			drawPos.x = Math.round((canvas1.width-drawPos.w)/2);
			drawPos.y = Math.round((canvas1.height-drawPos.h)/2);

		}
		cxt1.drawImage(image,drawPos.x,drawPos.y,drawPos.w,drawPos.h);
	}
	if(file.files && file.files[0]){//Chrome、Firefox、IE10
		var reader = new FileReader();
		reader.onload = function(evt){
			image.src = evt.target.result;
		}
		reader.readAsDataURL(file.files[0]);
	}else{//IE6~9
		image.src = file.value;
	}
}

function particle(options){
	var imageData = cxt1.getImageData(drawPos.x,drawPos.y,drawPos.w,drawPos.h);
	var particles=[];

	//calulate particles 
	cacluate();
	//draw();

	//animation
	var count = particles.length;
	var curtime = 0;

	if(timer){
		clearInterval(timer);
	}

	timer = setInterval(function(){
		curtime += options.interval;
		
		cxt2.clearRect(0,0,canvas2.width,canvas2.height);
		for(var i=0;i<particles.length;i++){
			curParticle = particles[i];
			if(curParticle.delay>curtime){
				continue;
			}
			curParticle.cx = $.easing[options.ease](null,curParticle.time,curParticle.sx,curParticle.x-curParticle.sx,options.duration),
			curParticle.cy = $.easing[options.ease](null,curParticle.time,curParticle.sy,curParticle.y-curParticle.sy,options.duration),
			curParticle.time += options.interval;
			cxt2.fillStyle = curParticle.fillStyle;
			cxt2.fillRect(curParticle.cx,curParticle.cy,1,1);
			if(curParticle.time>=options.duration){
				count--;
				if(count===0){
					count = particles.length;
					curtime = 0;
					for(var j=0;j<count;j++){
						particles[j].time = Math.round(Math.random()*options.duration/4);
					}
				}
			}
		}
	},options.interval);

	function cacluate(){
		var pos=0;
		var sw = parseInt(drawPos.w/options.cols),
			sh = parseInt(drawPos.h/options.rows);
		for(var i=1;i<=options.cols;i++){
			for(var j=1;j<=options.rows;j++){
				var particle = {};
				pos = (j*sh-1)*drawPos.w+i*sw-1;
				// console.log(pos);
				if(imageData.data[pos*4+3]>0){
					particle.time = 0;
					particle.delay = Math.round(Math.random()*options.duration/4);
					particle.sx = options.sx;
					particle.sy = options.sy;
					particle.cx = particle.sx;
					particle.cy = particle.sy;

					particle.x = i*drawPos.w/options.cols+ Math.round((Math.random()-0.5)*options.shift)+drawPos.x;
					particle.y = j*drawPos.h/options.rows + Math.round((Math.random()-0.5)*options.shift)+drawPos.y;
					pos *= 4;
					particle.fillStyle = rgb2hex("rgb("+imageData.data[pos]+","+imageData.data[pos+1]+","+imageData.data[pos+2]+")");
					particles.push(particle);
				}				
			}
		}
	}

	function draw(){
		cxt2.clearRect(0,0,canvas2.width,canvas2.height);
		for(var i=0;i<particles.length;i++){
			cxt2.fillStyle = particles[i].fillStyle;
			cxt2.fillRect(particles[i].x,particles[i].y,1,1);
		}
	}

	function rgb2hex(rgb) {
		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	}

}

