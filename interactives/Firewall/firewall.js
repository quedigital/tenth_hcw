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
		
		this.arrowGroup = game.add.group();
		this.backPacketGroup = game.add.group();
		this.panel = game.add.group();
		this.doorGroup = game.add.group();
		this.frontArrowGroup = game.add.group();
		this.frontPacketGroup = game.add.group();
		
		this.panel.add(new Phaser.Sprite(game, 357, 306, "overlay1"));
		this.panel.add(new Phaser.Sprite(game, 436, 327, "overlay2"));
		this.panel.add(new Phaser.Sprite(game, 569, 363, "overlay3"));				
		
		this.arrows = [
			new Phaser.Sprite(game, 0, 330, "arrow1"),
			new Phaser.Sprite(game, 0, 370, "arrow2"),
			new Phaser.Sprite(game, 0, 410, "arrow3") ];
		this.arrowGroup.add(this.arrows[0]);
		this.arrowGroup.add(this.arrows[1]);
		this.arrowGroup.add(this.arrows[2]);
					
		this.doorPositions = [ [375, 256, 318], [505, 292, 353], [638, 328, 390] ];
		for (var i = 0; i <= 2; i++) {
			var door = new Phaser.Sprite(game, this.doorPositions[i][0], this.doorPositions[i][1], "closed port");
			this.doorGroup.add(door);
			door.inputEnabled = true;
			door.input.pixelPerfectClick = true;
			door.index = i;
			door.events.onInputDown.add(this.togglePort, this);
		}
		
		this.packetManager = new PacketManager(this.game, this.backPacketGroup, this.frontPacketGroup);
		
		var g = this.game.add.graphics(0, 0);
		g.lineStyle(2, 0xe0e020, 2);
		g.drawRect(200, 150, 700, 400);
		this.activeRect = new Phaser.Rectangle(200, 150, 700, 400);

		this.magnifier = this.game.add.sprite(1200, 900, "magnifying glass");
		this.magnifier.anchor.setTo(46 / 74, 28 / 96);
		this.magnifier.allowRotation = false;
		game.physics.enable(this.magnifier, Phaser.Physics.ARCADE);
				
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
		
		if (Phaser.Rectangle.contains(this.activeRect, this.game.input.x, this.game.input.y)) {
//			this.game.physics.arcade.moveToPointer(this.magnifier, 60, this.game.input.activePointer, 200);
			this.game.physics.arcade.moveToXY(this.magnifier, 890, 540, 60, 200);
		} else {
			this.magnifier.body.velocity.set(this.magnifier.body.velocity.x * .9, this.magnifier.body.velocity.y * .9);
		}
		
		this.packetManager.update();
	};
	
	GameState.prototype.togglePort = function (sprite) {
		var index = sprite.index;
		
		if (sprite.y > this.doorPositions[index][2] - 5) {
			game.add.tween(sprite).to({ y: this.doorPositions[index][1] }, 500, Phaser.Easing.Linear.None).start();
			this.packetManager.openPort(index);
			this.arrowGroup.add(this.arrows[index]);
		} else {
			game.add.tween(sprite).to({ y: this.doorPositions[index][2] }, 500, Phaser.Easing.Linear.None).start();
			this.packetManager.closePort(index);
			this.frontArrowGroup.add(this.arrows[index]);
		}
	}		

	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);	
});
