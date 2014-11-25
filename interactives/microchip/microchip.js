requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../common/js/phaser.min",
		"utils": "../../common/js/utils",
	},
	
	shim: {
	},
});

require(["Phaser", "utils"], function (Phaser, utils) {
	var DEBUG = false;
	
	var GameState = function (game) {
		GameState.RESOLUTION = 30;
	};

	// Load images and sounds
	GameState.prototype.preload = function () {
		this.game.load.image("etched", "assets/etched_silicon.png");
		this.game.load.image("unetched", "assets/unetched_silicon.png");
		this.game.load.image("negative base", "assets/chip_negative.png");
		this.game.load.image("laser", "assets/laser_off.png");
		this.game.load.image("laserbeam", "assets/laserbeam.png");
		this.game.load.image("smoke", "assets/smoke.png");
		this.game.load.image("glow", "assets/laser_glowpoint.png");
		this.game.load.image("finished", "assets/finished_chip.png");
		this.game.load.image("empty progress", "assets/progress_empty.png");
		this.game.load.image("complete progress", "assets/progress_complete.png");
		this.game.load.image("restart button", "assets/startover_upbtn.png");
		this.game.load.image("restart button down", "assets/startover_hitbtn.png");
	};

	// Setup the example
	GameState.prototype.create = function () {
		// Set stage background color
		this.game.stage.backgroundColor = 0xe02020;//0x4488cc;
		
		this.unetchedData = this.game.make.bitmapData(this.game.cache.getImage("unetched").width, this.game.cache.getImage("unetched").height);
		this.unetchedData.copyPixels("unetched", { x: 0, y: 0, width: this.game.cache.getImage("unetched").width, height: this.game.cache.getImage("unetched").height }, 0, 0);
		this.unetchedData.update();
		
		this.unetched = this.game.add.sprite(252, 400, this.unetchedData);
		
//		this.unetched = this.game.add.sprite(252, 400, "unetched");
		
		this.finished = this.game.add.sprite(252, 416, "finished");
		this.finished.alpha = 0;
		var etching = this.game.add.group();
		this.negative = this.game.add.sprite(252, 200, "negative base");

		this.etchedData = game.make.bitmapData(game.cache.getImage("etched").width, game.cache.getImage("etched").height);
		this.etched = new Phaser.Sprite(this.game, 252, 401, this.etchedData);

		etching.add(this.etched);

		this.glow = this.game.add.sprite(-200, 0, "glow");
		this.glow.anchor.set(.5, .5);
			
		this.beam = this.game.add.sprite(-200, 0, "laserbeam");
		this.beam.anchor.set(.5, 0);
		this.lower_beam = this.game.add.sprite(-200, 0, "laserbeam");
		this.lower_beam.anchor.set(.5, 0);

		this.emitter = game.add.emitter(this.game.world.centerX, 200, 400);
		this.emitter.makeParticles("smoke");
		this.emitter.setRotation(0, 0);
		this.emitter.setAlpha(1, 0, 3000);
		this.emitter.setScale(0, .8, 0, .8, 6000, Phaser.Easing.Quintic.Out);
		this.emitter.gravity = 0;
		this.emitter.setXSpeed(-25, 25);
		this.emitter.setYSpeed(-50, -50);
		this.emitter.start(false, 3000, 100);
		this.emitter.on = false;

		this.laser = this.game.add.sprite(this.game.world.centerX, 170, "laser");
		this.laser.anchor.set(.5, 1);
		this.game.physics.enable(this.laser, Phaser.Physics.ARCADE);
    	
    	this.progress0 = this.game.add.sprite(406, 675, "empty progress");
    	this.progress1 = this.game.add.sprite(406, 675, "complete progress");
    	
    	this.segments = [
    		[346, 402], [373, 335],
    		[373, 335], [545, 335],
    		[545, 335], [698, 269],
    		[304, 304], [551, 304],
    		[551, 304], [684, 244],
    		[415, 205], [389, 277],
    		[389, 277], [551, 278],
    		[551, 278], [672, 224],
    					];
    					
    	this.resetBurnProgress();

		var btn = this.game.add.sprite(this.game.world.centerX, 100, "restart button");
		btn.anchor.set(.5, .5);
		btn.inputEnabled = true;
		btn.events.onInputDown.add(this.showDownState, this);
		btn.events.onInputUp.add(this.startOver, this);
		this.startButton = btn;
		this.startButton.alpha = 0;
    	
		if (DEBUG) {
			this.game.time.advancedTiming = true;
			this.fpsText = this.game.add.text(
				970, 20, '', { font: '12px Arial', fill: '#ffffff' }
			);
		}
		
		this.completeText = this.game.add.text(this.game.world.centerX, 620, "Well Done!", { font: "bold italic 36px Arial", fill: "#d0e044" });
		this.completeText.anchor.set(.5, .5);
		this.completeText.alpha = 0;
		
		this.instructions = this.game.add.text(35, 20, "", { font: "bold 24px Arial", fill: "#d0e044" });
		this.instructions.align = "center";
		this.instructions.setText("Use your mouse or touch\nto guide the laser.");
		
		this.laserOff = true;
		
    	this.showProgress(0);				
	};
	
	GameState.prototype.resetBurnProgress = function () {
		this.status = [];
		for (var i = 0; i < this.segments.length; i += 2) {
			var n = i / 2;
			var d = Phaser.Math.distanceRounded(this.segments[i][0], this.segments[i][1], this.segments[i + 1][0], this.segments[i + 1][1]);
			this.status[n] = [];
			for (var j = 0; j < d / GameState.RESOLUTION; j++) {
				this.status[n].push(false);
			}
		}
		
		this.complete = false;
	}
	
	GameState.prototype.markSegmentBurned = function (n, d) {
		var index = Math.floor(d / GameState.RESOLUTION);
		this.status[n][index] = true;
		
		var percent = this.getBurnProgress();
		
		this.showProgress(percent);
		
//		if (percent > .1 && !this.complete) {
		if (percent > .97 && !this.complete) {
			this.showComplete();
			this.complete = true;
		}
	}
	
	GameState.prototype.showProgress = function (percent) {
		if (DEBUG) {
			this.completeText.setText(Math.round(percent * 100) + "%");
			this.completeText.alpha = 1;
		}
		
		var w = this.progress0.width * percent;
		
		var rect  = { x: 0, y: 0, width: w, height: this.progress1.height };
		this.progress1.crop(rect);
	}
	
	GameState.prototype.showComplete = function () {
		game.add.tween(this.negative).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.etched).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.unetched).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.laser).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.progress0).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.progress1).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.finished).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true)
			.to( { y: 300 }, 1000, Phaser.Easing.Cubic.EaseInOut, true);
		
		game.add.tween(this.completeText).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 1000);
		
		game.add.tween(this.instructions).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 2500);
		
		game.add.tween(this.startButton).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 2500);
	}
	
	GameState.prototype.getBurnProgress = function () {
		var total = 0, complete = 0;
		
		for (var i = 0; i < this.status.length; i++) {
			for (var j = 0; j < this.status[i].length; j++) {
				total++;
				complete += (this.status[i][j] == true);
			}
		}
		
		return complete / total;
	}
	
	// TODO: make this snap
	GameState.prototype.isOnSegment = function (pt) {
		var THRESHOLD = 15;
		
		var min_d, closest_segment, segment_index;
		for (var i = 0; i < this.segments.length; i += 2) {
			segment = [ { x: this.segments[i][0], y: this.segments[i][1] },
							{ x: this.segments[i + 1][0], y: this.segments[i + 1][1] } ];
			var d = utils.distToSegment(pt, segment[0], segment[1]);
			if (min_d == undefined || d < min_d) {
				min_d = d;
				closest_segment = segment;
				segment_index = i / 2;
			}
		}
		
		var obj = { segment: closest_segment, min_d: min_d, index: segment_index };
		
		return (min_d < THRESHOLD) ? obj : null;
	}
	
	GameState.prototype.revealEtching = function (x, y) {		
		var scaleY = y - 270;
		var yy = scaleY / 150 * 75 + 125;
		
		this.game.physics.arcade.moveToXY(this.laser, x, yy, 60, 200);
		
		this.beam.x = this.laser.x;
		this.beam.y = this.laser.y - 10;
		var rect  = { x: 0, y: 0, width: this.beam.width, height: y - this.laser.y + 10 };
		this.beam.crop(rect);
		
		var onEtching = this.isOnSegment({ x: this.laser.x, y: y });
		
		var y0 = this.laser.y + this.laser.height;
		var y1 = this.negative.y;
		var y2 = this.negative.y + this.negative.height;
		var y3 = this.unetched.y + 10;
		var y4 = this.unetched.y + 10 + this.unetched.height;
		
		var offsetY = y - y1;
		
		if (onEtching) {
			// find our distance along this segment
			var d = utils.distanceAlongSegment({ x: x, y: y }, onEtching.segment[0], onEtching.segment[1]);
			this.markSegmentBurned(onEtching.index, d);
				
			var etchX = Math.floor(this.laser.x - this.etched.width * .5);
			var etchY = y3 + offsetY - 15;
			
			var area = new Phaser.Rectangle(etchX - 10, offsetY - 15, 20, 20);
			this.etchedData.copyPixels("etched", area, etchX - 10, offsetY - 15);
			
			area.y += 1;
			fillRGB.call(this.unetchedData, 255, 0, 0, 0, area);
			
			this.emitter.x = this.laser.x;
			this.emitter.y = etchY;
			this.emitter.on = etchY > y2;

			this.glow.x = this.laser.x;
			this.glow.y = etchY;
			this.glow.alpha = etchY > y2 || etchY < y2 - 20 ? 1 : 0;
				
			if (etchY > y2) {
				this.lower_beam.x = this.laser.x;
				this.lower_beam.y = y2;
				var rect = { x: 0, y: 0, width: this.lower_beam.width, height: etchY - y2 };
				this.lower_beam.crop(rect);
				this.lower_beam.alpha = 1;				
			} else {
				this.lower_beam.alpha = 0;
			}
		} else {
			this.lower_beam.alpha = 0;
			this.emitter.on = false;
		}
	}

	// The update() method is called every frame
	GameState.prototype.update = function () {
		if (DEBUG && this.game.time.fps !== 0) {
			this.fpsText.setText(this.game.time.fps + ' FPS');
		}
		
//		console.log(this.game.input.x + ", " + this.game.input.y);
		
		if (!this.complete && this.game.input.mousePointer.isDown) {
			if (this.laserOff) {
				// TODO: animate laser on
				this.laserOff = false;
				this.beam.alpha = this.lower_beam.alpha = 1;
				this.emitter.on = true;
			}
			
			var xx = this.game.input.x, yy = this.game.input.y;
			
			// don't let the laser go off the bounds of the etching
			// right side:
			var p = { x: xx, y: yy };
			var v = { x: 664, y: 203 };
			var w = { x: 772, y: 404 };
			var side = utils.sideOfLineSegment(p, v, w);
			if (side < 0) {
				var pt = utils.closestPointAlongSegment(p, v, w);
				xx = pt.x;
				yy = pt.y;
			}
			// left side:
			v = { x: 253, y: 404 }, w = { x: 352, y: 204 };
			var side = utils.sideOfLineSegment(p, v, w);
			if (side < 0) {
				var pt = utils.closestPointAlongSegment(p, v, w);
				xx = pt.x;
				yy = pt.y;
			}
			
			if (yy > 404) yy = 404;
			else if (yy < 203) yy = 203;
			
			if (xx < 253) xx = 253;
			else if (xx > 772) xx = 772;
			
			this.glow.x = this.laser.x;
			this.glow.y = yy;
			this.glow.alpha = 1;
			
			this.revealEtching(xx, yy);
		} else if (!this.laserOff) {
			// TOOD: animate laser off
			this.laserOff = true;
			this.beam.alpha = this.lower_beam.alpha = this.glow.alpha = 0;
			this.laser.body.velocity.set(0, 0);
			this.emitter.on = false;
		}
	};

	GameState.prototype.showDownState = function () {
		this.startButton.loadTexture("restart button down");
	}
	
	GameState.prototype.startOver = function () {
		this.game.state.start("game", true, true);		
	}
	
	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);

	function fillRGB (r1, g1, b1, a1, region) {
		var sx = 0;
		var sy = 0;
		var w = this.width;
		var h = this.height;

		if (region !== undefined && region instanceof Phaser.Rectangle)
		{
			sx = region.x;
			sy = region.y;
			w = region.width;
			h = region.height;
		}

		for (var y = 0; y < h; y++)
		{
			for (var x = 0; x < w; x++)
			{
				this.setPixel32(sx + x, sy + y, r1, g1, b1, a1, false);
			}
		}

		this.context.putImageData(this.imageData, 0, 0);
		this.dirty = true;
	}

});
