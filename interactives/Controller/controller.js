requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../Common/js/phaser.min",
	},
	
	shim: {
	},
});

require(["Phaser"], function (Phaser) {
	var GameState = function (game) {
	};

	// Load images and sounds
	GameState.prototype.preload = function () {
		this.game.load.image("controller", 'assets/normal_controller.png');
		this.game.load.image("xray", 'assets/xray_controller.png');
	};

	// Setup the example
	GameState.prototype.create = function () {
		this.game.stage.backgroundColor = 0x4488cc;

		var controller = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "controller");
		controller.anchor.set(.5, .5);

		var xray = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "xray");
		xray.alpha = .8;
		xray.anchor.set(.5, .5);
				
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
