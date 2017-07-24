var Breakout = Breakout || {};

Breakout.loadState = function () {};

Breakout.loadState.prototype = {
    
    // Used to define and load our assets
    preload: function () {
        
        // gives name to the images
        this.load.image('ball', 'assets/images/ball.png');
        this.load.image('paddle', 'assets/images/paddle.png');
        this.load.image('brick', 'assets/images/brickWhite.png');
        this.load.spritesheet('ball', 'assets/images/spritesheets/wobble.png', 20, 20);
        this.load.spritesheet('button', 'assets/images/spritesheets/button.png', 120, 40);

        // gives names to audio
        this.load.audio('music', 'assets/sound/AllOfUS.mp3');

        // background
        this.load.image('city', 'assets/images/backgrounds/ruined_city.png');

        // load JSON file
        this.load.text('level', 'assets/data/level.json');
    },

    create: function () {
        this.state.start('main_menu');
    }
}