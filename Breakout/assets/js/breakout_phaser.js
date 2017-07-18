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
}

/**
 * Executed once when everything is loaded and ready.
 */
function create() {
    // initializes arcade physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    ball = game.add.sprite(game.world.width * 0.5, game.world.height - 25, 'ball');
    ball.anchor.set(0.5);
    paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
    paddle.anchor.set(0.5, 1);

    // enables the ball for physics system, which isn't enabled by default
    // set the velocity of the ball
    // allow for ball to collide with edges of the canvas, and set it to bounce off walls
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    ball.body.velocity.set(velocityX, velocityY);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    paddle.body.immovable = true;
}

/**
 * Executed on every frame.
 */
function update() {
    game.physics.arcade.collide(ball, paddle);
    paddle.x = game.input.x || game.world.width * 0.5;
}
