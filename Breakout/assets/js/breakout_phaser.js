/**
 * Using Phaser to aid in JavaScript game development.
 *
 * Phaser automatically creates a canvas element when initializing a new Phaser.Game object
 * and assigning it to the game variable.
 */

// Parameters: width, height, rendering method, id of canvas if one already exists,
// and names of three functions that load and start the game, and update game loop on every frame
var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update
});

/**
 * Takes care of preloading the assets.
 */
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;

    game.stage.backgroundColor = "#98ee97";
}

/**
 * Executed once when everything is loaded and ready.
 */
function create() {

}

/**
 * Executed on every frame.
 */
function update() {

}
