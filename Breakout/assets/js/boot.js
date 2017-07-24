var Breakout = Breakout || {};

Breakout.bootState = function () {};

Breakout.bootState.prototype = {

    // The create function is standard Phaser function, and is
    // automatically called
    create: function () {

        // initializes arcade physics engine
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // NO_SCALE sets to default size, whereas
        // SHOW_ALL will show the game area while maintaining the original aspect ratio of the screen
        this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        this.scale.pageAlignVertically = true;
        this.scale.pageAlignHorizontally = true;

        // Calling the load state
        this.state.start('load');
    }
};
