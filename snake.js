const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const speedElement = document.getElementById('speed');
const lengthElement = document.getElementById('length');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const upBtn = document.getElementById('upBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');

const gridSize = 20;
let tileCount = 20;
let gameSpeed = 8;
let score = 0;
let highScore = localStorage.getItem('cyberSnakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;

let snake = [{x: 10, y: 10}];
let snakeLength = 1;
let dx = 0;
let dy = 0;
let food = {x: 15, y: 15};

const COLORS = {
    background: '#0a0a0a',
    grid: '#1a1a1a',
    snakeHead: '#cc0000',
    snakeBody: '#661111',
    snakeBodyLight: '#992222',
    food: '#cc0000',
    foodGlow: '#ff2222',
    eyes: '#ffffff',
    shadow: 'rgba(0,0,0,0.5)'
};

function resizeCanvas() {
    const container = document.querySelector('.game-area');
    const containerWidth = container.clientWidth;
    const gameWidth = Math.floor(containerWidth / gridSize) * gridSize;
    canvas.width = gameWidth;
    canvas.height = gameWidth;
    tileCount = gameWidth / gridSize;
}

function initGame() {
    resizeCanvas();
    drawGame();
    highScoreElement.textContent = highScore;
    setupEventListeners();
    if (gameRunning && !gamePaused) gameOverlay.style.display = 'none';
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    upBtn.addEventListener('click', () => changeDirection(0, -1));
    leftBtn.addEventListener('click', () => changeDirection(-1, 0));
    rightBtn.addEventListener('click', () => changeDirection(1, 0));
    downBtn.addEventListener('click', () => changeDirection(0, 1));
    window.addEventListener('resize', () => { resizeCanvas(); drawGame(); });
}

function handleKeyDown(event) {
    switch(event.key) {
        case 'ArrowUp': case 'w': case 'W': if (dy !== 1) changeDirection(0, -1); break;
        case 'ArrowDown': case 's': case 'S': if (dy !== -1) changeDirection(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': if (dx !== 1) changeDirection(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': if (dx !== -1) changeDirection(1, 0); break;
        case ' ': togglePause(); break;
        case 'Escape': resetGame(); break;
    }
}

function changeDirection(newDx, newDy) {
    if (!gameRunning || gamePaused) return;
    if ((dx !== 0 && newDx === -dx) || (dy !== 0 && newDy === -dy)) return;
    dx = newDx;
    dy = newDy;
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameOverlay.style.display = 'none';
        snake = [{x: 10, y: 10}];
        snakeLength = 1;
        dx = 0;
        dy = 0;
        score = 0;
        gameSpeed = 8;
        scoreElement.textContent = score;
        speedElement.textContent = gameSpeed;
        lengthElement.textContent = snakeLength;
        generateFood();
        gameLoop();
    } else if (gamePaused) togglePause();
}

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    if (gamePaused) {
        gameOverlay.style.display = 'flex';
        overlayTitle.textContent = 'ИГРА НА ПАУЗЕ';
        overlayText.textContent = 'Нажмите ПРОБЕЛ или кнопку "ПАУЗА" для продолжения';
    } else {
        gameOverlay.style.display = 'none';
        gameLoop();
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    snake = [{x: 10, y: 10}];
    snakeLength = 1;
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 8;
    scoreElement.textContent = score;
    speedElement.textContent = gameSpeed;
    lengthElement.textContent = snakeLength;
    gameOverlay.style.display = 'flex';
    overlayTitle.textContent = 'RAMONDROLE SNAKE';
    overlayText.textContent = 'Нажмите ПРОБЕЛ или кнопку "СТАРТ" для начала игры';
    generateFood();
    drawGame();
}

function generateFood() {
    let foodOnSnake;
    do {
        foodOnSnake = false;
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    updateSnake();
    if (checkCollision()) { gameOver(); return; }
    drawGame();
    checkFood();
    setTimeout(gameLoop, 1000 / gameSpeed);
}

function updateSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
    snake.unshift(head);
    if (snake.length > snakeLength) snake.pop();
}

function checkCollision() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function checkFood() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        snakeLength++;
        score += 10;
        if (score % 50 === 0 && gameSpeed < 20) gameSpeed += 1;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('cyberSnakeHighScore', highScore);
        }
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        speedElement.textContent = gameSpeed;
        lengthElement.textContent = snakeLength;
        generateFood();
    }
}

function gameOver() {
    gameRunning = false;
    gameOverlay.style.display = 'flex';
    overlayTitle.textContent = 'ИГРА ОКОНЧЕНА';
    overlayText.textContent = 'Ваш счет: ' + score;
}

function drawGame() {
    const size = canvas.width / tileCount;

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * size;
        const y = segment.y * size;
        const padding = i === 0 ? 0 : 2;

        if (i === 0) {
            ctx.fillStyle = COLORS.snakeHead;
            ctx.shadowColor = COLORS.snakeHead;
            ctx.shadowBlur = 15;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
            ctx.shadowBlur = 0;

            ctx.fillStyle = COLORS.eyes;
            const eyeSize = size / 5;
            const eyeOffset = size / 3;
            
            let ex1, ey1, ex2, ey2;
            if (dx === 1) {
                ex1 = x + size - eyeOffset; ey1 = y + eyeOffset;
                ex2 = x + size - eyeOffset; ey2 = y + size - eyeOffset;
            } else if (dx === -1) {
                ex1 = x + eyeOffset; ey1 = y + eyeOffset;
                ex2 = x + eyeOffset; ey2 = y + size - eyeOffset;
            } else if (dy === 1) {
                ex1 = x + eyeOffset; ey1 = y + size - eyeOffset;
                ex2 = x + size - eyeOffset; ey2 = y + size - eyeOffset;
            } else {
                ex1 = x + eyeOffset; ey1 = y + eyeOffset;
                ex2 = x + size - eyeOffset; ey2 = y + eyeOffset;
            }
            
            ctx.beginPath();
            ctx.arc(ex1, ey1, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex2, ey2, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            const pupilSize = eyeSize / 2;
            ctx.beginPath();
            ctx.arc(ex1 + dx * 1.5, ey1 + dy * 1.5, pupilSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex2 + dx * 1.5, ey2 + dy * 1.5, pupilSize, 0, Math.PI * 2);
            ctx.fill();
        } 
        else {
            const alpha = 1 - (i / snake.length) * 0.6;
            const r = Math.floor(100 + 80 * (1 - i / snake.length));
            ctx.fillStyle = `rgb(${r}, ${Math.floor(20 * alpha)}, ${Math.floor(20 * alpha)})`;
            ctx.shadowColor = '#661111';
            ctx.shadowBlur = 8;
            ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
            ctx.shadowBlur = 0;
        }
    }
    
    const fx = food.x * size;
    const fy = food.y * size;

    const gradient = ctx.createRadialGradient(
        fx + size/2, fy + size/2, 2,
        fx + size/2, fy + size/2, size
    );
    gradient.addColorStop(0, 'rgba(204, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(204, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(fx - size/2, fy - size/2, size * 2, size * 2);

    ctx.fillStyle = COLORS.food;
    ctx.shadowColor = COLORS.foodGlow;
    ctx.shadowBlur = 20;
    ctx.fillRect(fx + 2, fy + 2, size - 4, size - 4);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(fx + 4, fy + 4, size / 3, size / 3);

    ctx.strokeStyle = 'rgba(255, 34, 34, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx + 1, fy + 1, size - 2, size - 2);
}


window.onload = initGame;

if (window.innerWidth <= 768) {
    mobileControls.style.display = 'grid';
} else {
    mobileControls.style.display = 'none';
}