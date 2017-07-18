/**
 * Using Phaser to aid in JavaScript game development.
 *
 * Phaser automatically creates a canvas element when initializing a new Phaser.Game object
 * and assigning it to the game variable.
 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update
});

// initialize variable to represent ball and paddle
var ball;
var paddle;
var ballAngle;

// velocities of ball object, positive moves 'down', negative moves 'up'
var velocityX = 250;
var velocityY = -250;

// brick variables
var bricks;
var newBrick;
var brickInfo;
var brickWidth;
var brickHeight;
var brickRows;
var brickColumns;
var brickOffsetTop;
var brickOffsetLeft;
var brickPadding;

// score variables
var scoreText;
var score = 0;
var scoreIncrement = 10;

// lives variables
var livesText;
var lifeLostText;
var lives = 3;

// text style variable
var textStyle = {
    font: '18px Arial',
    fill: '#6b9add'
}

var playing = false;
var startButton;

// sound variables
var music;

// emitter variables
var emitter;

var levelData;

/**
 * Takes care of preloading the assets.  NO_SCALE sets to default size, whereas
 * SHOW_ALL will show the game area while maintaining the original aspect ratio of the screen.
 */
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;

    // gives name to the images
    game.load.image('ball', 'assets/images/ball.png');
    game.load.image('paddle', 'assets/images/paddle.png');
    game.load.image('brick', 'assets/images/brick.png');
    game.load.spritesheet('ball', 'assets/images/spritesheets/wobble.png', 20, 20);
    game.load.spritesheet('button', 'assets/images/spritesheets/button.png', 120, 40);

    // gives names to audio
    game.load.audio('music', 'assets/sound/AllOfUS.mp3');

    // background
    game.load.image('city', 'assets/images/backgrounds/ruined_city.png');

    // load JSON file
    game.load.text('level', 'assets/data/level.json');
}

/**
 * Executed once when everything is loaded and ready.
 */
function create() {
    // initializes arcade physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // background sprite
    city = game.add.sprite(game.world.width * 0.5, game.world.height * 0.5, 'city');
    city.width = game.world.width;
    city.anchor.set(0.5);

    // parse the JSON file
    levelData = JSON.parse(game.cache.getText('level'));

    // create the sprite by adding it to the game
    // game.world.width or height is the canvas width or height, but could be used for offscreen
    // interaction if the world is made bigger
    // anchor sets the position of the object from top-left of that object, so its set
    // to be in the middle for the ball, and at the bottom middle for paddle
    ball = game.add.sprite(game.world.width * levelData.ballStart.x, game.world.height + levelData.ballStart.y, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    paddle = game.add.sprite(game.world.width * levelData.paddleStart.x, game.world.height + levelData.paddleStart.y, 'paddle');
    paddle.anchor.set(0.5, 1);

    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);

    livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
    livesText.anchor.set(1, 0);
    lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;

    startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);

    // background music
    music = game.sound.add('music');
    music.volume = 0.3;
    music.loop = true;

    // create an emitter and adjust settings
    emitter = game.add.emitter(ball.x, ball.y, 1);
    emitter.makeParticles('ball');
    ball.addChild(emitter);
    emitter.setAlpha(0.3, 0.5);
    emitter.y = 0;
    emitter.x = 0;
    emitter.lifespan = 300;
    emitter.maxParticleSpeed = new Phaser.Point(-100, 50);
    emitter.minParticleSpeed = new Phaser.Point(-200, -50);

    // enables the ball for physics system, which isn't enabled by default
    // set the velocity of the ball
    // allow for ball to collide with edges of the canvas, and set it to bounce off walls
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
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

    // if score is greater than a certain number, emit a trail particle and increase speed
    if (score >= 0) {
        emitter.emitParticle();
    }

    ballAngle = game.physics.arcade.angleBetween(ball, paddle) * 100;
    emitter.angle = ballAngle;

    // when the ball collides with a brick, check the function, which removes the brick.
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    if (playing) {
        paddle.x = game.input.x || game.world.width * 0.5;
    }
}

/**
 * Initializes the bricks.
 */
function initBricks() {
    stageOne();
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
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    killTween.start();

    score += scoreIncrement;
    scoreText.setText('Points: ' + score);

    if(score === brickInfo.count.row * brickInfo.count.col * scoreIncrement) {
        alert('You won the game, congratulations!');
        location.reload();
    }
}

/**
 * Plays the animation 'wobble' when ball bounces off the paddle.
 * The larger the distance betwen the center of the paddle and the place where
 * the ball hits, the stronger the bounce either to the left or right.
 *
 * @param ball
 * @param paddle
 */
function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
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
            ball.body.velocity.set(velocityX, velocityY);
        }, this);
    } else {
        alert('You Lost, Game Over.');
        location.reload();
    }
}

/**
 * When the button is pressed, remove the button, set balls initial velocity,
 * and set playing variable to true.
 */
function startGame() {
    startButton.destroy();
    ball.body.velocity.set(velocityX, velocityY);
    playing = true;
    music.play();
}

/**
 * Example stage.  Uses JSON data to retrieve stage information.
 */
function stageOne() {
    brickInfo = {
        width: levelData.brickSettings.brickWidth,
        height: levelData.brickSettings.brickHeight,
        count: {
            row: levelData.brickSettings.brickRows,
            col: levelData.brickSettings.brickColumns
        },
        offset: {
            top: levelData.brickSettings.brickOffsetTop,
            left: levelData.brickSettings.brickOffsetLeft
        },
        padding: levelData.brickSettings.brickPadding
    }

    bricks = game.add.group();

    for (c = 0; c < brickInfo.count.col; c++) {
        for (r = 0; r < brickInfo.count.row; r++) {
            if (c % 2 == 0) {
                var brickX = (r * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
                var brickY = (c * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
                newBrick = game.add.sprite(brickX, brickY, 'brick');
                newBrick.scale.x = levelData.brickSettings.brickScaleX;
                newBrick.scale.y = levelData.brickSettings.brickScaleY;
                game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                bricks.add(newBrick);
            } else {

            }
        }
    }
}
