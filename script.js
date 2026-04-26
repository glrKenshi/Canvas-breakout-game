const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    color: 'black',
    dx: 2,
    dy: 2,
}

const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 40,
    width: 120,
    height: 15,
    radius: 8,
    color: 'black',
    dx: 0,
}

// Bricks
const brickConfig = {
    rows: 6,
    cols: 10,
    width: 80,
    height: 25,
    padding: 12,
    offsetTop: 70,
    offsetLeft: 60,
    radius: 6,
    colors: ['#111827', '#1f2937', '#374151'],
};

let score = 0;
let isGameOver = false;

function createBricks() {
    const bricks = [];
    for (let r = 0; r < brickConfig.rows; r++) {
        for (let c = 0; c < brickConfig.cols; c++) {
            const x = brickConfig.offsetLeft + c * (brickConfig.width + brickConfig.padding);
            const y = brickConfig.offsetTop + r * (brickConfig.height + brickConfig.padding);
            bricks.push({
                x,
                y,
                width: brickConfig.width,
                height: brickConfig.height,
                radius: brickConfig.radius,
                color: brickConfig.colors[r % brickConfig.colors.length],
                broken: false,
            });
        }
    }
    return bricks;
}

let bricks = createBricks();

function resetGame({ keepBricks = false } = {}) {
    isGameOver = false;
    score = 0;
    if (!keepBricks) bricks = createBricks();

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 2;
    ball.dy = 2;

    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.dx = 0;
}

// Ball Logic
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// Paddle Logic
function drawPaddle() {
    ctx.fillStyle = paddle.color;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.radius);
    ctx.fill();
}

function updatePaddle() {
    paddle.x += paddle.dx;
}

function drawBricks() {
    for (const b of bricks) {
        if (b.broken) continue;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, b.radius);
        ctx.fill();
    }
}

function drawScore() {
    ctx.fillStyle = '#111827';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawGameOver() {
    ctx.fillStyle = '#111827';
    ctx.font = '56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press F5 to restart', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'start';
}

function KeyDownHandler(event) {
    if (event.key === 'Enter' && isGameOver) {
        resetGame();
        return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'Left') {
        paddle.dx = -4;
    }
    if (event.key === 'ArrowRight' || event.key === 'Right') {
        paddle.dx = 4;
    }
}

function KeyUpHandler(event) {
    if (event.key === 'ArrowLeft' || event.key === 'Left') {
        paddle.dx = 0;
    }
    if (event.key === 'ArrowRight' || event.key === 'Right') {
        paddle.dx = 0;
    }
}

document.addEventListener('keydown', KeyDownHandler);
document.addEventListener('keyup', KeyUpHandler);


// Collision detection
function checkCollision(ball, paddle) {
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (ball.y - ball.radius > canvas.height) {
        isGameOver = true;
        return;
    }

    for (const b of bricks) {
        if (b.broken) continue;

        const withinX = ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width;
        const withinY = ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height;
        if (!withinX || !withinY) continue;

        const prevX = ball.x - ball.dx;
        const prevY = ball.y - ball.dy;
        const wasLeft = prevX + ball.radius <= b.x;
        const wasRight = prevX - ball.radius >= b.x + b.width;
        const wasAbove = prevY + ball.radius <= b.y;
        const wasBelow = prevY - ball.radius >= b.y + b.height;

        if (wasLeft || wasRight) {
            ball.dx *= -1;
        } else if (wasAbove || wasBelow) {
            ball.dy *= -1;
        } else {
            ball.dy *= -1;
        }

        b.broken = true;
        score += 10;

        if (bricks.every(br => br.broken)) {
            setTimeout(() => {
                alert(`You win! Score: ${score}`);
                resetGame();
            }, 0);
        }

        break;
    }

    // Bounce off the paddle
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;

    const isBallMovingDown = ball.dy > 0;
    const isOverPaddleX = ball.x + ball.radius >= paddleLeft && ball.x - ball.radius <= paddleRight;
    const isHittingPaddleY = ball.y + ball.radius >= paddleTop && ball.y - ball.radius <= paddleBottom;

    if (isBallMovingDown && isOverPaddleX && isHittingPaddleY) {
        ball.y = paddleTop - ball.radius;

        const speed = Math.hypot(ball.dx, ball.dy);
        const paddleCenterX = paddleLeft + paddle.width / 2;
        const relativeX = (ball.x - paddleCenterX) / (paddle.width / 2);
        const clamped = Math.max(-1, Math.min(1, relativeX));

        const maxBounceAngle = (Math.PI * 60) / 180;
        const angle = clamped * maxBounceAngle;

        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    }

    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Game Loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();

    if (isGameOver) {
        drawGameOver();
        return;
    }

    updateBall();
    updatePaddle();

    checkCollision(ball, paddle);

    requestAnimationFrame(draw);
}

draw();

