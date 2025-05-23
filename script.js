let canvas = document.getElementById('myCanvas');
  /** @type {CanvasRenderingContext2D}  */
let ctx = canvas.getContext("2d");


//globais
(function () {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
  var cancvelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();
var animationID;

// ################################################################### carregar sprites
let spriteBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAEACAYAAAADRnAGAAACGUlEQVR42u3aSQ7CMBAEQIsn8P+/hiviAAK8zFIt5QbELiTHmfEYE3L9mZE9AAAAqAVwBQ8AAAD6THY5CgAAAKbfbPX3AQAAYBEEAADAuZrC6UUyfMEEAIBiAN8OePXnAQAAsLcmmKFPAQAAgHMbm+gbr3Sdo/LtcAAAANR6GywPAgBAM4D2JXAAABoBzBjA7AmlOx8AAEAzAOcDAADovTc4vQim6wUCABAYQG8QAADd4dPd2fRVYQAAANQG0B4HAABAawDnAwAA6AXgfAAAALpA2uMAAABwPgAAgPoAM9Ci/R4AAAD2dmqcEQIAIC/AiQGuAAYAAECcRS/a/cJXkUf2AAAAoBaA3iAAALrD+gIAAADY9baX/nwAAADNADwFAADo9YK0e5FMX/UFACA5QPSNEAAAAHKtCekmDAAAAADvBljtfgAAAGgMMGOrunvCy2uCAAAACFU6BwAAwF6AGQPa/XsAAADYB+B8AAAAtU+ItD4OAwAAAFVhAACaA0T7B44/BQAAANALwGMQAAAAADYO8If2+P31AgAAQN0SWbhFDwCAZlXgaO1xAAAA1FngnA8AACAeQPSNEAAAAM4CnC64AAAA4GzN4N9NSfgKEAAAAACszO26X8/X6BYAAAD0Anid8KcLAAAAAAAAAJBnwNEvAAAA9Jns1ygAAAAAAAAAAAAAAAAAAABAQ4COCENERERERERERBrnAa1sJuUVr3rsAAAAAElFTkSuQmCC";
const tank = new Image();
tank.src = spriteBase64;
const invader = new Image();
invader.src = spriteBase64;
var startScreenTimeout;
// ################################################################### tanque e sprite
var frameCount=0;
var armyPrevFrameCount=0;
var framesInOneSec = 1000/16;
var spritUnitHeight = 35;
var spriteUnitWidth = 64;
var scoreBarHeight = 50;
var tank__bottomOffset = (spritUnitHeight/2) + scoreBarHeight;
var tankX=canvas.width/2;
var tankdX = 4;
var tankY=canvas.height-(tank__bottomOffset);
var tankWidth= spriteUnitWidth/2;
var tankHeight =spritUnitHeight/2
var keys =[];

// ################################################################### pontuação e vidas
var score = 0;
var allowedLives = 3;
var lives = allowedLives;
var hasLifeDecreased = false;
var gameRunning = false;
// ################################################################### Colunas de linhas de invasores
var invaderWidth = spriteUnitWidth/2.5;
var invaderHeight = spritUnitHeight/2.5;
var invaderSpriteHeight = spritUnitHeight;
var invaderSpriteHeightsArray = [[68,102],[102,134],[102,134],[0,34],[0,34]];
var spriteSelector =0;
var armyRows = 5;
var armyColumns = 10;
var armyX = 60;
var armyY = 60;
var invaderLeftOffset = 15;
var invaderTopOffset = 20;
var armyDirection = "right";
var armyDx = 10;
var armyDy = 10;
var armySpeed = 40;  
var armySpeed__decrement = 10;
let aliveInvaders = armyColumns* armyRows;
var armyInvaderBulletsSpeed = 4;
var armyArray = [];
// ################################################################### bala
var bullet__height = 10;
var bullet__width = 3;
var tankBullet__x;
var tankBullet__y;
var shouldMoveTankBullet = false;
var tankBullet__dy = 10;

var invaderBulletsArray = [];
var invBullet_dy = 5;
var invBullet__prevFrameCount=0;

// ################################################################### variáveis ​​de explosão
// opções
const background            = '#FFF';                    
var particlesPerExplosion   = 50;
const particlesMinSpeed     = 1;
const particlesMaxSpeed     = 6;
const particlesMinSize      = 1;
var particlesMaxSize        = 8;
const explosions            = [];
var explosionColor = "white";
let fps        = 60;
const interval = 1000 / fps;

let now, delta;
let then = Date.now();

// Otimização para dispositivos móveis
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  fps = 29;
}

// ################################################################### ciclo principal do jogo
window.addEventListener('load', function() {
  drawStartScreen();  
})

function startGame(){
    clearInterval(startScreenTimeout);
    gameRunning=true;
    gameInit();
    constructArmy(armyX,armyY);  
    gameLoop();
}

function gameInit(){
  invaderBulletsArray = [];
  armyArray = [];
  score = 0;
  lives = allowedLives;
  armyDirection = "right";  
  aliveInvaders = armyColumns* armyRows;
  frameCount=0;
  armyPrevFrameCount=0;
  invBullet__prevFrameCount=0;
  hasLifeDecreased = false;
  armySpeed = 40;
}

function gameLoop(){
  //jogo perdido por perder vidas
  if(lives <= 0 || !gameRunning){
    gameRunning=false;
    ctx.clearRect(0,0,canvas.width,canvas.height);    
    drawScore();
    drawLives();    
    drawGameOver("Você Perdeu");
    drawBottomHelper();
    return false;
  }
  //jogo ganho matando invasores
  if(aliveInvaders == 0){
    gameRunning=false;
    drawGameOver("Você Ganhou");
    drawBottomHelper();
    return false;
  }
  ctx.clearRect(0,0,canvas.width,canvas.height);
  helperHandler();
  drawScoreSeprateLine();
  drawScore();
  drawLives();
  moveArmy();
  drawArmyOfInvaders();
  keyPressed();
  drawTank(tankX,tankY);  
  if(shouldMoveTankBullet) {
    drawBullet(tankBullet__x,tankBullet__y);
    moveTankBullet();
  }
  invadersBulletHandler();
  animationID =  requestAnimationFrame(gameLoop);
  frameCount++;
  //explosões
   now   = Date.now();
   delta = now - then;
   if (delta > interval) {
     then = now - (delta % interval);
     drawExplosion();
   }
  //explosões

}

// ################################################################### event listeners
window.addEventListener("keydown", ()=>keys[event.keyCode] = true);
window.addEventListener("keyup", ()=>keys[event.keyCode] = false);
window.addEventListener("keypress", keypressedHandler);
function keyPressed() {
  if (keys[37]) {     
    if (tankX-tankdX>0) {
      tankX-=tankdX;
    }
  }
  if (keys[39]) {
    if(canvas.width - (tankX+tankWidth) > tankdX) {
      tankX+=tankdX;
    }  
  }
  if (keys[88] || keys[32]) {    
    if(!shouldMoveTankBullet)fireTankBullet();
  }
}
function keypressedHandler(){
  if(event.keyCode == "13" && !gameRunning){
    startGame();
  }
}

// ################################################################### manipuladores
function invadersBulletHandler(){
  if(invaderBulletsArray.length<3 &&  frameCount- invBullet__prevFrameCount>(armySpeed*armyInvaderBulletsSpeed)){
    generateInvaderRandomBullet();
    invBullet__prevFrameCount=frameCount;
  }
  moveInvaderBullets();

}

function generateInvaderRandomBullet(){

    let aliveArmy = [];
    for (let i = 0; i < armyRows; i++) {    
      for(let j = 0; j < armyColumns; j++){
        let soldier = armyArray[i][j];
        if(soldier.status=='alive')        
        aliveArmy.push(armyArray[i][j]);
      }
    }
    
    let rInvader = aliveArmy[genRandomNumber(aliveArmy.length)];
    if (rInvader.status=='alive') {
      let iBullet = {
        x : rInvader.x + invaderWidth/2,
        y : rInvader.y + invaderHeight    
      };
      invaderBulletsArray.push(iBullet);
      drawInvaderBullet(iBullet.x,iBullet.y);
    }
}

function genRandomNumber(rng){
  return Math.floor(Math.random()*rng);
}

function moveInvaderBullets(){
  for(let i = 0 ; i < invaderBulletsArray.length; i++){
    let iB = invaderBulletsArray[i];    
    iB.y = iB.y + invBullet_dy;
    //verifique se a bala está fora dos limites
    if(iB.y > canvas.height){
      invaderBulletsArray.splice(i,1);
    }
    //verifique se o jogo acabou pela bala
    if(
      iB.x > tankX &&
      iB.x < tankX + tankWidth &&
      iB.y > tankY && 
      iB.y < tankY + tankHeight
    )
    {
      explosionColor="green";
      particlesPerExplosion   = 150;
      particlesMaxSize      = 4;
      triggerExplosion(tankX+tankWidth/2,tankY+tankHeight/2);
      invaderBulletsArray.splice(i,1);
      console.log("perdeu 1 vida");            
      lives--;
      hasLifeDecreased=true;
    }

    drawInvaderBullet(iB.x,iB.y);

  }
}

function helperHandler(){
  if(aliveInvaders == armyColumns* armyRows){
    drawBottomMessage("Pressione ESPAÇO para atirar", 125);
  }  else
  if(hasLifeDecreased){
    drawBottomMessage(`BATEU. Vidas restantes: ${lives}`, 150);
    setTimeout(() => {
    hasLifeDecreased=false;
    drawBottomMessage(``, 150);      
    }, 2000);
  }

}

// ################################################################### desenhar funções
function drawInvader(x,y,sHeight){
  ctx.beginPath();
  ctx.drawImage(// Imagem
    invader,
    // ---- Seleção ----
    0, // sx
    sHeight, // sy
    spriteUnitWidth, // sWidth
    spritUnitHeight, // sHeight
    // ---- Desenhando ----
    x, // dx
    y, // dy
    invaderWidth, // dWidth
    invaderHeight // dHeight 
    );    
    ctx.closePath();
}


function drawTank(x,y){
  ctx.beginPath();
  ctx.drawImage(// Imagem
    tank,
    // ---- Seleção ----
    0, // sx
    tank.height-50, // sy
    tank.width, // sWidth
    spritUnitHeight, // sHeight
    // ---- Desenhando ----
    x, // dx
    y, // dy
    tankWidth, //42, // dWidth
    tankHeight //24 // dHeight 
    );
ctx.closePath();
}


function moveArmy(){
  if(frameCount-armyPrevFrameCount>armySpeed){
    armyPrevFrameCount=frameCount;
    invaderSpriteHeight=spritUnitHeight-invaderSpriteHeight;
    spriteSelector= 1 - spriteSelector;
  }
  else{
    return false;
  }
  let dx;
  let dy=0;
  if (armyDirection == 'right') {
    if(canvas.width - (armyX + (invaderWidth+invaderLeftOffset)*(armyColumns-1)) > invaderWidth){
      dx=1;
    }else{
      armyDirection='left';
      dx=-1;
      dy=armyDy;
    }
            
  } else
  if (armyDirection == 'left') {
      if (armyX-armyDx>0) {
      dx=-1;        
      }else{
        armyDirection='right';
        dx=1;
        dy=armyDy;
      }
      
  }

  armyX+=armyDx*(dx);
  updateArmy(dx*(armyDx),dy)
}

//Criar arma
function constructArmy(aX,aY){
  for (let i = 0; i < armyRows; i++) {
    armyArray[i]=[];
    for(let j = 0; j < armyColumns; j++){
      armyArray[i][j]={
        x: aX + j*(invaderWidth + invaderLeftOffset),
        y:aY + i*(invaderHeight + invaderTopOffset),
        status:"alive"
      };
    }
  }
}

//atualizando arma
function updateArmy(adx,ady){    
  for (let i = 0; i < armyRows; i++) {    
    for(let j = 0; j < armyColumns; j++){
      let soldier = armyArray[i][j];
      soldier.x = soldier.x+(adx);
      soldier.y = soldier.y + ady;
      
    }
  }
}

//desenhar armas dos invadores
function drawArmyOfInvaders(){
  for (let i = 0; i < armyRows; i++) {
    for(let j = 0; j < armyColumns; j++){
        let soldier = armyArray[i][j];
        if (soldier.status=='alive') {
          drawInvader(soldier.x,soldier.y,invaderSpriteHeightsArray[i][spriteSelector]);
            //verificar se o jogo acabou por colisão
            if(soldier.y > tankY){
              gameRunning=false;
            }
        }
      
    }
  }  
}


function drawBullet(bx,by){
  ctx.beginPath();
  ctx.beginPath();       // Comecar um novo caminho
  ctx.moveTo(bx, by);    // Mover(30, 50)
  ctx.lineTo(bx, by-bullet__height);  // Desenhar linha (150, 100)
  ctx.lineWidth = bullet__width+2;
  ctx.strokeStyle = "green";
  ctx.stroke();
}

function fireTankBullet(){
    tankBullet__x = tankX + tankWidth/2 ;
    tankBullet__y = canvas.height - tank__bottomOffset;
    drawBullet(tankBullet__x,tankBullet__y);
    moveTankBullet();
    shouldMoveTankBullet = true;
}

function moveTankBullet(){
    if(tankBullet__y < 0){
      shouldMoveTankBullet= false;      
    }
    //verifique se um invasor é atingido pela bala
    for (let i = 0; i < armyRows; i++) {
      for(let j = 0; j < armyColumns; j++){
          let soldier = armyArray[i][j];
          if(
            tankBullet__x > soldier.x &&
            tankBullet__x < soldier.x + invaderWidth &&
            tankBullet__y > soldier.y &&
            tankBullet__y < soldier.y + invaderHeight &&
            soldier.status == 'alive'
          )
          {
            soldier.status='dead';
            shouldMoveTankBullet=false;
            aliveInvaders--;
            score++;            
            explosionColor = "white";
            particlesPerExplosion   = 50;
            particlesMaxSize        = 3;
            triggerExplosion(soldier.x+invaderWidth/2,soldier.y+invaderHeight/2);
            //aumente a velocidade
            if((aliveInvaders)%armyColumns==0 && armySpeed > 10){
              armySpeed-=armySpeed__decrement;
              console.log("aumento de velocidade: " + armySpeed);
            }
          }
                  
      }
    }  
    //verifique se um invasor é atingido pela bala   

    tankBullet__y -= tankBullet__dy;
}

function drawScoreSeprateLine(){
  ctx.beginPath();
  ctx.beginPath();       // Começar um novo camnho
  ctx.moveTo(0, canvas.height- (scoreBarHeight-15));    // Mover(30, 50)
  ctx.lineTo(canvas.width, canvas.height - (scoreBarHeight-15));  // Desenhar nova linha(150, 100)
  ctx.lineWidth = 2;
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY=1;
  ctx.shadowOffsetY=-1;
  ctx.shadowColor="green";
  ctx.strokeStyle = "green";
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY=0;
  ctx.shadowOffsetY=0;  
}

function drawBottomMessage(message,sx){
  ctx.beginPath();
  ctx.font = "20px Play";
  ctx.fillStyle="white";
  ctx.fillText(message, sx, canvas.height-10);  
  ctx.closePath();
}
function drawScore(){
  drawBottomMessage("Pontos: "+score,canvas.width - 90)
}
function drawLives(){
  drawBottomMessage("Vidas: "+lives,10)
}

function drawBottomHelper(){
  drawBottomMessage("Pressione enter para jogar",150)
}


function drawInvaderBullet(ix, iy){
  ctx.beginPath();
  ctx.beginPath();       // niciar novo caminho
  ctx.moveTo(ix, iy);    // Mover (30, 50)
  ctx.lineTo(ix, iy+bullet__height);  // Desenhoar linha (150, 100)
  ctx.lineWidth = bullet__width;
  ctx.strokeStyle = "#FFF";
  ctx.stroke();
}

function drawGameOver(message){
  drawBlinker(function(){ drawScreen__line1("Fim de Jogo ") },function(){ drawScreen__line2(message) });
}


function drawBlinker(func1, func2){
  let counter=0;
  startScreenTimeout = setInterval(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height-50);
    func1();
    if(counter%3==0)func2();
    counter++;
  }, 400);
}
  
  function drawStartScreen(){
    drawBlinker(function(){ drawScreen__line1("Invasores Espaciais") },
    function(){ drawScreen__line2("Pressione Enter para Jogar") });
  }



function drawScreen__line1(message){
    ctx.save();
    ctx.beginPath();
    ctx.font = "60px Play";
    ctx.fillStyle="white";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width/2,canvas.height/2);  
    ctx.closePath();
    ctx.restore();
}
function drawScreen__line2(message){
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle="green";
    ctx.textAlign = "center";
    ctx.font = "40px Play";
    ctx.fillText(message, canvas.width/2,canvas.height/2+60);  
    ctx.closePath();
    ctx.restore();
}

// ################################################################### Funções de explosões

// Desenhar explosões
function drawExplosion() {

  if (explosions.length === 0) {
    return;
  }

  for (let i = 0; i < explosions.length; i++) {

    const explosion = explosions[i];
    const particles = explosion.particles;

    if (particles.length === 0) {
      explosions.splice(i, 1);
      return;
    }

    const particlesAfterRemoval = particles.slice();
    for (let ii = 0; ii < particles.length; ii++) {

      const particle = particles[ii];

      // Tamanho da particula
      // Se for 0, remove
      if (particle.size <= 0) {
        particlesAfterRemoval.splice(ii, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
      ctx.closePath();
      ctx.fillStyle = explosionColor;
      ctx.fill();

      // atualizar
      particle.x += particle.xv;
      particle.y += particle.yv;
      particle.size -= .1;
    }

    explosion.particles = particlesAfterRemoval;

  }
}

// clicado
function triggerExplosion(triggerX,triggerY) {

  let xPos, yPos;

  xPos = triggerX;
    yPos = triggerY;
  explosions.push(
    new explosion(xPos, yPos)
  );

}

// Explosão
function explosion(x, y) {

  this.particles = [];

  for (let i = 0; i < particlesPerExplosion; i++) {
    this.particles.push(
      new particle(x, y)
    );
  }

}

// Particula
function particle(x, y) {
  this.x    = x;
  this.y    = y;
  this.xv   = randInt(particlesMinSpeed, particlesMaxSpeed, false);
  this.yv   = randInt(particlesMinSpeed, particlesMaxSpeed, false);
  this.size = randInt(particlesMinSize, particlesMaxSize, true);
  this.r    = randInt(113, 222);
  this.g    = '00';
  this.b    = randInt(105, 255);
}

// Retorna um número inteiro aleatório, positivo ou negativo
// entre o valor dado
function randInt(min, max, positive) {

  let num;
  if (positive === false) {
    num = Math.floor(Math.random() * max) - min;
    num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
  } else {
    num = Math.floor(Math.random() * max) + min;
  }

  return num;

}
