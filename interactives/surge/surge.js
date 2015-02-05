var stage, frontLayer, consoleLayer, backLayer;
var game;

var UPDATE_TIME = 1 / 30;

var images = {};

var frames = 0;

var incoming = [
				{ x: 172, y: 38 },
				{ x: 206, y: 50 },
				{ x: 226, y: 79 },
				{ x: 234, y: 104 },
				{ x: 247, y: 170 },
				{ x: 256, y: 188 },
				{ x: 284, y: 215 },
				{ x: 402, y: 274 },
				{ x: 453, y: 293 },
				{ x: 463, y: 297 },
				{ x: 495, y: 318 },
				{ x: 588, y: 391 },
				{ x: 602, y: 407 },
				{ x: 608, y: 421 },
				{ x: 750, y: 539 },
				{ x: 780, y: 592 },
				{ x: 804, y: 616 },
				{ x: 844, y: 641 },
				{ x: 860, y: 643 },
				{ x: 875, y: 635 },
				{ x: 883, y: 610 },
				{ x: 883, y: 573 },
			];

var shuntPath = [
			// 0
			[
				{ x: 532, y: 321 },
				{ x: 552, y: 312 },
				{ x: 558, y: 311 },
				{ x: 841, y: 523 },
				{ x: 952, y: 609 },
				{ x: 957, y: 619 },
				{ x: 956, y: 624 },
				{ x: 947, y: 635 },
				{ x: 933, y: 646 },
				{ x: 892, y: 667 },
				{ x: 879, y: 669 },
				{ x: 872, y: 662 },
				{ x: 868, y: 644 },
				{ x: 865, y: 630 },
				{ x: 851, y: 600 },
			],
			// 1
			[
				{ x: 553, y: 334 },
				{ x: 565, y: 329 },
				{ x: 573, y: 321 },
				{ x: 841, y: 523 },
				{ x: 952, y: 609 },
				{ x: 957, y: 619 },
				{ x: 956, y: 624 },
				{ x: 947, y: 635 },
				{ x: 933, y: 646 },
				{ x: 892, y: 667 },
				{ x: 879, y: 669 },
				{ x: 872, y: 662 },
				{ x: 868, y: 644 },
				{ x: 865, y: 630 },
				{ x: 851, y: 600 },
			],
			// 2
			[
				{ x: 571, y: 347 },
				{ x: 584, y: 342 },
				{ x: 590, y: 333 },
				{ x: 841, y: 523 },
				{ x: 952, y: 609 },
				{ x: 957, y: 619 },
				{ x: 956, y: 624 },
				{ x: 947, y: 635 },
				{ x: 933, y: 646 },
				{ x: 892, y: 667 },
				{ x: 879, y: 669 },
				{ x: 872, y: 662 },
				{ x: 868, y: 644 },
				{ x: 865, y: 630 },
				{ x: 851, y: 600 },
			],
			// 3
			[
				{ x: 589, y: 360 },
				{ x: 603, y: 354 },
				{ x: 606, y: 345 },
				{ x: 841, y: 523 },
				{ x: 952, y: 609 },
				{ x: 957, y: 619 },
				{ x: 956, y: 624 },
				{ x: 947, y: 635 },
				{ x: 933, y: 646 },
				{ x: 892, y: 667 },
				{ x: 879, y: 669 },
				{ x: 872, y: 662 },
				{ x: 868, y: 644 },
				{ x: 865, y: 630 },
				{ x: 851, y: 600 },
			],
			// 4
			[
				{ x: 595, y: 377 },
				{ x: 616, y: 369 },
				{ x: 621, y: 362 },
				{ x: 623, y: 358 },
				{ x: 841, y: 523 },
				{ x: 952, y: 609 },
				{ x: 957, y: 619 },
				{ x: 956, y: 624 },
				{ x: 947, y: 635 },
				{ x: 933, y: 646 },
				{ x: 892, y: 667 },
				{ x: 879, y: 669 },
				{ x: 872, y: 662 },
				{ x: 868, y: 644 },
				{ x: 865, y: 630 },
				{ x: 851, y: 600 },
			],
		];
			
// normal:
var RATE = 200, SURGE_RATE = .205;
// show:
//var RATE = 50, SURGE_RATE = .0505;

function BlockMove (event) {
	// Tell Safari not to move the window.
	event.preventDefault();
}

function loadImages (sources, callback) {
	var loadedImages = 0;
	var numImages = 0;
	
	// get num of sources
	for (var src in sources) {
		numImages++;
	}
	
	for (var src in sources) {
		images[src] = new Image();
		images[src].onload = function () {
			if (++loadedImages >= numImages) {
				callback();
			}
		};
		images[src].src = sources[src];
	}
}

function drawRotatedImage (context, image, angleInRadians, x, y, w, h) {
	var width = w == undefined ? image.width : w;
	var height = h == undefined ? image.height : h;
	
	context.translate(x, y);
	context.rotate(angleInRadians);
	context.drawImage(image, -width * .5, -height * .5, width, height);
	context.rotate(-angleInRadians);
	context.translate(-x, -y);
}

$(document).ready(function () {
	initialize();
});

function GetPos (e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft	+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	var pos = {x: posx, y: posy};
	return pos;
}

function getInitialPower () {
	var AMPLITUDE = 5, RANGE = 10;
	return AMPLITUDE + Math.random() * RANGE;
}

function initialize () {
	var sources = {
		background: "surge.jpg",
		noise: "noise.png",
		foreground: "foreground.png",
		varistor: "varistor.png",
		varistor_fix: "varistor_fix.png",
		hot_fuse: "hot_fuse.png",
		burnt_fuse: "burnt_fuse.png",
		smoke: "smoke.png",
		bolt: "bolt.png",
		startOver: "startoverbutton.png",
	};

	loadImages(sources, begin);
	
	stage = new Kinetic.Stage({
		container: "kinetic",
		width: 1024,
		height: 768
	});
	
	backLayer = new Kinetic.Layer();
	stage.add(backLayer);
	
	consoleLayer = new Kinetic.Layer();
	consoleLayer.afterDraw(drawStripNoise);
	stage.add(consoleLayer);
	
	frontLayer = new Kinetic.Layer( { listening: false } );
	frontLayer.afterDraw(drawFuseSmoke);
	stage.add(frontLayer);

	stage.onFrame(updateStage);
	
	stage.setThrottle(30);		// improves performance when dragging (by cutting down on mouse events, presumably)
	
	stage.start();
	
	setInterval(drawFPS, 1000);
	
	// sound support: iBooks only plays one sound; stops others
//	document.getElementById('buzz').addEventListener('ended', function() { playBackgroundHum(); }, false);
//	document.getElementById('choke').addEventListener('ended', function() { playBackgroundHum(); }, false);
}

function playBackgroundHum () {
	if (!game.failed)
		document.getElementById('hum').play();
}

function begin () {
	game = new Game();
	game.initialize();

	game.begin();
}

function stop () {
	game.stop();
	stage.stop();
}

function updateStage (frame) {
	frames++;
	
	if (game)
		game.update(frame.timeDiff / 1000);
	
	stage.draw();
}

function drawFPS () {
	$("#fps").text(frames + " fps");
	frames = 0;
}

function Game (params) {
	this.nextAmps = [];
	this.currentElapsed = 0;
}

Game.prototype = {
	initialize: function () {
		var image = new Kinetic.Image( { x: 0, y: 0, image: images.background });
		backLayer.add(image);
		
		this.gen = new Generator();
		this.gen.initialize();
		
		this.varistors = new Varistors();
		this.varistors.initialize();
		
		this.fuse = new Fuse();
		this.fuse.initialize();

		var image = new Kinetic.Image( { x: 0, y: 0, image: images.foreground });
		frontLayer.add(image);
		
		this.strip = new Strip( {
									signals: [
										{ pos: .44, id: "varistor1" },
										{ pos: .45, id: "varistor2" },
										{ pos: .46, id: "varistor3" },
										{ pos: .48, id: "varistor4" },
										{ pos: .49, id: "varistor5" },
										{ pos: .6, id: "fuse" },
									]
								} );
		this.strip.initialize();
		
		this.shunt = [];
		for (var i = 0; i < 5; i++) {
			this.shunt[i] = new Circuit( { path: shuntPath[i] } );
			this.shunt[i].initialize();
		}
		
		var button = new Kinetic.Image( { x: 900, y: 10, image: images.startOver } );
		button.on("tap click", function () { game.restart(); } );
		consoleLayer.add(button);
	},
	
	begin: function () {
		this.failed = false;
	},
	
	restart: function () {
		this.nextAmps = [];
		this.failed = false;
		
		this.gen.restart();
		this.varistors.restart();
		this.fuse.restart();
		this.strip.restart();
		for (var i = 0; i < 5; i++) {
			this.shunt[i].restart();
		}
		
		document.getElementById('hum').play();
	},

	stop: function () {
		document.getElementById('hum').pause();
	},
	
	update: function (elapsed) {
		this.currentElapsed += elapsed;
		
		while (this.currentElapsed > UPDATE_TIME) {
			elapsed = UPDATE_TIME;
			
			this.gen.update(elapsed);
			this.strip.update(elapsed);
			for (var i = 0; i < 5; i++) {
				this.shunt[i].update(elapsed);
			}
			this.varistors.update(elapsed);
			this.fuse.update(elapsed);	
			
			this.currentElapsed -= UPDATE_TIME;
		}
	},
	
	setNextAmplitude: function (amp) {
		this.nextAmps.unshift(amp);
	},
	
	getNextAmplitude: function () {
		if (this.nextAmps.length > 0) {
			return this.nextAmps.pop();
		} else {
			console.log("OUT!");
			return { amp: getInitialPower(), noise: 0 };
		}
	},

	surgeAt: function (pos, id, amplitude) {
		switch (id) {
			case "varistor1":
				var r = this.varistors.overload(1, amplitude);
				if (r.handled) this.shunt[0].surge(.25);
				return r;
			case "varistor2":
				var r = this.varistors.overload(2, amplitude);
				if (r.handled) this.shunt[1].surge(.25);
				return r;
			case "varistor3":
				var r = this.varistors.overload(3, amplitude);
				if (r.handled) this.shunt[2].surge(.25);
				return r;
			case "varistor4":
				var r = this.varistors.overload(4, amplitude);
				if (r.handled) this.shunt[3].surge(.25);
				return r;
			case "varistor5":
				var r = this.varistors.overload(5, amplitude);
				if (r.handled) this.shunt[4].surge(.25);
				return r;
			case "fuse":
				return this.fuse.overload(amplitude);
		}
	},
	
	fail: function () {
		if (!this.failed) {
			this.strip.fail();
			this.failed = true;
		}
	}
}

function Generator (params) {
	this.levels = [];
	this.noises = [];
	this.x = 25;
	this.y = 450;
	this.width = 400;
	this.height = 280;
	
	this.flip = false;
	
	this.spikeUp = this.spikeDown = 0;
	this.noiseLevel = 0;
	
	this.touchStartPos = { x: 0, y: 0 };
	this.touchLastPos = { x: 0, y: 0 };
}

Generator.prototype = {
	initialize: function () {
		var me = this;
		
		this.offsetX = 0;
		
		var rect = new Kinetic.Rect( { x: this.x, y: this.y, width: this.width, height: this.height, fill: "black" } );
		rect.on("touchstart mousedown", function (event) { me.onTouchGeneratorStart(event); } );
		rect.on("touchmove mousemove", function (event) { me.onTouchGeneratorMove(event); } );
		rect.on("touchend mouseup", function (event) { me.onTouchGeneratorEnd(event); } );
		consoleLayer.add(rect);
		
		this.power = new Kinetic.Shape( { listening: false } );
		this.power.setDrawFunc(function () { me.drawPower(); } );
		consoleLayer.add(this.power);
		
		this.initializePower();
	},

	initializePower: function () {
		for (var i = 0; i < 22; i++) {
			var y = this.getNextAmplitude();
			this.levels.push( { amp: y, noise: 0 } );
		}
	},
	
	restart: function () {
		this.levels = [];
		this.noises = [];
		this.initializePower();
		this.spikeUp = this.spikeDown = 0;
		this.noiseLevel = 0;
		this.flip = false;
	},
	
	getNextAmplitude: function () {
		var MAX_SPIKE = 160;
		
		var val = getInitialPower();
		
		if (this.flip) {
			val *= -1;
			var curSpike = Math.min(this.spikeUp, MAX_SPIKE);
			this.spikeUp -= curSpike;
			val -= curSpike;
		} else {
			var curSpike = Math.min(this.spikeDown, MAX_SPIKE);
			this.spikeDown -= curSpike;
			val += curSpike;
		}
		
		this.flip = !this.flip;
		
		return val;
	},
	
	addNoise: function () {
		if (this.noiseLevel > 10) {
			if (this.offsetX > 5 && this.offsetX < 15) {
				// find slope of last line
				// add image to current point on that line
				var n = this.levels.length - 1;
				var y0 = this.levels[n - 1].amp;
				var y1 = this.levels[n].amp;
				var slope = (y1 - y0) / 20;
				var yy = y0 + slope * this.offsetX + 2;
				var angle = Math.atan2(y1 - y0, 20);
				this.noises.push({ x: this.width, y: this.height * .5 + yy, angle: angle });
				this.noiseLevel -= 10;
				this.levels[n - 1].noise += 10;	
			}
		}
	},
	
	update: function (elapsed) {
		var pixels = elapsed * RATE;
		
		this.addNoise();
		
		this.offsetX += pixels;
		
		while (this.offsetX > 20) {
			this.offsetX -= 20;
			game.setNextAmplitude(this.levels[0]);
			this.levels.splice(0, 1);
			this.levels.push( { amp: this.getNextAmplitude(), noise: 0 } );
		}

		var i = 0;
		while (i < this.noises.length) {
			this.noises[i].x -= pixels;
			if (this.noises[i].x < this.x - 40) {
				this.noises.splice(i, 1);
			} else
				i++;
		}		
	},
	
	drawPower: function () {
		var context = consoleLayer.getContext();
		
		context.rect(this.x, this.y, this.width, this.height);
		context.save();
		context.clip();
		
		context.beginPath();
		
		context.lineWidth = 4;
		context.strokeStyle = "#ffff00";
		context.lineCap = "butt";
		
		for (var i = 0; i < 22; i++) {
			if (i == 0)
				context.moveTo(this.x - this.offsetX + (i * 20), this.y + this.height * .5 + this.levels[i].amp * .75);
			else
				context.lineTo(this.x - this.offsetX + (i * 20), this.y + this.height * .5 + this.levels[i].amp * .75);
		}
		
		context.stroke();
		
		for (var i = 0; i < this.noises.length; i++) {
			drawRotatedImage(context, images.noise, this.noises[i].angle, this.x + this.noises[i].x, this.y + this.noises[i].y - 10);
		}
		
		context.restore();
	},
	
	onTouchGeneratorStart: function (event) {
		this.spiking = true;
		
		var touchPos;
		if (event.type == "mousedown") {
			touchPos = { x: event.x, y: event.y }
		} else {
			touchPos = stage.getTouchPosition();
		}
		
		this.touchStartPos = { x: touchPos.x, y: touchPos.y };
		this.touchLastPos = { x: touchPos.x, y: touchPos.y };
	},
	
	onTouchGeneratorMove: function (event) {
		if (!this.spiking) return;
		
		var touchPos;
		
		if (event.type == "mousemove") {
			touchPos = { x: event.x, y: event.y };
		} else {
			touchPos = stage.getTouchPosition();
		}
		
		if (touchPos.y > this.touchLastPos.y) {
			this.spikeDown += touchPos.y - this.touchLastPos.y;
		} else {
			this.spikeUp += this.touchLastPos.y - touchPos.y;
		}
		
		if (touchPos.x != this.touchLastPos.x) {
			var dx = Math.abs(touchPos.x - this.touchLastPos.x);
			if (dx > 5) {
				this.noiseLevel += dx;
				this.noiseLevel = Math.min(this.noiseLevel, 100);
			}
		}
		
		this.touchLastPos.x = touchPos.x;
		this.touchLastPos.y = touchPos.y;		
	},
	
	onTouchGeneratorEnd: function (event) {
		this.spiking = false;
	},
}

function drawStripNoise () {
	if (game && game.strip)
		game.strip.drawNoiseWithContext();
}

function drawFuseSmoke () {
	if (game && game.fuse)
		game.fuse.drawSmoke();
}

function Circuit (params) {
	this.initialized = false;
	this.numberOfPoints = params.numberOfPoints == undefined ? 40 : params.numberOfPoints;
	this.flowRate = .5;
	this.path = params.path;
	this.amps = [];
	this.flip = false;
}

Circuit.prototype = {
	initialize: function () {
		this.energyLine = new Kinetic.Line( { points: [0, 0] } );
		this.energyLine.setStroke("#baebe4");
		this.energyLine.setStrokeWidth(3);
		// add a shadow if we can get away with it
		this.energyLine.setShadow({
			color: 'yellow',
			blur: 10,
			offset: [0, 0],
			alpha: 1.0
		});
		this.energyLine.hide();
		this.energyLine.setAlpha(0);
  		consoleLayer.add(this.energyLine);
		
		this.preComputeLengthsAndAngles();
		
		this.restart();
		/*
		this.setupAmplitudes();
		this.setupPoints();
				
		this.curTime = this.surgeTime = 0;
		this.generatingTime = 0;
		*/
		this.initialized = true;
	},
	
	restart: function () {
		this.setupAmplitudes();
		this.setupPoints();
		
		this.curTime = this.surgeTime = 0;
		this.generatingTime = 0;
		this.energyLine.hide();
		this.energyLine.setAlpha(0);
	},
	
	surge: function (time) {
		this.generatingTime = time;
		
		if (this.surgeTime > 0)
			this.surgeTime = Math.max(this.surgeTime, time);
		else {
			this.surgeTime = time;
			this.curTime = 0;
		}
	},
	
	update: function (elapsed) {
		var FADE_IN_TIME = .25, FADE_OUT_TIME = 1.0;
		
		if (!this.initialized) return;
		
		if (this.generatingTime > 0) {
			this.generatingTime -= elapsed;
		
			if (!this.energyLine.isVisible())
				this.energyLine.show();
				
			var alpha = this.energyLine.getAlpha();
			
			if (alpha < 1.0) alpha += elapsed * (1.0 / FADE_IN_TIME);
			
			this.energyLine.setAlpha(Math.min(1.0, alpha));
		} else {
			var alpha = this.energyLine.getAlpha();
			
			if (alpha > 0) {
				alpha -= elapsed * (1.0 / FADE_OUT_TIME);
			
				this.energyLine.setAlpha(Math.max(0, alpha));
				
				if (alpha <= 0) {
					this.energyLine.hide();
					
					// reset the amplitudes so they're flat when another surge comes through
					this.setupAmplitudes();
				}
			}
		}
		
		if (!this.energyLine.isVisible()) return;
			
		// update fast enough so that we don't end up with a backlog of generator data
		this.updatePoints(elapsed * this.flowRate);
	},
	
	setupAmplitudes: function () {
		var tPerPoint = 1.0 / this.numberOfPoints;
		
		for (var i = 0; i < this.numberOfPoints; i++) {
			amplitude = 0;
			this.amps[i] = { t: i * tPerPoint, amplitude: amplitude };
		}
	},
	
	getNextPower: function () {
		if (this.generatingTime <= 0)
			return 0;
			
		var p = getInitialPower() * .5;
		
		if (this.flip) p = -p;
		
		this.flip = !this.flip;
		
		return p;
	},
	
	updatePoints: function (interval) {
		var tPerPoint = 1.0 / this.numberOfPoints;
		
		var points = [];
		
		// start at the outlet
		points.push( { x: this.path[0].x, y: this.path[0].y } );
		
		for (var i = 0; i < this.amps.length; i++) {
			this.amps[i].t += interval;
			var t = this.amps[i].t;
			
			if (t > 1.0) {
				// get the next amplitude from the generator queue
				this.amps.splice(i, 1);
				var amp = this.getNextPower();
				for (var j = i; j > 0; j--) {
					this.amps[j] = this.amps[j - 1];
				}
				
				this.amps[0] = { t: t - 1.0, amplitude: amp };
			} else {
				// find out where to draw this point
				var pt = this.getAmpedPointAtT(t, this.amps[i].amplitude);
				points.push(pt);
			}
		}
		
		// end at the surge protector outlet
		points.push( { x: this.path[this.path.length - 1].x, y: this.path[this.path.length - 1].y } );
		
		this.energyLine.setPoints(points);		
	},
	
	getAmpedPointAtT: function (t, amplitude) {
		if (t < 0) t = 0;
		else if (t > 1.0) t = 1.0;
		
		var pt = this.findPointAlongPath(t);
		var angle = this.findAngleAlongPath(t) + Math.PI * .5;
		
		var newx, newy;
		
		if (t == 0 || t == 1.0) {
			newx = pt.x;
			newy = pt.y;
		} else {
			newx = pt.x + Math.cos(angle) * amplitude;
			newy = pt.y + Math.sin(angle) * amplitude;
		}
		
		return { x: newx, y: newy };
	},
	
	setupPoints: function () {
		var tPerPoint = 1.0 / this.numberOfPoints;
		
		this.basePoints = [];
		this.energyPoints = [];
		
		for (var i = 0; i <= this.numberOfPoints; i++) {
			var t = i * tPerPoint;
			var pt = this.findPointAlongPath(t);
			var angle = this.findAngleAlongPath(t);
			this.basePoints[i] = { x: pt.x, y: pt.y, angle: angle };
			
			var amplitude = this.getNextPower() * .5;
			var theta = angle;
			
			if (i == 0 || i == this.numberOfPoints) {
				newx = pt.x;
				newy = pt.y;
			} else {
				newx = pt.x + Math.cos(theta) * amplitude;
				newy = pt.y + Math.sin(theta) * amplitude;
			}
			
			this.energyPoints[i] = { x: newx, y: newy };
		}
		
		this.energyLine.setPoints(this.energyPoints);
	},
	
	findPointAlongPath: function (t) {
		for (var i = 0; i < this.data.length; i++) {
			var d = this.data[i];
			if (d.startT <= t && t <= d.endT) {
				// find exact point
				var subt = (t - d.startT) / (d.endT - d.startT);
				var x1 = this.path[i + 1].x, y1 = this.path[i + 1].y;
				var x0 = this.path[i].x, y0 = this.path[i].y;
				var xx = x0 + (x1 - x0) * subt;
				var yy = y0 + (y1 - y0) * subt;
				return { x: xx, y: yy };
			}
		}
	},
	
	findAngleAlongPath: function (t) {
		for (var i = 0; i < this.data.length; i++) {
			var d = this.data[i];
			if (d.startT <= t && t <= d.endT) {
				return this.data[i].angle;
			}
		}
	},
	
	preComputeLengthsAndAngles: function () {
		this.data = [];
		
		this.totalLength = 0;
		for (var i = 0; i < this.path.length - 1; i++) {
			var x0 = this.path[i].x, y0 = this.path[i].y;
			var x1 = this.path[i + 1].x, y1 = this.path[i + 1].y;
			this.data[i] = {};
			this.data[i].angle = Math.atan2(y1 - y0, x1 - x0);
			this.data[i].length = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
			this.totalLength += this.data[i].length;
		}
		
		var tt = 0;
		for (var i = 0; i < this.path.length - 1; i++) {
			this.data[i].startT = tt;
			this.data[i].endT = tt + this.data[i].length / this.totalLength;
			tt = this.data[i].endT;
		}
		
		// circumvent the rounding error
		this.data[this.path.length - 2].endT = 1.0;
	},
}

function Strip (params) {
	this.initialized = false;
	
	this.NUMBER_OF_POINTS = 50;
	
	this.amps = [];
	this.noises = [];
	
	this.signals = params.signals;
	
	this.mode = "";
}

Strip.prototype = {
	initialize: function () {
		this.energyLine = new Kinetic.Line( { points: [0, 0] } );
		this.energyLine.setStroke("yellow");
		this.energyLine.setStrokeWidth(4);
		// add a shadow if we can get away with it
		this.energyLine.setShadow({
			color: 'orange',
			blur: 25,
			offset: [0, 0],
			alpha: 1.0
		});
  		consoleLayer.add(this.energyLine);
		
		this.bolt = new Kinetic.Image( { x: 742, y: 530, image: images.bolt, listening: false } );
		this.bolt.setOffset(26, 0);
		this.bolt.hide();
		frontLayer.add(this.bolt);
		
		this.preComputeLengthsAndAngles();
		
		this.setupAmplitudes();
		this.setupPoints();
		
		this.initialized = true;
		
		this.mode = "";
	},
	
	restart: function () {
		this.setupAmplitudes();
		this.setupPoints();
		
		this.energyLine.setAlpha(1);
		
		this.mode = "";
	},
	
	update: function (elapsed) {
		if (!this.initialized) return;
		
		if (this.mode == "failed") return;
		
		// update fast enough so that we don't end up with a backlog of generator data
		this.updatePoints(elapsed * SURGE_RATE);
	},
	
	setupAmplitudes: function () {
		var tPerPoint = 1.0 / this.NUMBER_OF_POINTS;
		
		var flip = false;
		
		for (var i = 0; i < this.NUMBER_OF_POINTS; i++) {
			amplitude = getInitialPower() * .5;
			if (flip) amplitude = -amplitude;
			this.amps[i] = { t: i * tPerPoint, amplitude: amplitude };
			flip = !flip;
		}
	},
	
	updatePoints: function (interval) {
		var VARISTOR_STRENGTH = 15.0;
		
		var tPerPoint = 1.0 / this.NUMBER_OF_POINTS;
		
		var points = [];
		
		// start at the outlet
		points.push( { x: incoming[0].x, y: incoming[0].y } );
		
		// reset the signal points (for the MOVs)
		for (var j = 0; j < this.signals.length; j++) {
			this.signals[j].handled = false;
		}
		
		for (var i = 0; i < this.amps.length; i++) {
			this.amps[i].t += interval;
			var t = this.amps[i].t;
			
			// check to see if we need to divert to an MOV
			if (Math.abs(this.amps[i].amplitude) > VARISTOR_STRENGTH) {
				for (var j = 0; j < this.signals.length; j++) {
					if (!this.signals[j].handled && t > this.signals[j].pos) {
						var obj = game.surgeAt(t, this.signals[j].id, this.amps[i].amplitude);
						if (obj.handled) {
							this.signals[j].handled = true;
							this.amps[i].amplitude = obj.newVal;
							break;
						}
					}
				}
			}
		}
		
		var i = 0;
		while (i < this.amps.length) {
			var t = this.amps[i].t;
			
			if (t > 1.0) {
				// get the next amplitude from the generator queue
				this.amps.splice(i, 1);
				var obj = game.getNextAmplitude();
				var amp = obj.amp * .5;
				var noise = Math.floor(obj.noise / 10);
				for (var j = i; j > 0; j--) {
					this.amps[j] = this.amps[j - 1];
				}
				
				var noises = [];
				for (var j = 0; j < noise; j++) {
					noises.push(Math.random());
				}
				this.amps[0] = { t: t - 1.0, amplitude: amp, noises: noises };
			} else
				i++;
		}
		
		for (var i = 0; i < this.amps.length; i++) {
			var t = this.amps[i].t;
			
			// find out where to draw this point
			var pt = this.getAmpedPointAtT(t, this.amps[i].amplitude);
			points.push(pt);
		}
		
		// end at the surge protector outlet
		points.push( { x: incoming[incoming.length - 1].x, y: incoming[incoming.length - 1].y } );
		
		this.energyLine.setPoints(points);		
	},
	
	getAmpedPointAtT: function (t, amplitude) {
		if (t < 0) t = 0;
		else if (t > 1.0) t = 1.0;
		
		var pt = this.findPointAlongPath(t);
		var angle = this.findAngleAlongPath(t) + Math.PI * .5;
		
		var newx, newy;
		
		if (t == 0 || t == 1.0) {
			newx = pt.x;
			newy = pt.y;
		} else {
			newx = pt.x + Math.cos(angle) * amplitude;
			newy = pt.y + Math.sin(angle) * amplitude;
		}
		
		return { x: newx, y: newy };
	},
	
	setupPoints: function () {
		var tPerPoint = 1.0 / this.NUMBER_OF_POINTS;
		
		this.basePoints = [];
		this.energyPoints = [];
		
		var flip = false;
		
		for (var i = 0; i <= this.NUMBER_OF_POINTS; i++) {
			var t = i * tPerPoint;
			var pt = this.findPointAlongPath(t);
			var angle = this.findAngleAlongPath(t);
			this.basePoints[i] = { x: pt.x, y: pt.y, angle: angle };
			
			var amplitude = getInitialPower();
			var theta = angle + (flip ? Math.PI * .5 : -Math.PI * .5);
			
			if (i == 0 || i == this.NUMBER_OF_POINTS) {
				newx = pt.x;
				newy = pt.y;
			} else {
				newx = pt.x + Math.cos(theta) * amplitude;
				newy = pt.y + Math.sin(theta) * amplitude;
			}
			
			this.energyPoints[i] = { x: newx, y: newy };
			
			flip = !flip;
		}
		
		this.energyLine.setPoints(this.energyPoints);
	},
	
	findPointAlongPath: function (t) {
		for (var i = 0; i < this.data.length; i++) {
			var d = this.data[i];
			if (d.startT <= t && t <= d.endT) {
				// find exact point
				var subt = (t - d.startT) / (d.endT - d.startT);
				var x1 = incoming[i + 1].x, y1 = incoming[i + 1].y;
				var x0 = incoming[i].x, y0 = incoming[i].y;
				var xx = x0 + (x1 - x0) * subt;
				var yy = y0 + (y1 - y0) * subt;
				return { x: xx, y: yy };
			}
		}
	},
	
	findAngleAlongPath: function (t) {
		for (var i = 0; i < this.data.length; i++) {
			var d = this.data[i];
			if (d.startT <= t && t <= d.endT) {
				return this.data[i].angle;
			}
		}
	},
	
	preComputeLengthsAndAngles: function () {
		this.data = [];
		
		this.totalLength = 0;
		for (var i = 0; i < incoming.length - 1; i++) {
			var x0 = incoming[i].x, y0 = incoming[i].y;
			var x1 = incoming[i + 1].x, y1 = incoming[i + 1].y;
			this.data[i] = {};
			this.data[i].angle = Math.atan2(y1 - y0, x1 - x0);
			this.data[i].length = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
			this.totalLength += this.data[i].length;
		}
		
		var tt = 0;
		for (var i = 0; i < incoming.length - 1; i++) {
			this.data[i].startT = tt;
			this.data[i].endT = tt + this.data[i].length / this.totalLength;
			tt = this.data[i].endT;
		}
		
		// circumvent the rounding error
		this.data[incoming.length - 2].endT = 1.0;
	},
	
	drawNoiseWithContext: function () {
		if (this.mode == "failed") return;
		
//		var pts = this.energyLine.getPoints(); // flickered when I tried to use these points
		var context = consoleLayer.getContext();
		
		var CUTOFF_T = .74;
		
		for (var i = 0; i < this.amps.length - 1; i++) {
			var obj = this.amps[i];
			var obj2 = this.amps[i + 1];
			if (obj.t > CUTOFF_T) {
				if (obj.noises && obj.noises.length > 0) {
					// remove noise at coil
					obj.noises = [];
					this.coilEffect();
				}
			} else {
				if (obj.noises && obj.noises.length > 0) {
					var pt1 = this.getAmpedPointAtT(obj.t, obj.amplitude);
					var pt2 = this.getAmpedPointAtT(obj2.t, obj2.amplitude);
					var theta = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
					for (var j = 0; j < obj.noises.length; j++) {
						var xx = pt1.x + (pt2.x - pt1.x) * obj.noises[j];
						var yy = pt1.y + (pt2.y - pt1.y) * obj.noises[j];
						drawRotatedImage(context, images.noise, theta, xx, yy);
					}
				}
			}
		}
	},
	
	fail: function () {
		this.energyLine.transitionTo( { alpha: 0, duration: .25 } );
		this.mode = "failed";
	},
	
	coilEffect: function () {
//		document.getElementById('hum').pause();
		document.getElementById('choke').play();
	
		var r = this.bolt.getRotation();
		var a = this.bolt.getAlpha();
		
		if (a < 1.0) {
			this.bolt.setRotation(2.0 * Math.PI * Math.random());
			this.bolt.setScale(1, 1);
		}
		
		this.bolt.setAlpha(1.0);
		
		if (!this.bolt.isVisible()) {
			this.bolt.show();
		}
		
		var me = this;
		
		this.bolt.transitionTo( { scale: { x: .1, y: .1 }, alpha: 0, duration: .1, callback: function () { me.bolt.hide(); } } );
	}
}

function Varistors (params) {
	this.efficiency = [1, 1, 1, 1, 1];
}

Varistors.prototype = {
	initialize: function () {
		this.varistors = [];

		this.varistors[0] = new Kinetic.Image( { x: 480, y: 293, image: images.varistor });
		backLayer.add(this.varistors[0]);
		
		this.varistors[1] = new Kinetic.Image( { x: 498, y: 305, image: images.varistor });
		backLayer.add(this.varistors[1]);
		
		this.varistors[2] = new Kinetic.Image( { x: 517, y: 321, image: images.varistor });
		backLayer.add(this.varistors[2]);
		
		this.varistors[3] = new Kinetic.Image( { x: 536, y: 337, image: images.varistor });
		backLayer.add(this.varistors[3]);
		
		this.varistors[4] = new Kinetic.Image( { x: 556, y: 353, image: images.varistor });
		backLayer.add(this.varistors[4]);
		
		var fix = new Kinetic.Image( { x: 581, y: 386, image: images.varistor_fix } );
		backLayer.add(fix);
	},
	
	restart: function () {
		this.efficiency = [1, 1, 1, 1, 1];
		for (var i = 0; i < 5; i++) {
			this.varistors[i].setAlpha(1);
		}
	},
	
	update: function (elapsed) {
	},
	
	overload: function (index, val) {
		var efficiency = this.efficiency[index - 1];
		
		// can't handle surges over 75
		if (Math.abs(val) < 75) {
			if (efficiency > 0) {
				var newVal = .75 * efficiency * val;
				efficiency -= .2;
				this.efficiency[index - 1] = efficiency;
				this.varistors[index - 1].setAlpha(Math.max(efficiency, 0));

//				document.getElementById('hum').pause();
				document.getElementById('buzz').play();

				return { handled: true, newVal: newVal };
			}
		}
		
		return { handled: false, newVal: val };		
	},
}

function Fuse (params) {
}

Fuse.prototype = {
	initialize: function () {
		this.hot_fuse = new Kinetic.Image( { x: 563, y: 370, image: images.hot_fuse } );
		backLayer.add(this.hot_fuse);
		
		this.burnt_fuse = new Kinetic.Image( { x: 624, y: 429, image: images.burnt_fuse } );
		backLayer.add(this.burnt_fuse);
		
		this.restart();
	},
	
	restart: function () {
		this.hot_fuse.hide();
		this.burnt_fuse.hide();
		
		this.mode = "";
		this.failTimer = 0;
		
		this.particles = [];
	},
	
	update: function (elapsed) {
		var MAX_PARTICLES = 24;
		
		if (this.mode == "failing") {
			if (this.failTimer < 1.0) {
				this.failTimer += .1;
				if (Math.random() > .3) {
					if (this.hot_fuse.isVisible()) {
						this.hot_fuse.hide();
					} else
						this.hot_fuse.show();
				}
			} else
				this.mode = "just_failed";
		} else if (this.mode == "just_failed") {
			this.burnt_fuse.setAlpha(0);
			this.hot_fuse.show();
			this.burnt_fuse.show();
			this.hot_fuse.setAlpha(1.0);
			this.hot_fuse.transitionTo( { alpha: 0, duration: .5 } );
			this.burnt_fuse.transitionTo( { alpha: 1.0, duration: .5 } );			
			this.mode = "failed";
		} else if (this.mode == "failed") {
			if (this.particles.length < MAX_PARTICLES && Math.random() > .8) {
				this.addNewParticle();
			}
			
			this.updateParticles(elapsed);
		}
	},
	
	overload: function () {
		this.hot_fuse.show();
//		this.burnt_fuse.hide();

		if (this.mode != "failing") {
	//		document.getElementById('hum').pause();
			document.getElementById('burnt_out').play();
		}
				
		this.mode = "failing";

		game.fail();
		
		return { handled: true, newVal: 0 };
	},
	
	addNewParticle: function () {
		var p = {
					startX: 654,
					startY: 440,
					x: 654,
					y: 440,
					width: 2,
					height: 2,
					time: Math.random() * 100,
					periodX: Math.random(),
					speed: 50 + Math.random() * 50,
					angle: Math.random() * Math.PI * 2
				};
		this.particles.push(p);
	},
	
	updateParticles: function (elapsed) {
		for (var i = 0; i < this.particles.length; i++) {
			var p = this.particles[i];
			p.time += elapsed;
			p.x = p.startX + Math.cos(p.time + p.periodX) * (p.startY - p.y) * .1;
			p.y -= p.speed * elapsed;
			p.width += elapsed * 60 * Math.random();
			p.height = p.width;
			p.angle += Math.random() * .001;
		}
		
		var i = 0;
		while (i < this.particles.length) {
			if (this.particles[i].y < -this.particles[i].height) {
				this.particles.splice(i, 1);
			} else
				i++;
		}
	},
	
	drawSmoke: function () {
		if (this.particles.length == 0) return;
		
		var context = frontLayer.getContext();
		
		context.save();
		
		context.globalAlpha = .5;
		
		for (var i = 0; i < this.particles.length; i++) {
			var p = this.particles[i];
			drawRotatedImage(context, images.smoke, p.angle, p.x, p.y, p.width, p.height);
		}
		
		context.restore();
	},
}