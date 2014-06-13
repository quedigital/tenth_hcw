requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../Common/js/phaser.min",
	},
	
	shim: {
	},
});

require(["Phaser"], function (Phaser) {
	var GameState = function(game) {
	};

	// Load images and sounds
	GameState.prototype.preload = function() {
		this.game.load.image("etched", "assets/etched_silicon.png");
		this.game.load.image("unetched", "assets/unetched_silicon.png");
		this.game.load.image("negative base", "assets/chip_negative.png");
		this.game.load.image("negative1", "assets/negative1.png");
		this.game.load.image("negative2", "assets/negative2.png");
		this.game.load.image("negative3", "assets/negative3.png");
		this.game.load.image("negative4", "assets/negative4.png");
		this.game.load.image("laser", "assets/laser_off.png");
	};

	// Setup the example
	GameState.prototype.create = function() {
		// Set stage background color
		this.game.stage.backgroundColor = 0xe02020;//0x4488cc;

		this.game.add.sprite(300, 400, "etched");
		//this.game.add.sprite(300, 400, "unetched");
		//this.game.add.sprite(300, 260, "negative base");
		this.game.add.sprite(412, 260, "negative4");
		this.game.add.sprite(340, 260, "negative3");
		this.game.add.sprite(300, 292, "negative2");
		this.game.add.sprite(375, 313, "negative1");
		this.game.add.sprite(425, 70, "laser");
		
		this.game.time.advancedTiming = true;
		this.fpsText = this.game.add.text(
			970, 20, '', { font: '12px Arial', fill: '#ffffff' }
		);
	};

	// The update() method is called every frame
	GameState.prototype.update = function() {
		if (this.game.time.fps !== 0) {
			this.fpsText.setText(this.game.time.fps + ' FPS');
		}
	};

	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);	
});
