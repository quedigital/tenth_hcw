requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../Common/js/phaser.min",
	},
	
	shim: {
	},
});

require(["Phaser", "FakeButton", "MultiSprite"], function (Phaser, FakeButton, MultiSprite) {
	var GameState = function (game) {
	};

	// Load images and sounds
	GameState.prototype.preload = function () {
		this.game.load.image("controller", 'assets/normal_controller.png');
		this.game.load.image("xray", 'assets/xray_controller.png');
		this.game.load.image("xray w/o motor", 'assets/xray_controller_noMotor.png');
		this.game.load.spritesheet("dpad right", "assets/rightcircuit_spritesheet.png", 105, 103, 48);
		this.game.load.image("dpad right button", "assets/rightbtn.png");
		this.game.load.spritesheet("dpad up", "assets/upcircuit_spritesheet.png", 147, 73, 48);
		this.game.load.spritesheet("action closed", "assets/actionclosed_spritesheet.png", 180, 48, 18);
		this.game.load.spritesheet("action open", "assets/actionopen_spritesheet.png", 180, 48, 18);
		this.game.load.spritesheet("shake", "assets/shake_spritesheet.png", 703, 502, 4);
		this.game.load.image("motors", "assets/motors.png");
		this.game.load.spritesheet("standing", "assets/standing_spritesheet.png", 118, 190, 10);
		this.game.load.spritesheet("jump", "assets/jump_spritesheet.png", 125, 216, 30);
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
		group1.y = 100;

		this.controller = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.centerY, "controller");
		this.controller.anchor.set(.5, .5);
		group1.add(this.controller);
		
		this.xray = new Phaser.Sprite(this.game, this.game.world.centerX, this.game.world.centerY, "xray");
		this.xray.smoothed = false;
		this.xray.anchor.set(.5, .5);
		group1.add(this.xray);
		
		this.dpad_right = new Phaser.Sprite(this.game, 318, 247, "dpad right");
		this.dpad_right.smoothed = false;
		this.dpad_right.inputEnabled = true;
//		this.dpad_right.events.onInputDown.add(play);
		this.dpad_right.animations.add("animation");
		group1.add(this.dpad_right);
//		makeDraggable(dpad_right);

		var right_btn = new FakeButton(this.game, 325, 285, 50, 50);
		right_btn.events.onInputDown.add(playSprite, { sprite: this.dpad_right });
		group1.add(right_btn);
/*
		var right_btn = new Phaser.Sprite(this.game, 319, 290, "dpad right button");
		right_btn.smoothed = false;
		right_btn.inputEnabled = true;
		right_btn.events.onInputDown.add(playSprite, { sprite: this.dpad_right });
*/

		this.dpad_up = new Phaser.Sprite(this.game, 277, 234, "dpad up");
		this.dpad_up.smoothed = false;
//		this.dpad_up.inputEnabled = true;
//		this.dpad_up.events.onInputDown.add(play);
		this.dpad_up.animations.add("animation");
		group1.add(this.dpad_up);

		var up_btn = new FakeButton(this.game, 285, 245, 50, 50);
		up_btn.events.onInputDown.add(playSprite, { sprite: this.dpad_up });
		group1.add(up_btn);
		
		this.group2 = this.game.add.group();
		group1.add(this.group2);

		this.closed = new Phaser.Sprite(this.game, 534, 241, "action closed");
		this.closed.smoothed = false;
		this.closed.inputEnabled = true;
		this.closed.events.onInputDown.add(play);
		var anim = this.closed.animations.add("animation");
		anim.onComplete.add(this.showOpenAgain, this);
		this.closed.alpha = 0;
		this.group2.add(this.closed);

		this.open = new Phaser.Sprite(this.game, 534, 241, "action open");
		this.open.smoothed = false;
		this.open.inputEnabled = true;
		this.open.events.onInputDown.add(play);
		this.open.animations.add("animation");
		this.open.play("animation", 18, true);
		this.group2.add(this.open);
		
		var shake = new Phaser.Sprite(this.game, this.controller.x, this.controller.y, "shake");
		shake.anchor.set(.5, .5);
		shake.smoothed = false;		
		shake.inputEnabled = true;
//		shake.events.onInputDown.add(play);
		shake.animations.add("animation");
//		group1.add(shake);
		
		var motors = new Phaser.Sprite(this.game, 205, 366, "motors");
		motors.smoothed = false;	
		motors.inputEnabled = true;
		motors.input.pixelPerfectClick = true;
//		motors.events.onInputDown.add(playSprite, { sprite: shake });
		group1.add(motors);
		
//		makeDraggable(motors);

//		group1.add(right_btn);

		this.action_button = new FakeButton(this.game, 700, 225, 60, 60);
//		this.action_button.events.onPressStatus.add(this.showAction, this);
		this.action_button.events.onInputDown.add(this.playAction, this);
		this.action_button.events.onInputDown.add(this.showAction, this);
		group1.add(this.action_button);
		
		this.character = new MultiSprite(this.game, 440, 100, [ { key: "standing", looping: true },
																{ key: "jump", next: "standing", offset: { x: -2, y: -24 } }
															]);
		this.character.playAnim("standing");
		this.game.add.existing(this.character);
		
		this.game.time.advancedTiming = true;
		this.fpsText = this.game.add.text(
			970, 20, '', { font: '12px Arial', fill: '#ffffff' }
		);
	};
	
	// The update() method is called every frame
	GameState.prototype.update = function () {
		if (this.game.time.fps !== 0) {
			this.fpsText.setText(this.game.time.fps + ' FPS');
		}
		
		// TODO: how to handle transparency on tablets
		var yy = this.game.input.y;
		var y0 = this.controller.y - 150;
		var y1 = this.controller.y + 100;
		
		var alpha = 1.0;
		if (yy < y0) {
			alpha = 1.0 - Math.max(Math.min((y0 - yy) / 200, 1), 0);
		} else if (yy > y1) {
			alpha = 1.0 - Math.max(Math.min((yy - y1) / 200, 1), 0);
		}

		this.xray.alpha = this.dpad_right.alpha = this.dpad_up.alpha = this.group2.alpha = alpha;
	};
	
	GameState.prototype.showOpenAgain = function () {
		this.open.alpha = 1;
		this.open.play("animation");
		this.closed.alpha = 0;
		this.closed.animations.stop("animation");		
	}
	
	GameState.prototype.showAction = function (value) {
		if (value) {
			this.open.alpha = 0;
			this.open.animations.stop("animation", true);
			this.closed.alpha = 1;
			// NOTE: play it exactly once
			this.closed.play("animation", 18, false);
			/*
		} else {
			this.open.alpha = 1;
			this.closed.alpha = 0;
//			this.closed.stop();
			*/
		}
	}
	
	GameState.prototype.playAction = function () {
		this.character.playAnim("jump");
	}
	
	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);	
});
