
var gameCanvas=null;
var gameCtx=null;

var animateId=null;
var image=new Image();
var curTime = 0;
var gravity = 10;//重力加速度
var boards=[{x:340,y:400,type:0}];//跳板
var man={x:340,y:300,speed:1};//人物下落速度 speed += gravity*curTime/1000;
var curBoard = 0;//人物当前所在跳板
var curLife=100;



$(window).ready(function(){
	lifebarInit();
	image.onload = function(){

		backgroundFrame();
		$(document).keydown(function(event){
			//console.log(event.keyCode);
			if(event.keyCode===37){//键盘左键按下
				man.x = (man.x<20)?10:man.x-10;
			}else if(event.keyCode===39){//键盘右键按下
				man.x = (man.x>660)?670:man.x+10;
			}
		});
		//step();
		animateId = setInterval(step,10);
		//gameCtx.drawImage(image,man.x,man.y);


	}
	image.src = "009.jpg";
});

function step(){
	gameCtx.clearRect(10,100,gameCanvas.width-20,gameCanvas.height-100);
	curTime +=1;
	manFrame();
	boardFrame();	
	//若碰触顶部障碍或掉落，扣除25%的血量;若剩余血量>0则将人物重置于最后一个可见跳板上，否则游戏结束
	if(man.y<100 || man.y>gameCanvas.height){
		curLife-=25;
		lifebar(curLife);
		if(curLife<=0){
			resetGame();
		}
		for(var i=boards.length-1;i>0;i--){
			if(boards[i].y<gameCanvas.height-10){
				man.x = boards[i].x;
				man.y = boards[i].y-101;
				break;
			}
		}
		
	}
	//requestAnimationFrame(step);
}



//血条初始绘制
function lifebarInit(){
	gameCanvas = document.getElementById("gameCanvas");
	gameCtx = gameCanvas.getContext("2d");
	//限定绘制区域
	gameCtx.save();
	gameCtx.rect(0,0,800,40);
	gameCtx.clip();

	gameCtx.fillStyle = "#00ff00";
	gameCtx.strokeRect(10,10,600,20);
	gameCtx.fillRect(10,10,600,20);
	gameCtx.font="20px Arial";
	gameCtx.fillText("100%",620,26);
	//恢复绘制区域
	gameCtx.restore();
}
//血条绘制
//curLife:0~100
function lifebar(curLife){
	curLife = curLife>100?100:curLife;
	curLife = curLife<0?0:curLife;
	if(gameCtx && curLife>=0 && curLife<=100){
		curLife = parseInt(curLife);
		if(curLife>=60){
			gameCtx.fillStyle = "#00ff00";
		}else if(curLife>=25){
			gameCtx.fillStyle = "#ffff00";
		}else{
			gameCtx.fillStyle = "#ff0000";
		}
		//限定绘制区域
		gameCtx.save();
		gameCtx.rect(0,0,800,40);
		gameCtx.clip();

		gameCtx.clearRect(10,10,600,20);
		gameCtx.fillRect(10,10,6*curLife,20);
		gameCtx.clearRect(620,0,180,40);
		gameCtx.font="20px Arial";
		gameCtx.fillText(curLife+"%",620,26);
		//恢复绘制区域
		gameCtx.restore();
	}	
}
//背景帧
function backgroundFrame(){
	gameCtx.fillStyle = "#cccccc";
	gameCtx.fillRect(0,40,10,gameCanvas.height-40);
	gameCtx.fillRect(gameCanvas.width-10,40,10,gameCanvas.height-40);
	gameCtx.beginPath();
	gameCtx.moveTo(10,40);
	for(var i=20;i<gameCanvas.width-10;i+=20){
		gameCtx.lineTo(i,60);
		gameCtx.lineTo(i+10,40);
	}
	gameCtx.closePath();
	gameCtx.fillStyle = "red";
	gameCtx.fill();

}
//跳板帧
function boardFrame(){
	//gameCtx.clearRect(10,100,gameCanvas.width-20,gameCanvas.height-100);
	//所有跳板上移
	for(var i=0;i<boards.length;i++){
		boards[i].y -=1;
	}
	//最后一块跳板进入显示区域后，计算后继跳板
	var lastBoardY = boards[boards.length-1].y;//最后一块跳板高度
	while(lastBoardY<650){
		lastBoardY = boards[boards.length-1].y;
		generateBoard();
	}
	//移除已经走过游戏区域顶端的跳板
	while(boards[0].y<110){
		boards.shift();
		if(curBoard>0) curBoard-=1;
	}
	//绘制跳板
	gameCtx.fillStyle="blue";
	for(var i=0;i<boards.length;i++){
		gameCtx.fillRect(boards[i].x,boards[i].y,120,10);
	}
	//随机生成跳板
	function generateBoard(){
		var board={};
		board.y = boards[boards.length-1].y + 100 + Math.round(Math.random()*100);
		board.x = 10+Math.ceil(Math.random()*660);
		boards.push(board);
	}
}
//人物帧
function manFrame(){
	var flag = false;//true：下一帧人物是否在板上
	for(var i=curBoard;i<boards.length;i++){//恰在板上
		if(man.y===boards[i].y-100 && man.x>boards[i].x-60 && man.x<boards[i].x+60){
			man.y -=1;
			curTime = 0;
			flag = true;
			curBoard=i;
			break;
		}else if(man.y<boards[i].y-100 && man.y+man.speed>boards[i].y-101 && man.x>boards[i].x-60 && man.x<boards[i].x+60){//即将落于板上
			man.y = boards[i].y-101;
			flag=true;
			//curBoard=i;
			break;
		}
	}
	if(!flag) {
		man.y += man.speed;
		man.speed += gravity*curTime/1000;
	}else{
		man.speed = 1;
	}
	gameCtx.drawImage(image,man.x,man.y);
}

//显示游戏结束画面，重置游戏参数
function resetGame(){
	clearInterval(animateId);
	curLife=100;
	curTime=0;
	man.speed=1;
	gameCtx.fillStyle="#cccccc";
	gameCtx.fillRect(200,230,400,150);
	gameCtx.font="40px Arial";
	gameCtx.fillStyle="#ff0000";
	gameCtx.fillText("GAME OVER!",280,300);
	gameCtx.font="30px Arial";
	gameCtx.fillText("press ENTER to restart!",250,340);
	//按下回车键重新开始游戏
	$(window).keyup(function(event){
		if(event.keyCode===13){
			lifebar(curLife);
			clearInterval(animateId);
			animateId = setInterval(step,10);
		}
	});
}

