requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../Common/js/phaser.min",
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
		//first arrow
		var packet1 = new Packet(this.game, .45, [
												{ x: 70, y: 350 },
												{ x: 150, y: 361 },
												{ x: 200, y: 363 },
												{ x: 260, y: 362 },
												{ x: 320, y: 352 },
												{ x: 385, y: 334 },
												{ x: 450, y: 300 }
												]);
		
		this.game.add.existing(packet1);
		//second arrow
		var packet2 = new Packet(this.game, .45, [ 
												{ x: 70, y: 508 },
												{ x: 200, y: 497 },
												{ x: 260, y: 488 },
												{ x: 320, y: 476 },
												{ x: 385, y: 459 },
												{ x: 450, y: 434 },
												{ x: 510, y: 403 },
												{ x: 591, y: 334 },
													]);
		
		this.game.add.existing(packet2);
		//third arrow
		var packet3 = new Packet(this.game, .45, [ 
												{ x: 70, y: 658 },
												{ x: 200, y: 633 },
												{ x: 260, y: 619 },
												{ x: 320, y: 602 },
												{ x: 385, y: 583 },
												{ x: 450, y: 560 },
												{ x: 510, y: 535 },
												{ x: 591, y: 494 },
												{ x: 640, y: 462 },
												{ x: 680, y: 429 },
												{ x: 723, y: 371 },
													]);
		
		this.game.add.existing(packet3);

		
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
