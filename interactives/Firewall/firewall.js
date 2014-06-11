requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "phaser.min",
	},
	
	shim: {
	},
});

require(["Phaser", "packet"], function (Phaser, Packet) {
	var GameState = function(game) {
	};

	// Load images and sounds
	GameState.prototype.preload = function() {
		this.game.load.image("router", "assets/firewall_box.png");
		this.game.load.image("closed port", "assets/door.png");
		this.game.load.image("bad packet", 'assets/packet_red.png');
		this.game.load.image("arrow1", 'assets/arrow1.png');
		this.game.load.image("arrow2", 'assets/arrow2.png');
		this.game.load.image("arrow3", 'assets/arrow3.png');
	};

	// Setup the example
	GameState.prototype.create = function() {
		// Set stage background color
		this.game.stage.backgroundColor = 0x4488cc;

		this.game.add.sprite(400, 150, "router");
		
		// TO: 303
		var door = this.game.add.sprite(575, 242, "closed port");
		door.inputEnabled = true;
		door.input.pixelPerfectClick = true;
		door.events.onInputDown.add(closePort);
		
		this.game.add.sprite(70, 280, "arrow1");
		this.game.add.sprite(75, 320, "arrow2");
		this.game.add.sprite(75, 360, "arrow3");
		
		var packet = new Packet(this.game, 70, 350);
		this.game.add.existing(packet);
		
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
	
	function closePort (port) {
		game.add.tween(port).to({ y: 303 }, 500, Phaser.Easing.Linear.None).start();
	}
});
