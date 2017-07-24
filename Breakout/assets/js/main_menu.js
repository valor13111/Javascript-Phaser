var Breakout = Breakout || {};

Breakout.menuState = function () {};

Breakout.menuState.prototype = {

    create: function () {
        var nameLabel = this.add.text(80, 80, 'Breakout', {
            font: '50px Arial',
            fill: '#FFFFFF'
        });

        var startLabel = this.add.text(80, this.world.height - 80, 'Press the "W" key to start', {
            font: '25px Arial',
            fill: '#FFFFFF'
        });

        var wKey = this.input.keyboard.addKey(Phaser.Keyboard.W);

        wKey.onDown.addOnce(this.start, this);
    },

    // start function calls the level_one state
    start: function () {
        this.state.start('levelOne');
    }
};