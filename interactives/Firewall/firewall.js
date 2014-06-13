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
		this.game.load.image("overlay", 'assets/firewall_overlay.png');
		this.game.load.image("router", "assets/firewall_box.png");
		this.game.load.image("closed port", "assets/door.png");
		this.game.load.image("bad packet", 'assets/packet_red.png');
		this.game.load.image("green packet", 'assets/packet_green.png');
		this.game.load.image("yellow packet", 'assets/packet_yellow.png');
		this.game.load.image("blue packet", 'assets/packet_blue.png');
		this.game.load.image("arrow1", 'assets/arrow1.png');
		this.game.load.image("arrow2", 'assets/arrow2.png');
		this.game.load.image("arrow3", 'assets/arrow3.png');
		this.game.load.image("overlay1", 'assets/overlay1.png');
		this.game.load.image("overlay2", 'assets/overlay2.png');
		this.game.load.image("overlay3", 'assets/overlay3.png');
		this.game.load.image("magnifying glass", 'assets/magnifying_glass.png');
		this.game.load.image("success popup", 'assets/success_alert.png');
		this.game.load.image("failure popup", 'assets/failure_alert.png');
		this.game.load.spritesheet("sparkly packet", 'assets/blueSparkle_sheet.png', 50, 50, 9);
		this.game.load.spritesheet("animated bad packet", 'assets/sparksRed_sheet.png', 50, 50, 15);
	};

	// Setup the example
	GameState.prototype.create = function() {
		// Set stage background color
		this.game.stage.backgroundColor = 0x4488cc;

		this.game.add.sprite(325, 200, "router");
		
		// TO: 303
		var door = this.game.add.sprite(505, 292, "closed port");
		door.inputEnabled = true;
		door.input.pixelPerfectClick = true;
		door.events.onInputDown.add(closePort);
		
		this.game.add.sprite(0, 330, "arrow1");
		this.game.add.sprite(0, 370, "arrow2");
		this.game.add.sprite(0, 410, "arrow3");
		
		//first arrow
		var packet1 = new Packet(this.game, { defaultAngle: .45} , [
												{ x: 0, y: 400 },
												{ x: 80, y: 411 },
												{ x: 130, y: 413 },
												{ x: 190, y: 412 },
												{ x: 250, y: 402 },
												{ x: 315, y: 384 },
												{ x: 418, y: 337 }
												]);
		
		this.game.add.existing(packet1);
		//second arrow
		var packet2 = new Packet(this.game, { defaultAngle: .45, sprite: "animated bad packet", animated: true, fps: 18 }, [ 
												{ x: 0, y: 558 },
												{ x: 125, y: 547 },
												{ x: 185, y: 538 },
												{ x: 245, y: 526 },
												{ x: 310, y: 509 },
												{ x: 375, y: 484 },
												{ x: 435, y: 453 },
												{ x: 465, y: 433 },
												{ x: 535, y: 370 },
													]);
		
		this.game.add.existing(packet2);
		//third arrow
		var packet3 = new Packet(this.game, { defaultAngle: .45, sprite: "sparkly packet", animated: true }, [ 
												{ x: 0, y: 708 },
												{ x: 125, y: 683 },
												{ x: 185, y: 669 },
												{ x: 245, y: 652 },
												{ x: 310, y: 633 },
												{ x: 375, y: 610 },
												{ x: 435, y: 585 },
												{ x: 516, y: 544 },
												{ x: 565, y: 512 },
												{ x: 605, y: 479 },
												{ x: 665, y: 405 },
													]);
		
		this.game.add.existing(packet3);

		this.game.add.sprite(357, 306, "overlay1");
		this.game.add.sprite(436, 327, "overlay2");
		this.game.add.sprite(569, 363, "overlay3");
		this.game.add.sprite(0, 0, "magnifying glass");
		
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
		game.add.tween(port).to({ y: 353 }, 500, Phaser.Easing.Linear.None).start();

	}
	
});
