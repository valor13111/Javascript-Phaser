/**
 * Using Phaser to aid in JavaScript game development.
 *
 * Phaser automatically creates a canvas element when initializing a new Phaser.Game object
 * and assigning it to the game variable.
 */

var myCanvas = document.getElementById("myCanvas");
var game = new Phaser.Game(480, 320, Phaser.AUTO, 'myCanvas', {
    preload: preload,
    create: create,
    update: update
});

var ball;

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
    ball = game.add.sprite(50, 50, 'ball');
}

/**
 * Executed on every frame.
 */
function update() {
    ball.x += 1;
    ball.y += 1;
}
