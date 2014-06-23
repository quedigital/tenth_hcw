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
		this.game.load.image("xray w/o motor", 'assets/xray_controller_noMotor.png');
		this.game.load.spritesheet("dpad right", "assets/rightcircuit_spritesheet.png", 147, 116, 37);
		this.game.load.image("dpad right button", "assets/rightbtn.png");
		this.game.load.spritesheet("dpad up", "assets/upcircuit_spritesheeet.png", 147, 116, 37);
		this.game.load.spritesheet("action closed", "assets/actionclosed_spritesheet.png", 236, 76, 18);
		this.game.load.spritesheet("action open", "assets/actionopen_spritesheet.png", 236, 76, 33);
		this.game.load.spritesheet("shake", "assets/shake_spritesheet.png", 703, 502, 4);
		this.game.load.image("motors", "assets/motors.png");
	};

	function showPos (sprite) {
		console.log(sprite.x + ", " + sprite.y);
	}
	
	function makeDraggable (sprite) {
		sprite.input.enableDrag(false);
		sprite.events.onDragStop.add(showPos);
	}
	
	function play (sprite) {
		sprite.play("animation", 18, false);
	}
	
	function playSprite (event, pointer, obj) {
		this.sprite.bringToTop();
		this.sprite.play("animation", 18, false);
	}
	
	// Setup the example
	GameState.prototype.create = function () {
		this.game.stage.backgroundColor = 0x4488cc;

		var group1 = this.game.add.group();
		
		var controller = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.centerY, "controller");
		controller.anchor.set(.5, .5);
		group1.add(controller);

		var xray = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.centerY, "xray");
		xray.smoothed = false;
		xray.alpha = 1;
		xray.anchor.set(.5, .5);
		group1.add(xray);
		
		var dpad_right = new Phaser.Sprite(this.game, 276, 234, "dpad right");
		dpad_right.smoothed = false;
		dpad_right.inputEnabled = true;
		dpad_right.events.onInputDown.add(play);
		dpad_right.animations.add("animation");
		group1.add(dpad_right);

		var right_btn = new Phaser.Sprite(this.game, 322, 291, "dpad right button");
		right_btn.smoothed = false;
		right_btn.inputEnabled = true;
		right_btn.events.onInputDown.add(playSprite, { sprite: dpad_right });
//		makeDraggable(right_btn);

		var dpad_up = new Phaser.Sprite(this.game, 276, 234, "dpad up");
		dpad_up.smoothed = false;
		dpad_up.inputEnabled = true;
		dpad_up.events.onInputDown.add(play);
		dpad_up.animations.add("animation");
		group1.add(dpad_up);
		
		var closed = new Phaser.Sprite(this.game, 488, 240, "action closed");
		closed.smoothed = false;
		closed.inputEnabled = true;
		closed.events.onInputDown.add(play);
		closed.animations.add("animation");
		group1.add(closed);

		var open = new Phaser.Sprite(this.game, 488, 240, "action open");
		open.smoothed = false;
		open.inputEnabled = true;
		open.events.onInputDown.add(play);
		open.animations.add("animation");
		group1.add(open);
		
		var shake = new Phaser.Sprite(this.game, controller.x, controller.y, "shake");
		shake.anchor.set(.5, .5);
		shake.smoothed = false;		
		shake.inputEnabled = true;
		shake.events.onInputDown.add(play);
		shake.animations.add("animation");
		group1.add(shake);
		
		var motors = new Phaser.Sprite(this.game, 205, 366, "motors");
		motors.smoothed = false;		
		motors.inputEnabled = true;
		motors.events.onInputDown.add(playSprite, { sprite: shake });
		group1.add(motors);
		
		makeDraggable(motors);

		group1.add(right_btn);

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
