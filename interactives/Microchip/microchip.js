requirejs.config({
	baseUrl: "js",
	paths: {
		"Phaser": "../../Common/js/phaser.min",
		"utils": "../../Common/js/utils"
	},
	
	shim: {
	},
});

require(["Phaser", "utils"], function (Phaser, utils) {
	var GameState = function (game) {
		GameState.RESOLUTION = 20;
	};

	// Load images and sounds
	GameState.prototype.preload = function () {
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
		this.game.load.image("smoke", "assets/smoke.png");
		this.game.load.image("glow", "assets/laser_glowpoint.png");
		this.game.load.image("finished", "assets/finished_chip.png");
		this.game.load.image("empty progress", "assets/progress_empty.png");
		this.game.load.image("complete progress", "assets/progress_complete.png");
	};

	// Setup the example
	GameState.prototype.create = function () {
		// Set stage background color
		this.game.stage.backgroundColor = 0xe02020;//0x4488cc;

//		this.game.add.sprite(300, 400, "etched");
		this.unetched = this.game.add.sprite(300, 400, "unetched");
		this.finished = this.game.add.sprite(300, 416, "finished");
		this.finished.alpha = 0;
		var etching = this.game.add.group();
		//this.game.add.sprite(300, 260, "negative base");
		this.negatives = [];
		this.negatives.push(this.game.add.sprite(412, 260, "negative4"));
		this.negatives.push(this.game.add.sprite(340, 260, "negative3"));
		this.negatives.push(this.game.add.sprite(300, 292, "negative2"));
		this.negatives.push(this.game.add.sprite(375, 313, "negative1"));
		this.laser = this.game.add.sprite(425, 170, "laser");
		this.laser.anchor.set(.5, 1);
		this.game.physics.enable(this.laser, Phaser.Physics.ARCADE);

		this.bmd = game.make.bitmapData(game.cache.getImage("etched").width, game.cache.getImage("etched").height);
		this.etched = new Phaser.Sprite(this.game, 299, 401, this.bmd);

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
    	
    	this.progress0 = this.game.add.sprite(430, 660, "empty progress");
    	this.progress1 = this.game.add.sprite(430, 660, "complete progress");
    	
    	this.segments = [
    		[377, 425], [400, 370],
    		[400, 370], [538, 370],
    		[538, 370], [659, 316],
    		[343, 345], [541, 344],
    		[541, 344], [648, 295],
    		[432, 263], [410, 323],
    		[410, 323], [540, 323],
    		[540, 323], [640, 280],
    					];
    					
    	this.resetBurnProgress();
    	
		this.game.time.advancedTiming = true;
		this.fpsText = this.game.add.text(
			970, 20, '', { font: '12px Arial', fill: '#ffffff' }
		);
		
		this.completeText = this.game.add.text(20, 20, "", { font: "12px Arial", fill: "#ffffff" });
		
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
		
		if (percent > .1 && !this.complete) {
//		if (percent == 1 && !this.complete) {
			this.showComplete();
			this.complete = true;
		}
	}
	
	GameState.prototype.showProgress = function (percent) {
		this.completeText.setText(Math.round(percent * 100) + "%");
		
		var w = this.progress0.width * percent;
		
		var rect  = { x: 0, y: 0, width: w, height: this.progress1.height };
		this.progress1.crop(rect);
	}
	
	GameState.prototype.showComplete = function () {
		for (var i = 0; i < this.negatives.length; i++) {
			game.add.tween(this.negatives[i]).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		}
		game.add.tween(this.etched).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.unetched).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.laser).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		game.add.tween(this.finished).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);
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
	
	GameState.prototype.isOnSegment = function (pt) {
		var THRESHOLD = 5;
		
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
		this.beam.y = this.laser.y - 1;
		var rect  = { x: 0, y: 0, width: this.beam.width, height: y - this.laser.y - 1 };
		this.beam.crop(rect);
		
		var onEtching = this.isOnSegment({ x: x, y: y });

		if (onEtching) {
			// find our distance along this segment
			var d = utils.distanceAlongSegment({ x: x, y: y }, onEtching.segment[0], onEtching.segment[1]);
			this.markSegmentBurned(onEtching.index, d);
				
			var etchX = this.laser.x - 300, etchY = y - 260;
			var area = new Phaser.Rectangle(etchX - 10, etchY - 10, 20, 20);
			this.bmd.copyPixels("etched", area, etchX - 10, etchY - 10);
		
			this.emitter.x = this.laser.x;
			this.emitter.y = etchY + 400;
			this.emitter.on = etchY > 40;

			this.glow.x = this.laser.x;
			this.glow.y = etchY + 400;
			this.glow.alpha = etchY + 400 > 435 ? 1 : 0;
				
			if (etchY + 400 > 435 && etchY > 40) {
				this.lower_beam.x = this.laser.x;
				this.lower_beam.y = 435;
				var rect = { x: 0, y: 0, width: this.lower_beam.width, height: etchY - 40 };
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
	GameState.prototype.update = function() {
		if (this.game.time.fps !== 0) {
			this.fpsText.setText(this.game.time.fps + ' FPS');
		}
		
		if (!this.complete && this.game.input.mousePointer.isDown) {
			if (this.laserOff) {
				// TODO: animate laser on
				this.laserOff = false;
				this.beam.alpha = this.lower_beam.alpha = 1;
				this.emitter.on = true;
			}
			
			var xx = this.game.input.x, yy = this.game.input.y;
			
			// don't let the laser go off the bounds of the etching
			var p = { x: xx, y: yy };
			var v = { x: 631, y: 263 };
			var w = { x: 718, y: 426 };
			var side = utils.sideOfLineSegment(p, v, w);
			if (side < 0) {
				var pt = utils.closestPointAlongSegment(p, v, w);
				xx = pt.x;
				yy = pt.y;
			}
			v = { x: 300, y: 426 }, w = { x: 384, y: 264 };
			var side = utils.sideOfLineSegment(p, v, w);
			if (side < 0) {
				var pt = utils.closestPointAlongSegment(p, v, w);
				xx = pt.x;
				yy = pt.y;
			}
			
			if (yy > 426) yy = 426;
			else if (yy < 263) yy = 263;
			
			if (xx < 304) xx = 304;
			else if (xx > 718) xx = 718;
			
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
	
	var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');
	game.state.add('game', GameState, true);	
});
