requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../Common/js/phaser.min",
	},
	
	shim: {
	},
});

require(["Phaser", "PacketManager"], function (Phaser, PacketManager) {
	var GameState = function (game) {
	};

	// Load images and sounds
	GameState.prototype.preload = function () {
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
	GameState.prototype.create = function () {
		// Set stage background color
		this.game.stage.backgroundColor = 0x4488cc;

		this.game.add.sprite(325, 200, "router");
		
		this.thingsInFront = [];
		this.thingsInFront.push(this.game.add.sprite(357, 306, "overlay1"));
		this.thingsInFront.push(this.game.add.sprite(436, 327, "overlay2"));
		this.thingsInFront.push(this.game.add.sprite(569, 363, "overlay3"));

		var door = this.game.add.sprite(505, 292, "closed port");
		door.inputEnabled = true;
		door.input.pixelPerfectClick = true;
		door.events.onInputDown.add(closePort);
		
		var arrow1 = this.game.add.sprite(0, 330, "arrow1");
		var arrow2 = this.game.add.sprite(0, 370, "arrow2");
		var arrow3 = this.game.add.sprite(0, 410, "arrow3");
		
		this.packetManager = new PacketManager(this.game);
		this.packetManager.events.onPacketLaunched.add(this.moveThingsInFront, this);
		
		this.magnifier = this.game.add.sprite(0, 0, "magnifying glass");
		this.magnifier.anchor.setTo(46 / 74, 28 / 96);
		this.magnifier.allowRotation = false;
		game.physics.enable(this.magnifier, Phaser.Physics.ARCADE);
		
		this.thingsInFront.push(this.magnifier);
		
		var g = this.game.add.graphics(0, 0);
		g.lineStyle(2, 0xe0e020, 2);
		g.drawRect(200, 150, 700, 400);
		this.activeRect = new Phaser.Rectangle(200, 150, 700, 400);

		this.thingsInFront.push(g);
		
		this.game.time.advancedTiming = true;
		this.fpsText = this.game.add.text(
			970, 20, '', { font: '12px Arial', fill: '#ffffff' }
		);
	};
	
	GameState.prototype.moveThingsInFront = function () {
		for (var i = 0; i < this.thingsInFront.length; i++) {
			// ARGH! Graphics don't have a bringToTop (!)
//			this.thingsInFront[i].bringToTop();
			this.game.world.bringToTop(this.thingsInFront[i]);
		}
	}

	// The update() method is called every frame
	GameState.prototype.update = function() {
		if (this.game.time.fps !== 0) {
			this.fpsText.setText(this.game.time.fps + ' FPS');
		}
		
		if (Phaser.Rectangle.contains(this.activeRect, game.input.x, game.input.y)) {
			this.game.physics.arcade.moveToPointer(this.magnifier, 60, game.input.activePointer, 300);
		} else {
			this.magnifier.body.velocity.set(this.magnifier.body.velocity.x * .9, this.magnifier.body.velocity.y * .9);
		}
		
		this.packetManager.update();
	};

	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);
	
	function closePort (port) {
		game.add.tween(port).to({ y: 353 }, 500, Phaser.Easing.Linear.None).start();
	}
	
});
