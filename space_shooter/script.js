
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let x = canvas.width/2;
let y = canvas.height-50;
let gameOver = false;
let score = 0;
let spawnrate = 0.01; // % chance to spawn an enemy each frame

// State object to track active inputs
const keys = { Left: false, Right: false, Space: false };

const enemyRadius = 10;
const bulletRadius = 5;
const bullets = []; // Array to hold active bullets {x: y:}
const enemies = []; // Array to hold active enemies {x: y: speed:}

//left,right, and space listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.Left = true;
    if (e.key === 'ArrowRight') keys.Right = true;
    if (e.key === ' ') keys.Space = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.Left = false;
    if (e.key === 'ArrowRight') keys.Right = false;
});

function addEnemy() {
    //TODO: push enemy
    //const enemyX = ...
    //const enemyY = ...
    //const enemySpeed = ...
    //enemies.push(...);
}

function collision(enemy, bullet) {
    // TODO: check distance between enemy and bullet
    let dx = enemy.x - bullet.x;
    let dy = enemy.y - bullet.y;
    let distance = Math.sqrt(dx*dx + dy*dy);

    if (distance <= 15) {
        return true;
    }
}

function updateEnemies() {
    //remove enemies that get hit by bullets
    for (let i = 0; i < enemies.length; i++) {
        for (let j = 0; j < bullets.length; j++) {
            if (collision(enemies[i], bullets[j])) { //collision detected
                score++;
                //TODO: remove bullet
                bullets.splice(j,1);
                //TODO:remove enemy
                enemies.splice(i,1);
                break;
            }
        }

        // Skip drawing/moving if the enemy was removed
        if (!enemies[i]) continue;

        // TODO: Move enemy downwards based on enemy speed
        enemies[i].y+=enemies[i].speed;
        
        // TODO: Draw the enemy
        ctx.beginPath();
        ctx.arc(enemies[i].x,enemies[i].y, 10, 0, 2* Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();

        // if enemies reach player, game over
        if (enemies[i].y > canvas.height - 50) {
            //console.log("Game Over!");
            gameOver = true;
            return; 
        }
        

    }
}

function shoot(playerx,playery) {
    // TODO: Push a new bullet at the player's position
    bullets.push({x:playerx,y:playery});
    console.log(bullets);
}

function updateBullets() {
        //TODO: Move all bullets upwards
        //TODO: draw bullets
        //TODO: Remove bullets that go off-screen
        for (let i=0; i<bullets.length; i++) {
            bullets[i].y-=5;
            console.log(bullets);
            ctx.beginPath();
            ctx.arc(bullets[i].x,bullets[i].y, 5, 0, 2* Math.PI);
            ctx.fillStyle = 'yellow';
            ctx.fill();

            if(bullets[i].y<0) {
                bullets.splice(i, 1);
            }
        }
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("GAME OVER", canvas.width / 2 - 90, canvas.height / 2-100);
        ctx.fillText("Final Score: " + score, canvas.width / 2 - 90, canvas.height / 2 -60);

        return; // Stop the game loop
    }

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, canvas.height-20);

    // Update player position based on input
    if (keys.Left) x -= 5;
    if (keys.Right) x += 5;
    if (x < 10) x = 10; // Prevent moving out of bounds on the left
    if (x > canvas.width-10) x = canvas.width-10; // Prevent moving out of bounds on the right

    if (keys.Space) {
        // shoot when spacebar pressed
        shoot(x,y);
        keys.Space = false; // Reset the space key state after shooting
    }

    updateBullets();
    updateEnemies();

    //TODO: randomly add enemies
    if(Math.random()<0.01) {
        let enemyspeed = Math.random() + 1;
        enemies.push({x:Math.random()*canvas.width,y:0,speed:enemyspeed});
    }

    // Draw the player
    ctx.beginPath();
    ctx.arc(x,y, 10, 0, 2* Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    requestAnimationFrame(gameLoop);
 }

gameLoop();
