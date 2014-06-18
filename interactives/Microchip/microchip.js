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
		this.game.load.image("laser on", "assets/laser.png");
		this.game.load.image("laserbeam", "assets/laserbeam.png");
	};

	// Setup the example
	GameState.prototype.create = function() {
		// Set stage background color
		this.game.stage.backgroundColor = 0xe02020;//0x4488cc;

//		this.game.add.sprite(300, 400, "etched");
		this.game.add.sprite(300, 400, "unetched");
		var etching = this.game.add.group();
		//this.game.add.sprite(300, 260, "negative base");
		this.game.add.sprite(412, 260, "negative4");
		this.game.add.sprite(340, 260, "negative3");
		this.game.add.sprite(300, 292, "negative2");
		this.game.add.sprite(375, 313, "negative1");
		this.laser = this.game.add.sprite(425, 170, "laser");
		this.laser.anchor.set(.5, 1);
		this.game.physics.enable(this.laser, Phaser.Physics.ARCADE);

		this.bmd = game.make.bitmapData(game.cache.getImage("etched").width, game.cache.getImage("etched").height);
		this.etched = new Phaser.Sprite(this.game, 299, 401, this.bmd);

		etching.add(this.etched);
	
//		this.beam = this.game.add.graphics(0, 0);
		this.beam = this.game.add.sprite(0, 0, "laserbeam");
		this.beam.anchor.set(.5, 0);
		this.lower_beam = this.game.add.sprite(0, 0, "laserbeam");
		this.lower_beam.anchor.set(.5, 0);

		this.game.time.advancedTiming = true;
		this.fpsText = this.game.add.text(
			970, 20, '', { font: '12px Arial', fill: '#ffffff' }
		);
		
		this.laserOff = true;
	};
	
	GameState.prototype.revealEtching = function (x, y) {
		var scaleY = y - 270;
		var yy = scaleY / 150 * 75 + 125;
		
		this.game.physics.arcade.moveToXY(this.laser, x, yy, 60, 200);
		
		this.beam.x = this.laser.x;
		this.beam.y = this.laser.y - 1;
		var rect  = { x: 0, y: 0, width: this.beam.width, height: y - this.laser.y - 1 };
		this.beam.crop(rect);
				
		var etchX = this.laser.x - 300, etchY = y - 260;
		var area = new Phaser.Rectangle(etchX - 10, etchY - 10, 20, 20);
		this.bmd.copyPixels("etched", area, etchX - 10, etchY - 10);
		
		if (etchY + 400 > 435) {
			this.lower_beam.x = this.laser.x;
			this.lower_beam.y = 435;
			var rect = { x: 0, y: 0, width: this.lower_beam.width, height: etchY - 40 };
			this.lower_beam.crop(rect);
		}
	}

	// The update() method is called every frame
	GameState.prototype.update = function() {
		if (this.game.time.fps !== 0) {
			this.fpsText.setText(this.game.time.fps + ' FPS');
		}
		
		if (this.game.input.mousePointer.isDown) {
			if (this.laserOff) {
//				this.laser.loadTexture("laser on");
				this.laserOff = false;
			}
			this.revealEtching(this.game.input.x, this.game.input.y);
		} else if (!this.laserOff) {
//			this.laser.loadTexture("laser");
			this.laserOff = true;
			this.laser.body.velocity.set(0, 0);
		}
	};

	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);	
});
