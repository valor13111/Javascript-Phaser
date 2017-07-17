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

var ball;
var velocityX = 150;
var velocityY = 150;

/**
 * Takes care of preloading the assets.
 */
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;

    game.stage.backgroundColor = "#98ee97";

    // give name to the image
    game.load.image('ball', 'assets/images/ball.png');
}

/**
 * Executed once when everything is loaded and ready.
 */
function create() {
    // initializes arcade physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    ball = game.add.sprite(50, 50, 'ball');

    // enables the ball for physics system, which isn't enabled by default
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.velocity.set(velocityX, velocityY);
}

/**
 * Executed on every frame.
 */
function update() {
}
