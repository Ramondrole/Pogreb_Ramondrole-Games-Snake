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

const gameTranslations = {
    ru: { pauseTitle: "ИГРА НА ПАУЗЕ", pauseText: "Нажмите ПРОБЕЛ или кнопку 'ПАУЗА' для продолжения", startTitle: "RAMONDROLE SNAKE", startText: "Нажмите ПРОБЕЛ или кнопку 'СТАРТ' для начала игры", gameOverTitle: "ИГРА ОКОНЧЕНА", gameOverText: "Ваш счет: " },
    en: { pauseTitle: "GAME PAUSED", pauseText: "Press SPACE or 'PAUSE' button to continue", startTitle: "RAMONDROLE SNAKE", startText: "Press SPACE or 'START' button to start the game", gameOverTitle: "GAME OVER", gameOverText: "Your score: " },
    de: { pauseTitle: "SPIEL PAUSIERT", pauseText: "Drücke LEERTASTE oder 'PAUSE' um fortzufahren", startTitle: "RAMONDROLE SNAKE", startText: "Drücke LEERTASTE oder 'START' um das Spiel zu starten", gameOverTitle: "SPIEL VORBEI", gameOverText: "Dein Punktestand: " }
};

function getTranslation(key) {
    const lang = currentLang || 'ru';
    return gameTranslations[lang]?.[key] || gameTranslations.ru[key];
}

function resizeCanvas() {
    const container = document.querySelector('.game-area');
    const containerWidth = container.clientWidth;
    const gameWidth = Math.floor(containerWidth / gridSize) * gridSize;
    canvas.width = gameWidth;
    canvas.height = gameWidth;
    tileCount = gameWidth / gridSize;
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
    window.addEventListener('resize', resizeCanvas);
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
        overlayTitle.textContent = getTranslation('pauseTitle');
        overlayText.textContent = getTranslation('pauseText');
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
    overlayTitle.textContent = getTranslation('startTitle');
    overlayText.textContent = getTranslation('startText');
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
    overlayTitle.textContent = getTranslation('gameOverTitle');
    overlayText.textContent = getTranslation('gameOverText') + score;
}

function drawGame() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawSnake();
    drawFood();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 234, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const alpha = 1 - (i / snake.length) * 0.7;
        if (i === 0) {
            ctx.fillStyle = `rgba(0, 255, 234, ${alpha})`;
            ctx.shadowColor = '#00ffea';
            ctx.shadowBlur = 15;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 10;
            const eyeSize = gridSize / 4;
            const eyeOffset = gridSize / 3;
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            if (dx === 1) {
                leftEyeX = segment.x * gridSize + gridSize - eyeOffset;
                leftEyeY = segment.y * gridSize + eyeOffset;
                rightEyeX = segment.x * gridSize + gridSize - eyeOffset;
                rightEyeY = segment.y * gridSize + gridSize - eyeOffset;
            } else if (dx === -1) {
                leftEyeX = segment.x * gridSize + eyeOffset;
                leftEyeY = segment.y * gridSize + eyeOffset;
                rightEyeX = segment.x * gridSize + eyeOffset;
                rightEyeY = segment.y * gridSize + gridSize - eyeOffset;
            } else if (dy === 1) {
                leftEyeX = segment.x * gridSize + eyeOffset;
                leftEyeY = segment.y * gridSize + gridSize - eyeOffset;
                rightEyeX = segment.x * gridSize + gridSize - eyeOffset;
                rightEyeY = segment.y * gridSize + gridSize - eyeOffset;
            } else {
                leftEyeX = segment.x * gridSize + eyeOffset;
                leftEyeY = segment.y * gridSize + eyeOffset;
                rightEyeX = segment.x * gridSize + gridSize - eyeOffset;
                rightEyeY = segment.y * gridSize + eyeOffset;
            }
            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = `rgba(0, 200, 255, ${alpha})`;
            ctx.shadowColor = '#00c8ff';
            ctx.shadowBlur = 10;
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            ctx.fillRect(x, y, gridSize, gridSize);
        }
    }
    ctx.shadowBlur = 0;
}

function drawFood() {
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    const x = food.x * gridSize;
    const y = food.y * gridSize;
    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x + 4, y + 4, gridSize / 3, gridSize / 3);
    ctx.shadowBlur = 0;
    const pulse = Math.sin(Date.now() / 200) * 2 + 2;
    ctx.strokeStyle = `rgba(255, 0, 255, 0.7)`;
    ctx.lineWidth = pulse;
    ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
}

function initGame() {
    resizeCanvas();
    drawGame();
    highScoreElement.textContent = highScore;
    setupEventListeners();
    if (gameRunning && !gamePaused) gameOverlay.style.display = 'none';
}

window.onload = initGame;