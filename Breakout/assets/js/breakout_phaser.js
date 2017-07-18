/**
 * Using Phaser to aid in JavaScript game development.
 *
 * Phaser automatically creates a canvas element when initializing a new Phaser.Game object
 * and assigning it to the game variable.
 */

var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update
});

// initialize variable to represent ball and paddle
var ball;
var paddle;

// velocities of ball object, positive moves 'down', negative moves 'up'
var velocityX = 150;
var velocityY = -150;

// brick variables
var bricks;
var newBrick;
var brickInfo;
var brickWidth = 50;
var brickHeight = 20;
var brickRows = 7;
var brickColumns = 3;
var brickOffsetTop = 50;
var brickOffsetLeft = 60;
var brickPadding = 10;

// score variables
var scoreText;
var score = 0;
var scoreIncrement = 10;

// lives variables
var livesText;
var lifeLostText;
var lives = 3;

var textStyle = {
    font: '18px Arial',
    fill: '#6b9add'
}

/**
 * Takes care of preloading the assets.
 */
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;

    game.stage.backgroundColor = "#98ee97";

    // gives name to the images
    game.load.image('ball', 'assets/images/ball.png');
    game.load.image('paddle', 'assets/images/paddle.png');
    game.load.image('brick', 'assets/images/brick.png');
    game.load.spritesheet('ball', 'assets/images/spritesheets/wobble.png', 20, 20);
}

/**
 * Executed once when everything is loaded and ready.
 */
function create() {
    // initializes arcade physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // create the sprite by adding it to the game
    // game.world.width or height is the canvas width or height, but could be used for offscreen
    // interaction if the world is made bigger
    // anchor sets the position of the object from top-left of that object, so its set
    // to be in the middle for the ball, and at the bottom middle for paddle
    ball = game.add.sprite(game.world.width * 0.5, game.world.height - 25, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
    paddle.anchor.set(0.5, 1);

    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);

    livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
    livesText.anchor.set(1, 0);
    lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;


    // enables the ball for physics system, which isn't enabled by default
    // set the velocity of the ball
    // allow for ball to collide with edges of the canvas, and set it to bounce off walls
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    ball.body.velocity.set(velocityX, velocityY);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    paddle.body.immovable = true;

    // disables collision with bottom wall,
    // checks if ball hits bottom bounds, and executes
    // the function given
    game.physics.arcade.checkCollision.down = false;
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);

    initBricks();
}

/**
 * Executed on every frame.
 */
function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);

    // when the ball collides with a brick, check the function, which removes the brick.
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    paddle.x = game.input.x || game.world.width * 0.5;
}

/**
 * Initializes the bricks.
 */
function initBricks() {
    brickInfo = {
        width: brickWidth,
        height: brickHeight,
        count: {
            row: brickRows,
            col: brickColumns
        },
        offset: {
            top: brickOffsetTop,
            left: brickOffsetLeft
        },
        padding: brickPadding
    }

    bricks = game.add.group();
    for (c = 0; c < brickInfo.count.col; c++) {
        for (r = 0; r < brickInfo.count.row; r++) {
            var brickX = (r * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
            var brickY = (c * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}

/**
 * Destroys the brick once hit with the ball, and updates the score.
 * A tween smoothly animates properties of an object in the gameworld, such as width
 * or opacity.  We are adding a tween to make bricks smoothly disappear when hit by
 * the ball.
 *
 * @param ball - ball object
 * @param brick - brick object
 */
function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({
        x: 0,
        y: 0
    }, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function() {
        brick.kill();
    }, this);
    killTween.start();

    score += scoreIncrement;
    scoreText.setText('Points: ' + score);

    var bricks_alive = 0;
    for (i = 0; i < bricks.children.length; i++) {
        if (bricks.children[i].alive == true) {
            bricks_alive++;
        }
    }

    if (bricks_alive == 0) {
        alert('You won!  Congratulations!');
        location.reload();
    }
}

/**
 * Plays the animation 'wobble' when ball bounces off the paddle.
 *
 * @param ball
 * @param paddle
 */
function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
}

/**
 * When the ball leaves the screen, which is the bottom wall, reduce number of lives.
 * If there are still lives left, set text, and make visible lifeLostText, which allows
 * user to decide to continue or not.  Reset the ball and paddle, and only invoke the
 * addOnce function when user clicks a mouse or a key.
 */
function ballLeaveScreen() {
    lives--;
    if (lives) {
        livesText.setText('Lives: ' + lives);
        lifeLostText.visible = true;
        ball.reset(game.world.width * 0.5, game.world.height - 25);
        paddle.reset(game.world.width * 0.5, game.world.height - 5);
        game.input.onDown.addOnce(function() {
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
        }, this);
    } else {
        alert('You Lost, Game Over.');
        location.reload();
    }
}
