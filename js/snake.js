let snake = [];
let food = null;
let direction = 'right';
let nextDirection = 'right';
let gameRunning = false;
let score = 0;
let highscore = localStorage.getItem('snakeHighscore') || 0;
let gameSpeed = 100; 
let gameInterval;
let boardSize = 20; 
let cellSize;
let particles = [];

let gameBoard, scoreElement, highscoreElement, startModal, startButton, speedLabels;

document.addEventListener('DOMContentLoaded', () => {
    gameBoard = document.getElementById('game-board');
    scoreElement = document.getElementById('score');
    highscoreElement = document.getElementById('highscore');
    startModal = document.getElementById('start-modal');
    startButton = document.getElementById('start-game');
    speedLabels = document.querySelectorAll('.speed-label');

    highscoreElement.textContent = highscore;

    document.addEventListener('keydown', handleKeyPress);

    startButton.addEventListener('click', initGame);

    speedLabels.forEach(label => {
        label.addEventListener('click', () => {
            speedLabels.forEach(l => l.classList.remove('active'));
            
            label.classList.add('active');
            
            gameSpeed = parseInt(label.dataset.speed);
            
            const radio = label.querySelector('input[type="radio"]');
            radio.checked = true;
        });
    });

    function initGame() {
        startModal.style.display = 'none';
        resetGame();
        gameRunning = true;
        gameInterval = setInterval(updateGame, gameSpeed);
    }

    function resetGame() {
        gameBoard.innerHTML = '';
        
        cellSize = gameBoard.clientWidth / boardSize;
        
        snake = [];
        
        const startX = Math.floor(boardSize / 2);
        const startY = Math.floor(boardSize / 2);
        
        for (let i = 0; i < 3; i++) {
            const snakePart = document.createElement('div');
            snakePart.classList.add('snake-part');
            if (i === 0) snakePart.classList.add('snake-head');
            snakePart.style.width = `${cellSize}px`;
            snakePart.style.height = `${cellSize}px`;
            snakePart.style.left = `${(startX - i) * cellSize}px`;
            snakePart.style.top = `${startY * cellSize}px`;
            gameBoard.appendChild(snakePart);
            
            snake.push({
                x: startX - i,
                y: startY,
                element: snakePart
            });
        }
        
        direction = 'right';
        nextDirection = 'right';
        
        score = 0;
        scoreElement.textContent = score;
        
        createFood();
    }

    function createFood() {
        if (food && food.element) {
            gameBoard.removeChild(food.element);
        }
        
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * boardSize);
            foodY = Math.floor(Math.random() * boardSize);
            
            validPosition = true;
            for (const part of snake) {
                if (part.x === foodX && part.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        const foodElement = document.createElement('div');
        foodElement.classList.add('food');
        foodElement.classList.add('pulse');
        foodElement.style.width = `${cellSize}px`;
        foodElement.style.height = `${cellSize}px`;
        foodElement.style.left = `${foodX * cellSize}px`;
        foodElement.style.top = `${foodY * cellSize}px`;
        gameBoard.appendChild(foodElement);
        
        food = {
            x: foodX,
            y: foodY,
            element: foodElement
        };
    }

    function handleKeyPress(e) {
        if (!gameRunning) return;
        
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }

    function updateGame() {
        if (!gameRunning) return;
        
        direction = nextDirection;
        
        const head = snake[0];
        let newX = head.x;
        let newY = head.y;
        
        switch (direction) {
            case 'up':
                newY--;
                break;
            case 'down':
                newY++;
                break;
            case 'left':
                newX--;
                break;
            case 'right':
                newX++;
                break;
        }
        
        for (let i = 1; i < snake.length; i++) {
            if (newX === snake[i].x && newY === snake[i].y) {
                gameOver();
                return;
            }
        }
        
        if (newX < 0 || newX >= boardSize || newY < 0 || newY >= boardSize) {
            gameOver();
            return;
        }
        
        const eatingFood = newX === food.x && newY === food.y;
        
        const newHead = document.createElement('div');
        newHead.classList.add('snake-part', 'snake-head');
        newHead.style.width = `${cellSize}px`;
        newHead.style.height = `${cellSize}px`;
        newHead.style.left = `${newX * cellSize}px`;
        newHead.style.top = `${newY * cellSize}px`;
        gameBoard.appendChild(newHead);
        
        head.element.classList.remove('snake-head');
        
        snake.unshift({
            x: newX,
            y: newY,
            element: newHead
        });
        
        if (!eatingFood) {
            const tail = snake.pop();
            gameBoard.removeChild(tail.element);
        } else {
            score++;
            scoreElement.textContent = score;
            
            if (score > highscore) {
                highscore = score;
                highscoreElement.textContent = highscore;
                localStorage.setItem('snakeHighscore', highscore);
            }
            
            createParticles(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, 10);
            
            createFood();
        }
        
        updateParticles();
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        
        startModal.style.display = 'flex';
        const modalContent = startModal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <h2>Game Over</h2>
            <p>Dein Score: ${score}</p>
            <p>Highscore: ${highscore}</p>
            
            <div class="difficulty-selector">
                <div class="speed-label ${gameSpeed === 100 ? 'active' : ''}" data-speed="100">
                    <input type="radio" name="speed" id="speed-normal" value="100" ${gameSpeed === 100 ? 'checked' : ''} hidden>
                    Normal
                </div>
                <div class="speed-label ${gameSpeed === 70 ? 'active' : ''}" data-speed="70">
                    <input type="radio" name="speed" id="speed-fast" value="70" ${gameSpeed === 70 ? 'checked' : ''} hidden>
                    Schnell
                </div>
                <div class="speed-label ${gameSpeed === 40 ? 'active' : ''}" data-speed="40">
                    <input type="radio" name="speed" id="speed-insane" value="40" ${gameSpeed === 40 ? 'checked' : ''} hidden>
                    Extrem
                </div>
            </div>
            
            <button class="button" id="restart-game">Neues Spiel</button>
        `;
        
        document.getElementById('restart-game').addEventListener('click', initGame);
        
        const newSpeedLabels = document.querySelectorAll('.speed-label');
        newSpeedLabels.forEach(label => {
            label.addEventListener('click', () => {
                newSpeedLabels.forEach(l => l.classList.remove('active'));
                
                label.classList.add('active');
                
                gameSpeed = parseInt(label.dataset.speed);
                
                const radio = label.querySelector('input[type="radio"]');
                radio.checked = true;
            });
        });
    }

    function createParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            gameBoard.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            const lifetime = Math.random() * 500 + 500; 
            
            particles.push({
                element: particle,
                x: x,
                y: y,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                lifetime: lifetime,
                createdAt: Date.now()
            });
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
        }
    }

    function updateParticles() {
        const now = Date.now();
        
        particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            
            const age = now - particle.createdAt;
            const opacity = 1 - (age / particle.lifetime);
            
            if (opacity <= 0) {
                if (particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                particles.splice(index, 1);
            } else {
                particle.element.style.opacity = opacity;
            }
        });
    }
});