const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const restartBtn = document.getElementById("restartBtn");
const playerSprite = new Image();
const enemySprite = new Image();
const bg = new Image();
bg.src = "city.png";
const bgSpeed = 0.3;
playerSprite.src = "spreadsheet.png";
enemySprite.src = "spreadsheet2.png";


const player = {
    x:20,
    y:20,
    width:32,
    height:32,
    dy:0,
    jumpForce:-14, 
    gravity:.7,
    grounded:true,
    dir:0,
};

const camera = {
    x: 0
}

const START_LIVES = 3;

let isFalling = false;
let itemsCollected = 0;
let currentLevel = 0;
let worldWidth, floorY, platforms, exit, items, enemies;

let gameState = 'playing';
let lives = START_LIVES;
let startTime = 0;
let finalTime = 0;

const keys = {right:false, left:false, space:false};


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freqStart, freqEnd, duration, type = 'square') {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
}

const sounds = {
    jump:      () => playSound(300, 600, 0.15),
    collect:   () => playSound(800, 1200, 0.1, 'triangle'),
    die:       () => playSound(400, 60, 0.5, 'sawtooth'),
    nextLevel: () => { playSound(400, 800, 0.15); setTimeout(() => playSound(600, 1200, 0.2), 150); },
    win:       () => { playSound(500, 500, 0.15); setTimeout(() => playSound(650, 650, 0.15), 150); setTimeout(() => playSound(800, 1000, 0.4), 300); },
    gameOver:  () => playSound(300, 40, 1.0, 'sawtooth'),
};


document.addEventListener("keydown",(event) =>
{
    if ([' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();

    if (gameState !== 'playing') {
        if (event.key === ' ' || event.key === 'r' || event.key === 'R') {
            restartGame();
        }
        return;
    }
    if (event.key === 'ArrowLeft') {
        keys.left = true;
        player.dir = 1;
    }
    if (event.key === 'ArrowRight') {
        keys.right = true;
        player.dir = 0;
    }
    if (event.key === ' ' && player.grounded && !isFalling) {
        player.dy = player.jumpForce;
        player.grounded = false;
        sounds.jump();
    }
});

document.addEventListener("keyup",(event) =>
{
    if (event.key === 'ArrowLeft') {
        keys.left = false;
    }
    if (event.key === 'ArrowRight') {
        keys.right = false;
    }
    
});

restartBtn.addEventListener("click", () => {
    restartBtn.blur();
    restartGame();
});


function loadLevel(index){
    const level = levels[index]();

    worldWidth = level.worldWidth;
    floorY = level.floorY;
    platforms = level.platforms;
    exit = level.exit;
    items = level.items;
    enemies = level.enemies;

    player.x = 20;
    player.y = 20;
    player.dy = 0;
    isFalling = false;
    itemsCollected = 0;

}

function restartGame() {
    currentLevel = 0;
    lives = START_LIVES;
    startTime = performance.now();
    gameState = 'playing';
    keys.left = false;
    keys.right = false;
    restartBtn.style.display = 'none';
    loadLevel(currentLevel);
}

function getElapsedSeconds() {
    return (performance.now() - startTime) / 1000;
}

function endGame(state) {
    gameState = state;
    finalTime = getElapsedSeconds();
    restartBtn.style.display = 'block';
    if (state === 'win') sounds.win();
    else sounds.gameOver();
}


function isColliding(rect1, rect2) {
    const r1Left   = rect1.x;
    const r1Right  = rect1.x + rect1.width;
    const r1Top    = rect1.y;
    const r1Bottom = rect1.y + rect1.height;

    const r2Left   = rect2.x;
    const r2Right  = rect2.x + rect2.width;
    const r2Top    = rect2.y;
    const r2Bottom = rect2.y + rect2.height;

    const horizontalOverlap = r1Right > r2Left && r1Left < r2Right;
    const verticalOverlap   = r1Bottom > r2Top && r1Top < r2Bottom;

    return horizontalOverlap && verticalOverlap;
}

function updateX() {
    let dx = 0;
    if (keys.left && player.x > 0) dx = -5;
    if (keys.right && player.x < worldWidth-player.width) dx = 5;

    player.x += dx;

    for (const platform of platforms) 
        if (isColliding(player, platform)) {
            if (dx > 0) {
                player.x = platform.x - player.width;
            } else if (dx < 0) {
                player.x = platform.x + platform.width;
            }
        }
    }


function updateY() {
    player.dy += player.gravity;
    player.y += player.dy;

    let landed = false;

    if (player.y + player.height >= floorY) {
        player.y = floorY - player.height;
        player.dy = 0;
        landed = true;
    }

    for (const platform of platforms) {
        if (isColliding(player, platform)) {
            if (player.dy > 0) {
                player.y = platform.y - player.height;
                player.dy = 0;
                landed = true;
            } else if (player.dy < 0) {
                player.y = platform.y + platform.height;
                player.dy = 0;
            }
        }
    }

    player.grounded = landed;
}


function drawPlatforms() {
    for (const platform of platforms){
        ctx.fillStyle = '#12b0db';
        ctx.fillRect(platform.x-camera.x,platform.y,platform.width,platform.height)
    }
}

function drawExit() {
    if (exit.dir == 1){
        exit.y++;
        if (exit.y >= exit.ybottom) {
            exit.dir = -1;
        }
    } else if (exit.dir == -1){
        exit.y--;
        if(exit.y <= exit.ytop) {
            exit.dir = 1;
        }
    }
    ctx.fillStyle = itemsCollected == items.length ? '#6dc81e' : 'rgba(109, 200, 30, 0.3)';
    ctx.fillRect(exit.x-camera.x,exit.y,exit.width,exit.height);
    
}

function updateItems(){
    let nItems = items.length;

    for (const item of items){
        ctx.beginPath()
        ctx.arc(item.x-camera.x,item.y,item.radius,0,2*Math.PI)
        ctx.fillStyle = 'rgb(255, 157, 0)'
        ctx.fill()
    }

    for (const item of items){
        if (isColliding(player,{x:(item.x-item.radius),y:(item.y-item.radius),width:2*item.radius,height:2*item.radius})){
            itemsCollected++;
            item.y = -100;
            sounds.collect();
        }
    }

    for (let i = 0; i < nItems; i++){
        ctx.beginPath()
        ctx.arc(30*(i+1),380,10,0,2*Math.PI)
        ctx.strokeStyle = 'rgb(255, 157, 0)'
        ctx.stroke()
    }

    for (let i = 0; i < itemsCollected; i++){
        ctx.beginPath()
        ctx.arc(30*(i+1),380,10,0,2*Math.PI)
        ctx.fillStyle = 'rgb(255, 157, 0)'
        ctx.fill()
    }

}

function updateEnemies(){
    for (const enemy of enemies){
        ctx.fillStyle = '#888';
        ctx.drawImage(enemySprite, 0, enemy.dir * enemy.height, enemy.width, enemy.height, enemy.x-camera.x, enemy.y, enemy.width, enemy.height);
        //ctx.fillRect(enemy.x-camera.x,enemy.y,enemy.width,enemy.height)

        if (enemy.dir == 0){
            enemy.x++;
            if (enemy.x >= enemy.xright) {
                enemy.dir = 1;
            }
        } else if (enemy.dir == 1){
            enemy.x--;
            if(enemy.x <= enemy.xleft) {
                enemy.dir = 0;
            }
        }
    }

}

function updatePlayerFall(){
    if (isFalling) {
        player.dy += player.gravity;
        player.y += player.dy;


        if (player.y > canvas.height + player.height) {
            isFalling = false;
            if (lives <= 0) {
                endGame('gameover');
            } else {
                loadLevel(currentLevel);
            }
        }
    }
}


function drawHUD() {
    ctx.font = 'bold 16px Courier';
    ctx.fillStyle = 'black';

    ctx.textAlign = 'left';
    ctx.fillText('Level ' + (currentLevel + 1) + ' / ' + levels.length, 10, 22);

    ctx.textAlign = 'center';
    ctx.fillText('Lives:', canvasWidth/2 - 30, 22);
    for (let i = 0; i < lives; i++) {
        ctx.fillStyle = 'red';
        ctx.fillRect(canvasWidth/2 + 5 + i*18, 10, 12, 12);
    }

    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    ctx.fillText('Time: ' + getElapsedSeconds().toFixed(1) + 's', canvasWidth - 10, 22);

    ctx.textAlign = 'left';
}

function drawEndScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.textAlign = 'center';

    ctx.font = 'bold 30px Courier';
    if (gameState === 'win') {
        ctx.fillStyle = '#6dc81e';
        ctx.fillText('YOU WIN!', canvasWidth/2, 110);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillText('GAME OVER', canvasWidth/2, 110);
    }

    ctx.font = 'bold 20px Courier';
    ctx.fillStyle = 'white';
    if (gameState === 'win') {
        ctx.fillText('Final time: ' + finalTime.toFixed(1) + ' seconds', canvasWidth/2, 160);
        ctx.fillText('Lives left: ' + lives, canvasWidth/2, 195);
    } else {
        ctx.fillText('You reached level ' + (currentLevel + 1) + ' of ' + levels.length, canvasWidth/2, 160);
        ctx.fillText('Time: ' + finalTime.toFixed(1) + ' seconds', canvasWidth/2, 195);
    }

    ctx.font = '16px Courier';
    ctx.fillText('Click Restart or press SPACE / R', canvasWidth/2, 330);
    ctx.textAlign = 'left';
}


function gameLoop() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (gameState !== 'playing') {
        drawEndScreen();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (!isFalling){
        updateX();
        updateY();
    }

    camera.x = player.x-150;
    if (camera.x < 0){
        camera.x=0;
    }
    if (camera.x > worldWidth-canvasWidth){
        camera.x=worldWidth-canvasWidth;
    }

    let bgX = (camera.x * bgSpeed) % 720
    ctx.drawImage(bg, 20, 20, 680, 440, -bgX, 0, 720, 400);
    ctx.drawImage(bg, 20, 20, 680, 440, -bgX + 720, 0, 720, 400);

    ctx.fillStyle = 'black';
    ctx.fillRect(0-camera.x,floorY,worldWidth,canvasHeight-floorY)

    drawPlatforms();

    drawExit();
    
    updateItems();
    
    updateEnemies();

    for(const enemy of enemies){
        if(isColliding(player,enemy) && !isFalling){
            isFalling = true;
            player.dy = -12
            lives--;
            sounds.die();
        }
    }   
    

    updatePlayerFall();
    if (gameState !== 'playing') {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!isFalling && isColliding(player,exit) && itemsCollected == items.length){
        currentLevel++;
        if (currentLevel == levels.length){
            currentLevel = levels.length - 1;
            endGame('win');
            requestAnimationFrame(gameLoop);
            return;
        }   
        else {
            loadLevel(currentLevel);
            sounds.nextLevel();
        }
        
    }

    ctx.fillStyle='red';
    ctx.drawImage(playerSprite, 0, player.dir * player.height, player.width, player.height, player.x-camera.x, player.y, player.width, player.height)
    //ctx.fillRect(player.x-camera.x,player.y,player.width,player.height);

    drawHUD();

    requestAnimationFrame(gameLoop);
}

restartGame();
gameLoop();