/**
 * Created by Tyler on 7/10/2017.
 */

// variables to get canvas id and set it to 2d
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// defines starting point of ball at bottom center
var x = canvas.width / 2;
var y = canvas.height - 30;

// values to be added to every frame
var dx = 2;
var dy = -2;

// ball radius for collision detection
var ballRadius = 10;

// ball color
var ballColor = "#0e36bd";

// paddle width, height, and starting point X axis
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth) / 2;

// paddle color and speed it moves
var paddleColor = "#25d8b9";
var paddleSpeed = 7;

// bricks
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 25;
var brickPadding = 10;
var brickOffsetTop = 32;
var brickOffsetLeft = 32;
var brickColor = "#f65c0c";
var bricks = [];
createBricks2dArray();

// left and right arrow button variables
var rightPressed = false;
var leftPressed = false;

// tracking the score
var score = 0;

// tracking player lives
var lives = 1;

/**
 * Produces a random color with RGB, and is set to have to a higher chance of
 * lighter colors.
 *
 * @returns {string}
 */
function getRandomColor() {
    var letters = '789ABCD';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 6)];
    }
    return color;
}

/**
 * Draws the ball onto the screen.
 */
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws the paddle onto the screen.
 */
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = paddleColor;
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws the bricks (enemies) onto the canvas.
 * Each brick is given an x, y, and status component.
 * Status means if it is a 1, then draw the brick, else, don't.
 */
function createBricks2dArray() {
    for (column = 0; column < brickColumnCount; column++) {
        bricks[column] = [];
        for (row = 0; row < brickRowCount; row++) {
            bricks[column][row] = {
                x: 0,
                y: 0,
                status: 1
            };
        }
    }
}

/**
 * Draws the bricks onto the screen if the status of the brick is a 1.
 */
function drawBricks() {
    for (column = 0; column < brickColumnCount; column++) {
        for (row = 0; row < brickRowCount; row++) {
            if (bricks[column][row].status == 1) {
                var brickX = (column * (brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (row * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[column][row].x = brickX;
                bricks[column][row].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColor;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

/**
 * Handles the action when a key is pressed down.
 *
 * @param e
 */
function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } else if (e.keyCode == 37) {
        leftPressed = true;
    }
}

/**
 * Handles the action when a key is released.
 *
 * @param e
 */
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    }
}

/**
 * Handles the mouse movement.
 *
 * @param e
 */
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

/**
 * Collision detection for when the center of the ball hits a brick.
 *
 * These conditions must be met:
 * The x position of the ball is greater than the x position of the brick.
 * The x position of the ball is less than the x position of the brick plus its width.
 * The y position of the ball is greater than the y position of the brick.
 * The y position of the ball is less than the y position of the brick plus its height.
 *
 * If the score is equal to the number of bricks in the game, it will alert a
 * congratulations message, and start the game over.
 */
function collisionDetection() {
    for (column = 0; column < brickColumnCount; column++) {
        for (row = 0; row < brickRowCount; row++) {
            var b = bricks[column][row];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    playAudio('block_destroy.wav');
                    if (score == brickRowCount * brickColumnCount) {
                        playAudio('winner.wave');
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

/**
 * Draws the scoreboard for the game.
 *
 * Adds a point for every brick destroyed in the function collisionDetection().
 */
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#004465";
    ctx.fillText("Score " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#dd40ce";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

/**
 * clearRect(x1, y1, x2, y2) clears specified area of a rectangle
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    x += dx;
    y += dy;

    // first condition = top wall, second condition = bottom wall
    // sets ball to random color when hitting a wall
    // when second condition is hit, meaning the ball hits the bottom wall,
    // it checks if it hit the paddle, and if its not within bounds of paddle width,
    // alerts game over if all the lives are gone
    if (y + dy < ballRadius) {
        dy = -dy;
        ballColor = getRandomColor();
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                stopMusic();
                playAudio('lost.wav');
                //alert("GAME OVER");
                //document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height- 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // first condition = left wall, second condition = right wall
    // sets ball to random color when hitting a wall
    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
        dx = -dx;
        ballColor = getRandomColor();
    }

    // if user tries to go out of bounds on right wall, this will prevent it
    // also if user tries to go out of bounds on left wall, will also prevent it
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    requestAnimationFrame(draw);
}

// runs function over and over again using requestAnimationFrame(), which lets browser
// render the framerates and shapes when needed
function startGame() {
    playMusic();
    draw();
}