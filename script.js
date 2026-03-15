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

function KeyDownHandler(event) {
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

    if (paddle.x + paddle.width > canvas.width || paddle.x - paddle.width < 0) {
        ball.dx *= 0;
    }
}

// Paddle movement
function updatePaddle() {
    paddle.x += paddle.dx;
    // не выходить за границы canvas
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

// Game Loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawPaddle();

    updateBall();
    updatePaddle();

    requestAnimationFrame(draw);
}

draw();

