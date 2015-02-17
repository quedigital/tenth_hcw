var images = {};

var game;

var stage, mainLayer, phoneLayer, guiLayer;

var frames = 0;

var mode = "";

// NOTE: text labels REALLY slowed down the performance
var USING_TEXT = true;

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault() ;
}

$(document).ready(function () {
	initialize();
});

$(window).load(function () {
//	begin();
});

function GetPos (e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	var pos = {x: posx, y: posy};
	return pos;
}

function loadImages(sources, callback) {
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

function loadImage (url) {
	images.push(url);
	var image = new Image();
	image.src = url;
//	image.onload = function (evt) { checkForAllLoaded(url); }
	return image;
}

function checkForAllLoaded (url) {
	for (i = 0; i < images.length; i++) {
		if (images[i] == url) {
			images.splice(i, 1);
			break;
		}
	}
	
	if (images.length == 0) {
		begin();
	}
}

function initialize () {
	var id, xx, yy;
	
	$("body").bind("touchmove", BlockMove);
	
	/*
	var canvas = $("#myCanvas")[0];
	var context = canvas.getContext("2d");

	bird = loadImage("bird.png");
	*/
	
//	phone = loadImage("cellphone.png");
	
	/*
	$("#source")[0].ontouchstart = ontouchsource_start;
	$("#source")[0].ontouchmove = ontouchsource_move;
	$("#source")[0].ontouchend = ontouchsource_end;
	*/

	var sources = {
		phone: "cellphone.png",
		tower: "tower.png",
		greenrings: "greenrings.png",
		bluerings: "bluerings.png",
		yellowrings: "yellowrings.png",
		mountains: "mountains.png",
		buildings: "buildings.png",
		start: "start.png",
		finish: "finish.png",
	};

	loadImages(sources, begin);
	
	stage = new Kinetic.Stage({
		container: "kinetic",
		width: 1024,
		height: 768
	});

	mainLayer = new Kinetic.Layer();
//	mainLayer.setClearBeforeDraw(true);
//	mainLayer.afterDraw(function () { frames++; });

	stage.setThrottle(30);		// improves performance when dragging (by cutting down on mouse events, presumably)
	
	stage.add(mainLayer);

	phoneLayer = new Kinetic.Layer();
	stage.add(phoneLayer);
	
	guiLayer = new Kinetic.Layer();
	stage.add(guiLayer);

	stage.onFrame(updateStage);
	
	stage.start();
	
	game = new Game();
	game.initialize();
}

function updateStage (frame) {
	frames++;
	
	if (game)
		game.update(frame.timeDiff / 1000);
	
	stage.draw();
//	mainLayer.draw();	
//	guiLayer.draw();
}

function getCanvas () {
	return $("#myCanvas")[0];
//	return mainLayer.getCanvas();
}

function begin () {
//	$("#signal").text("begin");
	
	/*
	var canvas = getCanvas();
	var context = canvas.getContext("2d");

	context.drawImage(images.phone, 10, 10);
	*/
	
	/*
	context.drawImage(bird, 0, 0, 140, 175);
//	context.drawImage(bird, 90, 90, bird.width, bird.height, 0, 0, 140, 175);
	*/
	
//	setInterval(update, 1000 / 24);

	setInterval(drawFPS, 1000);
	
	game.setMode("playing");
	
		/*
		var triangle = new Kinetic.RegularPolygon({
		  x: 190,
		  y: 120,
		  sides: 3,
		  radius: 80,
		  fill: "#00D2FF",
		  stroke: "black",
		  strokeWidth: 4
		});

		triangle.on("tap", function() {
		  console.log("triangle");
		  game.phone.group.setPosition( { x: 300, y: 300 } );
		}); 
		
		mainLayer.add(triangle);
		*/
}

function update (elapsed) {
	if (game)
		game.update(elapsed);
}

function drawFPS () {
	$("#fps").text(frames + " fps 1.1");
	frames = 0;
}

//	$(".set").css("-webkit-transition", "opacity 1s ease-in-out, -webkit-transform 2s ease-in-out");

function addImage (layer, image, x, y) {
	var image = new Kinetic.Image( {
		x: x,
		y: y,
		image: image
	});
	
	layer.add(image);
	
	return image;
}

function gameOver (msg) {
	game.setMode("gameover");
	
	game.showDialog(msg);
}

function Game (params) {
	this.radius = 0;
}

Game.prototype = {
	setMode: function (m) {
		switch (m) {
			case "playing":
				this.reset();
				break;
			case "gameover":
				this.phone.group.setDraggable(false);
				break;
		}
		
		this.mode = m;
	},
	
	reset: function () {
		this.phone.group.setPosition( { x: 150, y: 300 } );
		this.phone.group.setDraggable(true);
		
		this.closest_tower = -1;
		
		for (var i = 0; i < this.towers.length; i++) {
			if (USING_TEXT) {
				var text = this.towers[i].hexGroup.get(".textBox")[0];
				text.hide();
			}
			var hex = this.towers[i].hexGroup.get(".hex")[0];
			hex.setAlpha(.1);
		}
		
		this.handoff.reset();
		
		this.showHandoff(-1, 0);
	},
	
	initialize: function () {
		addImage(mainLayer, images.start, 20, 230);
		addImage(mainLayer, images.finish, 900, 255);
		
		var mtns = addImage(mainLayer, images.mountains, 340, 330);
		mtns.setScale(1.5);
		
		var buildings = addImage(mainLayer, images.buildings, 520, 60);
		
		this.towers = [ new Tower( { x: -250, y: -72, rings: "greenrings", range: 3.0 } ),
						new Tower( { x: -104, y: -328, rings: "bluerings" } ),
						new Tower( { x: 85, y: -126, rings: "yellowrings", range: 1.0 } ),
						new Tower( { x: 328, y: -302, rings: "greenrings", range: 2.0 } ),
						new Tower( { x: -196, y: 152, rings: "bluerings", range: 4.0 } ),
						new Tower( { x: 142, y: 131, rings: "greenrings" } ),
						new Tower( { x: 334, y: 55, rings: "bluerings", range: 3.5 } ),
						];

		this.createDialog();
		this.createHandoff();
		this.phone = new Phone();
	},
	
	update: function (elapsed) {
		if (elapsed > .25) elapsed = .25;
		
		for (var i = 0; i < this.towers.length; i++) {
			this.towers[i].update(elapsed);
		}
				
		//this.render(true);
		
//		frames++;
		if (this.mode == "playing") {
			var result = this.calculateSignalStrength();
			this.phone.setBars(result.bars);
			
			if (result.tower != this.closest_tower && result.tower != -1 && this.closest_tower != -1) {
				this.showHandoff(this.closest_tower, result.tower);
			}
			this.closest_tower = result.tower;
			
			if (result.bars == 0) {			
				stage._endDrag();
				
				gameOver("Oops! You've lost your signal!");
				
	//			this.phone.group.setPosition( { x: 175, y: 200 } );
			} else {
				var xx = this.phone.group.getAbsolutePosition().x;
				var yy = this.phone.group.getAbsolutePosition().y;
				if (xx > 950 && yy > 305 && yy < 350) {
					gameOver("Congratulations! You did it!");
				}
			}
		}
		
		if (this.handoff) {
			this.handoff.update(elapsed);
		}
	},
	
	render: function (clear) {
		var canvas = getCanvas();
		var context = canvas.getContext("2d");
		
		if (clear) {
			context.clearRect(0, 0, canvas.width, canvas.height);
		}
	
//		context.drawImage(phone, 10, 10);
		
		for (var i = 0; i < this.towers.length; i++) {
			this.towers[i].render(context);
		}
		
		//mainLayer.draw();
		
	},
	
	calculateSignalStrength: function () {
		var max_signal = 0, closest_tower = -1;
		for (var i = 0; i < this.towers.length; i++) {
			var xx = this.phone.image.getAbsolutePosition().x;
			var yy = this.phone.image.getAbsolutePosition().y;
			var st = this.towers[i].calculateSignalStrength(xx, yy);
			if (st > max_signal) {
				max_signal = st;
				closest_tower = i;
			}
		}
		
		$("#signal").text(max_signal + " bars");
		return { tower: closest_tower, bars: max_signal };
	},
	
	createDialog: function () {
		var g = new Kinetic.Group();
		g.setOffset(200, 100);
		
		var r = new Kinetic.Rect( { width: 400, height: 200, fill: "black", stroke: "white", strokeWidth: 3, x: 0, y: 0 } );	
		g.add(r);
			
		var t = new Kinetic.Text( { name: "textBox", text: "", fontSize: 14, fontFamily: "Futura,sans-serif", align: "center", textFill: "white", width: 400, padding: 20, y: 20 } );
		g.add(t);
		
		var button = new Kinetic.Rect( { width: 120, height: 40, fill: "black", stroke: "white", strokeWidth: 2, x: 200, y: 125, cornerRadius: 5 } );
		button.setOffset(60, 20);
		g.add(button);
		
		button.on("tap click", function () {
			g.hide();
			
			game.setMode("playing");
		});
		
		t = new Kinetic.Text( { text: "Try Again", fontSize: 16, fontFamily: "Arial,sans-serif", align: "center", textFill: "white",
								width: 120, x: 200, y: 117, listening: false } );
		t.setOffset(60, 0);
		g.add(t);
		
		g.setPosition( { x: 512, y: 384 } );
		g.hide();
		
		guiLayer.add(g);
		
		this.dialog = g;
	},
	
	createHandoff: function () {
		this.handoff = new Handoff();
	},
	
	showDialog: function (msg) {
		this.dialog.get(".textBox")[0].setText(msg);
		
		this.dialog.show();
	},
	
	showHandoff: function (from, to) {
		var x1, y1;
		if (from >= 0) {
			x1 = this.towers[from].x;
			y1 = this.towers[from].y;
		}
		var x2 = this.towers[to].x;
		var y2 = this.towers[to].y;
		
		if (USING_TEXT) {
			var text1;
			if (from >= 0) {
				text1 = this.towers[from].hexGroup.get(".textBox")[0];
				text1.transitionTo({ alpha: 0, duration: 1.0, easing: 'ease-in-out', callback: function () { text1.hide(); } });
			}
			
			var text2 = this.towers[to].hexGroup.get(".textBox")[0];
			text2.show();
			text2.transitionTo({ alpha: 1.0, duration: 1.0, easing: 'ease-in-out' });
		}
		
		if (from >= 0) {
			var hex1 = this.towers[from].hexGroup.get(".hex")[0];		
			hex1.setAlpha(.1);
		}
		
//		hex1.setShadow({});
		
		var hex2 = this.towers[to].hexGroup.get(".hex")[0];
		hex2.setAlpha(1.0);
/*		
		hex2.setShadow({
			color: 'white',
			blur: 5,
			offset: [0,0],
			alpha: 1.0
		});
*/
		
		if (from >= 0)
			this.handoff.animate(x1, y1, x2, y2);
	}
}

function Phone (params) {
	this.bars = 0;
	this.group = new Kinetic.Group();
	
	this.image = new Kinetic.Image( {
		x: 0,
		y: 0,
		image: images.phone
	});
	this.image.setOffset(137 * .5, 154 * .5);
	
	this.group.add(this.image);
	
	this.lines = [];
	
	for (var i = 0; i < 5; i++) {
		var line = new Kinetic.Line( {
			points: [10 + 10 * i, -60, 10 + 10 * i, -90 + (5 - i) * 5],
			stroke: "#4d4",
			strokeWidth: 6,
			lineCap: "square",
		} );
		
		this.group.add(line);
		this.lines.push(line);
	}
		
	phoneLayer.add(this.group);
	
	this.group.setPosition( { x: 175, y: 200 } );
	this.group.setDraggable(true);
	
	/*
	mainLayer.add(this.image);
	
	this.image.setDraggable(true);
	this.image.setPosition( { x: 175, y: 200 } );
	*/
}

Phone.prototype = {
	setBars: function (bars) {
		if (bars != this.bars) {
			for (var i = 0; i < 5; i++) {
				this.lines[i].setAlpha(i < bars ? 1.0 : .25);
			}
			this.bars = bars;
		}
	},
}

function Tower (params) {
	this.rings = [];
	
	this.x = params.x + 500;
	this.y = params.y + 450;
	
	this.range = params.range == undefined ? 2.5 : params.range;
	
	this.pos = [-.5 * this.range, .2 * this.range, 1.0 * this.range];
	
	this.hexGroup = new Kinetic.Group();
	
	var hex = new Kinetic.RegularPolygon({ name: "hex", radius: 60, sides: 6, stroke: "white", x: this.x, y: this.y + 65, rotation: Math.PI * .5, strokeWidth: 1, alpha: .1 });
	this.hexGroup.add(hex);
	
	if (USING_TEXT) {
		var text = new Kinetic.Text( { name: "textBox", text: "Current\nBase Station", fontSize: 8, fontFamily: "Futura,sans-serif", align: "center", textFill: "cyan", width: 120, x: this.x, y: this.y + 90, lineHeight: 1.5, alpha: 0 } );
		text.setOffset(60, 0);
		text.hide();
		this.hexGroup.add(text);
	}
	
	mainLayer.add(this.hexGroup);
	
	this.tower = addImage(mainLayer, images.tower, this.x, this.y);
	this.tower.setOffset(20, 5);
	
	var r = Math.random() * this.range;
	
	for (var i = 0; i < this.pos.length; i++) {
		this.pos[i] += r;
		this.rings[i] = addImage(mainLayer, images[params.rings], this.x, this.y);
		this.rings[i].setOffset(113 * .5, 71 * .5); 
	}
}

Tower.prototype = {
	update: function (elapsed) {
		for (var i = 0; i < this.pos.length; i++) {
			this.pos[i] += (this.range / 2.5) * elapsed;
			if (this.pos[i] > this.range) this.pos[i] -= this.range;
			this.rings[i].setScale(this.pos[i]);
			
			var ratio = this.pos[i] / this.range;
			
			if (ratio > .5)
				this.rings[i].setAlpha(1.0 - (ratio - .5) * 2);
			else if (this.pos[i] < 0)
				this.rings[i].setAlpha(0);
			else
				this.rings[i].setAlpha(1.0);
		}		
	},
	
	render: function (context) {
		context.drawImage(this.tower, this.x, this.y);
		
		context.save();
		for (var i = 0; i < this.pos.length; i++) {
			if (this.pos[i] > 0) {
				if (this.pos[i] > 1.5)
					context.globalAlpha = 2.5 - this.pos[i];
				else
					context.globalAlpha = 1.0;
				this.drawRings(context, this.x + 20, this.y + 5, this.pos[i]);
			}
		}
		context.restore();
	},
	
	drawRings: function (context, x, y, scale) {
		var w = 113 * scale;
		var h = 71 * scale;
		context.drawImage(this.rings, Math.floor(x - w * .5), Math.floor(y - h * .5), w, h);
	},
	
	calculateSignalStrength: function (x, y) {
		var xx = this.tower.getX();
		var yy = this.tower.getY();
		
		var MODIFIER = 75;
		
		var dist = Math.sqrt((xx - x) * (xx - x) + (yy - y) * (yy - y));
		if (dist < this.range * MODIFIER) {
			return 5.0 - Math.floor((dist / (this.range * MODIFIER)) * 5);
		} else
			return 0;
	},
}

function Handoff (params) {
	this.mode = "";
	this.time = 0;
	this.clipped = false;
	
	this.arcLayer = new Kinetic.Layer();
	
	var me = this;
	this.arcLayer.beforeDraw(function () { me.clipRegion(this); });
	this.arcLayer.afterDraw(function () { me.doneClipping(this); });

	this.labelLayer = new Kinetic.Layer();
	
	this.path = new Kinetic.Path({ stroke: "yellow", scale: 1 });
	this.path.setShadow({
		color: 'orange',
		blur: 10,
		offset: [0,0],
		alpha: 1.0
	});
	
	this.arcLayer.add(this.path);

	var g = new Kinetic.Group();
	g.setOffset(60, 20);

	var r = new Kinetic.Rect( { width: 120, height: 40, fill: "black", stroke: "#5ad", strokeWidth: 3, cornerRadius: 20 } );
	g.add(r);
	
	var t = new Kinetic.Text( { text: "Handoff", fontSize: 18, fontFamily: "Futura,sans-serif", align: "center", textFill: "white", width: 120, y: 10 } );
	g.add(t);
	
	g.setPosition( { x: 512, y: 384 } );
	this.label = g;
	
	this.labelLayer.add(g);
	
	this.arcLayer.hide();
	this.labelLayer.hide();
	
	stage.add(this.arcLayer);	
	stage.add(this.labelLayer);	
	
	phoneLayer.setZIndex(99);
	guiLayer.setZIndex(100);
}

Handoff.prototype = {
	animate: function (x1, y1, x2, y2) {
		this.time = 0;
		
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		
		var dx = this.x2 - this.x1;
		var dy = this.y2 - this.y1;
		this.distance = Math.sqrt((dx * dx) + (dy * dy));
		
		var CURVE = 250;
		var theta = Math.atan2(dy, dx) + (Math.PI * .5);
		
		/*
		// make nice arcs, up and to the right
		if (theta > Math.PI && theta < 4.0) {
			theta += Math.PI;
		} else if (theta < Math.PI * .25) {
		} else if (theta < Math.PI) {
			theta += Math.PI;
		}
		*/
		
		var offsetx = Math.cos(theta) * CURVE;
		var offsety = Math.sin(theta) * CURVE;
		var cx = (this.x1 + this.x2) * .5 + offsetx;
		var cy = (this.y1 + this.y2) * .5 + offsety;
		
		var d = "M" + this.x1 + "," + this.y1 + "Q" + cx + " " + cy + " " + this.x2 + " "+ this.y2;
		this.path.setData(d);
		
		CURVE = 125;
		offsetx = Math.cos(theta) * CURVE;
		offsety = Math.sin(theta) * CURVE;
		cx = (this.x1 + this.x2) * .5 + offsetx;
		cy = (this.y1 + this.y2) * .5 + offsety;

		this.label.setPosition( { x: cx, y: cy } );
		
		this.labelLayer.setAlpha(1.0);
		this.arcLayer.setAlpha(1.0);
		
		this.arcLayer.show();
		this.labelLayer.hide();
		this.mode = "showing";
	},
	
	reset: function () {
		this.mode = "";
		this.labelLayer.hide();
		this.arcLayer.hide();
	},
	
	update: function (elapsed) {
		switch (this.mode) {
			case "showing":
				this.time += elapsed;
				if (this.time > .25 && !this.labelLayer.isVisible()) {
					this.label.setAlpha(0);
					this.label.transitionTo({ alpha: 1.0, duration: 1.0, easing: 'ease-in-out'});
					this.labelLayer.show();
				} else if (this.time > 3.0) {
					this.labelLayer.transitionTo({ alpha: 0, duration: 1.0, easing: 'ease-in-out'} );
					this.arcLayer.transitionTo({ alpha: 0, duration: 1.0, easing: 'ease-in-out'} );
					this.mode = "hidden";
				}
				break;
		}
		/*
		if (this.path && this.x1) {
			var d = "M" + this.x1 + "," + this.y1 + "Q" + cx + " " + cy + " " + this.x2 + " "+ this.y2;
			this.path.setData(d);
			this.path.setShadow({
				color: 'orange',
				blur: 10,
				offset: [0,0],
				alpha: 1.0
			  });
		}
		*/
	},
	
	clipRegion: function (layer) {
		if (this.mode == "showing") {
			var tt = this.time * 500;
			if (tt < 1000) {
				this.clipped = true;
				var context = layer.getContext();
				context.save();
				context.beginPath();
				context.arc(this.x1, this.y1, tt, 0, 2 * Math.PI, false);
				context.clip();
			}
		}
	},
	
	doneClipping: function (layer) {
		if (this.clipped) {
			var context = layer.getContext();
			context.restore();
			this.clipped = false;
		}
	},
}