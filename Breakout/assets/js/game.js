// Phaser automatically creates a canvas element when initializing a new Phaser.Game
// object and assigning it to the game variable.
var Breakout = Breakout || {};

Breakout.game = new Phaser.Game(800, 600, Phaser.AUTO, null);

// Add each state
Breakout.game.state.add('boot', Breakout.bootState);
Breakout.game.state.add('load', Breakout.loadState);
Breakout.game.state.add('main_menu', Breakout.menuState);
Breakout.game.state.add('levelOne', Breakout.levelOneState);

// After all states are added, start game by calling boot state
Breakout.game.state.start('boot');