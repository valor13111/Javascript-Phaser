var Breakout = Breakout || {};

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
};

var playing = false;
var startButton;

// sound variables
var music;

// emitter variables
var emitter;

// level data from JSON file
var levelData;

Breakout.levelOneState = function () {};

Breakout.levelOneState.prototype = {

    preload: function () {
        // parse the JSON file
        levelData = JSON.parse(this.cache.getText('level'));

        // background sprite
        city = this.add.sprite(this.world.width * 0.5, this.world.height * 0.5, 'city');
        city.width = this.world.width;
        city.anchor.set(0.5);
    },

    create: function () {

        // create the sprite by adding it to the game
        // game.world.width or height is the canvas width or height, but could be used for offscreen
        // interaction if the world is made bigger
        // anchor sets the position of the object from top-left of that object, so its set
        // to be in the middle for the ball, and at the bottom middle for paddle
        ball = Breakout.game.add.sprite(Breakout.game.world.width * levelData.ballStart.x, Breakout.game.world.height + levelData.ballStart.y, 'ball');
        ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
        ball.anchor.set(0.5);
        paddle = Breakout.game.add.sprite(Breakout.game.world.width * levelData.paddleStart.x, Breakout.game.world.height + levelData.paddleStart.y, 'paddle');
        paddle.anchor.set(0.5, 1);

        scoreText = Breakout.game.add.text(5, 5, 'Points: 0', textStyle);

        livesText = Breakout.game.add.text(Breakout.game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
        livesText.anchor.set(1, 0);
        lifeLostText = Breakout.game.add.text(Breakout.game.world.width * 0.5, Breakout.game.world.height * 0.5, 'Life lost, click to continue', textStyle);
        lifeLostText.anchor.set(0.5);
        lifeLostText.visible = false;

        // background music
        music = Breakout.game.sound.add('music');
        music.volume = 0.3;
        music.loop = true;

        // create an emitter and adjust settings
        emitter = Breakout.game.add.emitter(ball.x, ball.y, 1);
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
        Breakout.game.physics.enable(ball, Phaser.Physics.ARCADE);
        Breakout.game.physics.enable(paddle, Phaser.Physics.ARCADE);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);
        paddle.body.immovable = true;

        // disables collision with bottom wall,
        // checks if ball hits bottom bounds, and executes
        // the function given
        Breakout.game.physics.arcade.checkCollision.down = false;
        ball.checkWorldBounds = true;
        ball.events.onOutOfBounds.add(this.ballLeaveScreen, this);

        // initialize stage
        this.stageOne();

        startButton = Breakout.game.add.button(Breakout.game.world.width * 0.5, Breakout.game.world.height * 0.5, 'button', this.start, this, 1, 0, 2);
        startButton.anchor.set(0.5);
    },

    update: function () {

        Breakout.game.physics.arcade.collide(ball, paddle, this.ballHitPaddle);

        // if score is greater than a certain number, emit a trail particle and increase speed
        if (score >= 0) {
            emitter.emitParticle();
        }

        ballAngle = Breakout.game.physics.arcade.angleBetween(ball, paddle) * 100;
        emitter.angle = ballAngle;

        // when the ball collides with a brick, check the function, which removes the brick.
        Breakout.game.physics.arcade.collide(ball, bricks, this.ballHitBrick);
        if (playing) {
            paddle.x = Breakout.game.input.x || Breakout.game.world.width * 0.5;
        }
    },

    /**
     * Destroys the brick once hit with the ball, and updates the score.
     * A tween smoothly animates properties of an object in the gameworld, such as width
     * or opacity.  We are adding a tween to make bricks smoothly disappear when hit by
     * the ball.
     *
     * @param ball - ball object
     * @param brick - brick object
     */
    ballHitBrick: function(ball, brick) {

        var killTween = Breakout.game.add.tween(brick.scale);
        killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
        killTween.onComplete.addOnce(function(){
            brick.kill();
        }, this);
        killTween.start();

        score += scoreIncrement;
        scoreText.setText('Points: ' + score);

        if(score === brickInfo.count.row * brickInfo.count.col * scoreIncrement) {
            alert('You won the Breakout.game, congratulations!');
            location.reload();
        }
    },

    /**
     * Plays the animation 'wobble' when ball bounces off the paddle.
     * The larger the distance betwen the center of the paddle and the place where
     * the ball hits, the stronger the bounce either to the left or right.
     *
     * @param ball
     * @param paddle
     */
    ballHitPaddle: function (ball, paddle) {
        ball.animations.play('wobble');
        ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
    },

    /**
     * When the ball leaves the screen, which is the bottom wall, reduce number of lives.
     * If there are still lives left, set text, and make visible lifeLostText, which allows
     * user to decide to continue or not.  Reset the ball and paddle, and only invoke the
     * addOnce function when user clicks a mouse or a key.
     */
    ballLeaveScreen: function () {
        lives--;
        if (lives) {
            livesText.setText('Lives: ' + lives);
            lifeLostText.visible = true;
            ball.reset(Breakout.game.world.width * 0.5, Breakout.game.world.height - 25);
            paddle.reset(Breakout.game.world.width * 0.5, Breakout.game.world.height - 5);
            Breakout.game.input.onDown.addOnce(function() {
                lifeLostText.visible = false;
                ball.body.velocity.set(velocityX, velocityY);
            }, this);
        } else {
            alert('You Lost, Breakout.game Over.');
            location.reload();
        }
    },

    /**
     * When the button is pressed, remove the button, set balls initial velocity,
     * and set playing variable to true.
     */
    start: function () {
        startButton.destroy();
        ball.body.velocity.set(velocityX, velocityY);
        playing = true;
        music.play();
    },

    /**
     * Sets an array of given colors.
     *
     * @returns {*}
     */
    randomColor: function (row, column) {
        var colors = [];
        colors.push("#ff0000");
        colors.push("#fffcf9");
        colors.push("#0004ff");
        colors.push("#8f00ff");
        colors.push("#39f70e");
        colors.push("#f3ed00");

        if (row == 0 || row == brickInfo.count.row - 1 || column == 0 || column == brickInfo.count.col - 1) {
            return colors[0];
        } else if (row == 1 || row == brickInfo.count.row - 2 || column == 1 || column == brickInfo.count.col - 2) {
            return colors[1];
        } else if (row == 2 || row == brickInfo.count.row - 3 || column == 2 || column == brickInfo.count.col - 3) {
            return colors[2];
        } else {
            return colors[Breakout.game.rnd.integerInRange(3, colors.length - 1)];
        }
    },

    /**
     * First stage.  Uses JSON data to retrieve stage information.
     */
    stageOne: function () {
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
        };

        bricks = Breakout.game.add.group();

        for (c = 0; c < brickInfo.count.col; c++) {
            for (r = 0; r < brickInfo.count.row; r++) {
                var brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
                var brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
                newBrick = Breakout.game.add.sprite(brickX, brickY, 'brick');
                newBrick.scale.x = levelData.brickSettings.brickScaleX;
                newBrick.scale.y = levelData.brickSettings.brickScaleY;
                //newBrick.tint = Phaser.Color.hexToRGB("#ff0000");
                newBrick.tint = Phaser.Color.hexToRGB(this.randomColor(r, c));
                Breakout.game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                bricks.add(newBrick);
            }
        }
    },
};
