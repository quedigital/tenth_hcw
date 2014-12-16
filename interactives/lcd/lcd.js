var stage, mainLayer;
var game;

var images = {};

var frames = 0;

function BlockMove (event) {
	// Tell Safari not to move the window.
	event.preventDefault();
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

function initialize () {
	var sources = {
		light_emitter: "light-emitter.jpg",
		light_emitter_overlay: "light-emitter_overlay.png",
		red_beam: "red_beam.png",
		green_beam: "green_beam.png",
		blue_beam: "blue_beam.png",
		red_beam_translucent: "red_beam_translucent.png",
		green_beam_translucent: "green_beam_translucent.png",
		blue_beam_translucent: "blue_beam_translucent.png",
		red_beam_filter: "red_beam_filter.png",
		red_beam_polarized: "red_beam_polarized.png",
		red_arrow: "red_arrow.png",
		green_arrow: "green_arrow.png",
		blue_arrow: "blue_arrow.png",
		molecule_0: "molecule_0.png",
		molecule_1: "molecule_1.png",
		molecule_2: "molecule_2.png",
		molecule_3: "molecule_3.png",
		molecule_4: "molecule_4.png",
		molecule_5: "molecule_5.png",
		molecule_6: "molecule_6.png",
		molecule_7: "molecule_7.png",
		molecule_8: "molecule_8.png",
		molecule_9: "molecule_9.png",
		molecule_10: "molecule_10.png",
		molecule_11: "molecule_11.png",
		slider: "slider.png",
	};

	loadImages(sources, begin);
	
	stage = new Kinetic.Stage({
		container: "kinetic",
		width: 1024,
		height: 768
	});
	
	mainLayer = new Kinetic.Layer();

	stage.setThrottle(30);		// improves performance when dragging (by cutting down on mouse events, presumably)
	
	stage.add(mainLayer);

	stage.onFrame(updateStage);
	
	stage.start();
	
	setInterval(drawFPS, 1000);
}

function begin () {
	game = new Game();
	game.initialize();

	game.begin();
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
	this.red = new Cell( { y: 180, fill: "#f1666a", stroke: "#be3537", backImage: images.red_beam, filter: images.red_beam_translucent } );
	this.green = new Cell( { y: 390, slider: images.green_arrow, fill: "#2da659", stroke: "#00652e", backImage: images.green_beam, filter: images.green_beam_translucent } );
	this.blue = new Cell( { y: 600, slider: images.blue_arrow, fill: "#4b8fc3", stroke: "#0060a8", backImage: images.blue_beam, filter: images.blue_beam_translucent } );
}

Game.prototype = {
	initialize: function () {		
		this.oval = new Kinetic.Ellipse({
			x: 950,
			y: 400,
			radius: {
				x: 50,
				y: 50
			},
			fill: {
				start: {
					x: 0,
					y: 0,
					radius: 0
				},
				end: {
					x: 0,
					y: 0,
					radius: 70
				},
				colorStops: [.3, "rgb(0,0,0)", .8, 'black']
			},
		});
		this.oval.setScale( { y: 7 } );
		mainLayer.add(this.oval);
		
		this.red.initialize();
		this.green.initialize();
		this.blue.initialize();		
	},
	
	begin: function () {
	},
	
	update: function (elapsed) {
	},
	
	updateLight: function () {
		var r = this.red.getIntValue();
		var g = this.green.getIntValue();
		var b = this.blue.getIntValue();
		
		var fill = { 
				start: {
					x: 0,
					y: 0,
					radius: 0
				},
				end: {
					x: 0,
					y: 0,
					radius: 70
				},
				colorStops: [.3, "rgb(" + r + "," + g + "," + b + ")", .8, 'black']
			};

		this.oval.setFill(fill);
	},
}

function Cell (params) {
	this.value = 0;
	this.controlY = -1;
	
	this.y = params.y;
	
	this.showingPower = true;
	
	this.slider = params.slider == undefined ? images.red_arrow : params.slider;
	
	this.fill = params.fill;
	this.stroke = params.stroke;
	this.backImage = params.backImage;
	this.filter = params.filter;
}

var pig = 0;

Cell.prototype = {
	initialize: function () {
		var me = this;

		var image = new Kinetic.Image( {
			x: 100,
			y: this.y - 103,
			image: images.light_emitter
		});
	
		mainLayer.add(image);

		this.shape = new Kinetic.Shape( { listening: false } );
		this.shape.setDrawFunc(function () { me.drawCell(); } );
		
		mainLayer.add(this.shape);
		
		this.redControl = new Kinetic.Image( { x: 25, y: this.y - 70, image: this.slider });		
		mainLayer.add(this.redControl);
		
		this.slider = new Kinetic.Image( { x: 21, y: this.y, image: images.slider } );
		this.slider.setOffset(0, 21);
		this.slider.setDraggable(true);
		this.slider.setDragConstraint("vertical");
		this.slider.setDragBounds( { top: this.y - 70, bottom: this.y + 80 } );
		this.slider.on("dragmove", function (event) { me.refreshValue(); } )
		mainLayer.add(this.slider);
		
		this.controlHeight = 150;
		
		this.setupBeams();
		
		this.setupPower();

		var image = new Kinetic.Image( { x: 100, y: this.y - 103, image: images.light_emitter_overlay });
		mainLayer.add(image);
		
		this.setValue(0);
	},
	
	refreshValue: function () {
		var y = this.slider.getPosition().y;
		var y0 = this.y - 70;
		
		this.setValue((1.0 - (y - y0) / this.controlHeight) * 90);
		
		game.updateLight();
	},
	
	setupBeams: function () {
		this.beams = [];
		
		// red 3 bottom (18, 19, 20)
		for (var i = 18; i < 21; i++) {
			var poly = new Kinetic.Path( {
				fill: this.fill,
				stroke: this.stroke,
				strokeWidth: 1,
				data: "M0,0",
			} );
			
			mainLayer.add(poly);
			this.beams[i] = poly;
		}

		// red 3 top (21, 22, 23)
		for (var i = 23; i >= 21; i--) {
			var poly = new Kinetic.Path( {
				fill: this.fill,
				stroke: this.stroke,
				strokeWidth: 1,
				data: "M0,0",
			} );
			
			mainLayer.add(poly);
			this.beams[i] = poly;
		}

		var image = new Kinetic.Image( { x: 448, y: this.y - 103, image: images.red_beam_polarized } );
		mainLayer.add(image);
		
		// red 2 bottom (12, 13, 14)
		for (var i = 12; i < 15; i++) {
			var poly = new Kinetic.Path( {
				fill: this.fill,
				stroke: this.stroke,
				strokeWidth: 1,
				data: "M0,0",
			} );
			
			mainLayer.add(poly);
			this.beams[i] = poly;
		}

		// red 2 top (15, 16, 17)
		for (var i = 17; i >= 15; i--) {
			var poly = new Kinetic.Path( {
				fill: this.fill,
				stroke: this.stroke,
				strokeWidth: 1,
				data: "M0,0",
			} );
			
			mainLayer.add(poly);
			this.beams[i] = poly;
		}
		
		var image = new Kinetic.Image( { x: 448, y: this.y - 103, image: images.red_beam_filter } );
		mainLayer.add(image);

		// red 1 bottom (6, 7, 8)
		for (var i = 6; i < 9; i++) {
			var poly = new Kinetic.Path( {
				fill: this.fill,
				stroke: this.stroke,
				strokeWidth: 1,
				data: "M0,0",
			} );
			
			mainLayer.add(poly);
			this.beams[i] = poly;
		}
		
		// red 1 top (9, 10, 11)
		for (var i = 11; i >= 9; i--) {
			var poly = new Kinetic.Path( {
				fill: this.fill,
				stroke: this.stroke,
				strokeWidth: 1,
				data: "M0,0",
			} );
			
			mainLayer.add(poly);
			this.beams[i] = poly;
		}		

		var image = new Kinetic.Image( { x: 448, y: this.y - 103, image: this.backImage } );
		mainLayer.add(image);				
		
		// bottom (0, 1, 2)
		for (var i = 0; i < 3; i++) {
			var poly = new Kinetic.Path( {
				fill: "#e6eff3",
				stroke: "#ccc122",
				strokeWidth: 1,
				data: "M0,0",
			} );
		
			mainLayer.add(poly);
			this.beams[i] = poly;
		}
		
		// top (5, 4, 3)
		for (var i = 5; i >= 3; i--) {
			var poly = new Kinetic.Path( {
				fill: "#e6eff3",
				stroke: "#ccc122",
				strokeWidth: 1,
				data: "M0,0",
			} );
		
			mainLayer.add(poly);
			this.beams[i] = poly;
		}
		
		var image = new Kinetic.Image( { x: 448, y: this.y - 103, image: this.filter } );
		mainLayer.add(image);
	},
	
	setupPower: function () {
		this.powers = [];
		
		this.powers[0] = new Kinetic.Polygon( {
			points: [0, 0],
			fill: "#ad690e",
			x: 100,
			y: this.y - 102,
		} );
		mainLayer.add(this.powers[0]);
		
		this.powers[1] = new Kinetic.Polygon( {
			points: [0, 0],
			fill: "#f7941e",
			x: 100,
			y: this.y - 102,
		} );
		mainLayer.add(this.powers[1]);
	},
	
	updateBeams: function () {
		var x0 = 336, y0 = this.y + 38;
		var x1 = 390, x2 = 635, x3 = 640, x4 = 740, x5 = 770, x6 = 830, x7 = 830, x8 = 920;
		
		var start_angle = .5 - (this.value / 90) * 1.5, spread = .44;// + (this.value / 90) * .2;
				
		// bottom (0, 1, 2)
		for (var i = 0; i < 3; i++) {
			var theta = start_angle + i * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var cx = Math.floor((x0 + x1) * .5);
			var cy = this.y + h;
			var dy = this.y + h * (1.0 - (this.value / 90));
			// untwisted coordinates
			var start_x = x0 - Math.sin(.5 + i * spread) * 15;
			var start_y = this.y + Math.cos(.5 + i * spread) * 42;
			var s1 = "M" + x1 + " " + this.y + "L" + x0 + " " + this.y + "L" + start_x + " " + start_y + "Q" + cx + " " + cy + " " + x1 + " " + dy;
			var s2 = "Q" + (x1 + 17) + " " + (this.y + h) + " " + (x1 + 35) + " " + (this.y + h) + "L" + (x2 + w) + " " + (this.y + h) + "L" + x2 + " " + this.y + "L" + x1 + " " + this.y;
			poly.setData(s1 + s2);
		}
		
		y0 = this.y - 32;
		
		// top (5, 4, 3)
		for (var i = 5; i >= 3; i--) {
			var theta = (start_angle + Math.PI * .64) + i * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var cx = Math.floor((x0 + x1) * .5);
			var cy = Math.floor(y0);
			var dy = y0 + (this.y - y0) * (this.value / 90);
			// untwisted coordinates
			var start_x = x0 - Math.sin(.5 + Math.PI * .64 + i * spread) * 15;
			var start_y = this.y + Math.cos(.5 + Math.PI * .64 + i * spread) * 42;
			var s1 = "M" + x1 + " " + this.y + "L" + x0 + " " + this.y + "L" + start_x + " " + start_y + "Q" + cx + " " + cy + " " + x1 + " " + dy;
			var s2 = "Q" + (x1 + 17) + " " + (this.y + h) + " " + (x1 + 35) + " " + (this.y + h) + "L" + (x2 + w) + " " + (this.y + h) + "L" + x2 + " " + this.y + "L" + x1 + " " + this.y;
			poly.setData(s1 + s2);
		}
		
		// red 1 bottom (6, 7, 8)
		for (var i = 6; i < 9; i++) {
			var theta = start_angle + (i - 6) * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var s1 = "M" + x3 + " " + this.y + "L" + x4 + " " + this.y + "L" + (x4 + w) + " " + (this.y + h) + "L" + x3 + " " + (this.y + h) + "Z";
			poly.setData(s1);
		}
		
		// red 1 top (9, 10, 11)
		for (var i = 11; i >= 9; i--) {
			var theta = (start_angle + Math.PI * .64) + (i - 6) * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var s1 = "M" + x3 + " " + this.y + "L" + x4 + " " + this.y + "L" + (x4 + w) + " " + (this.y + h) + "L" + x3 + " " + (this.y + h) + "Z";
			poly.setData(s1);
		}
		
		// red 2 bottom (12, 13, 14)
		for (var i = 12; i < 15; i++) {
			var theta = start_angle + (i - 12) * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var s1 = "M" + x5 + " " + this.y + "L" + x6 + " " + this.y + "L" + (x6 + w) + " " + (this.y + h) + "L" + x5 + " " + (this.y + h) + "Z";
			poly.setData(s1);
			
			// option A: adjust alpha according to charge value
//			poly.setAlpha(this.value / 90);

			// option B: only show the vertical "beams"
			if (Math.abs(w) > 4) poly.hide();
			else poly.show();
		}
		
		// red 2 top (15, 16, 17)
		for (var i = 17; i >= 15; i--) {
			var theta = (start_angle + Math.PI * .64) + (i - 12) * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var s1 = "M" + x5 + " " + this.y + "L" + x6 + " " + this.y + "L" + (x6 + w) + " " + (this.y + h) + "L" + x5 + " " + (this.y + h) + "Z";
			poly.setData(s1);
			
			// option A: adjust alpha according to charge value
//			poly.setAlpha(this.value / 90);

			// option B: only show the vertical "beams"
			if (Math.abs(w) > 4) poly.hide();
			else poly.show();
		}
		
		// red 3 bottom (18, 19, 20)
		for (var i = 18; i < 21; i++) {
			var theta = start_angle + (i - 18) * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var s1 = "M" + x7 + " " + this.y + "L" + x8 + " " + this.y + "L" + (x8 + w) + " " + (this.y + h) + "L" + (x7 + w) + " " + (this.y + h) + "Z";
			poly.setData(s1);
			
			// option A: adjust alpha according to charge value
//			poly.setAlpha(this.value / 90);

			// option B: only show the vertical "beams"
			if (Math.abs(w) > 4) poly.hide();
			else poly.show();
		}		

		// red 3 bottom (21, 22, 23)
		for (var i = 23; i >= 21; i--) {
			var theta = (start_angle + Math.PI * .64) + (i - 18) * spread;
			var w = Math.sin(theta) * 15;
			var h = Math.cos(theta) * 42;
			var poly = this.beams[i];
			var s1 = "M" + x7 + " " + this.y + "L" + x8 + " " + this.y + "L" + (x8 + w) + " " + (this.y + h) + "L" + (x7 + w) + " " + (this.y + h) + "Z";
			poly.setData(s1);
			
			// option A: adjust alpha according to charge value
//			poly.setAlpha(this.value / 90);

			// option B: only show the vertical "beams"
			if (Math.abs(w) > 4) poly.hide();
			else poly.show();
		}
	},
	
	updatePower: function () {
		if (this.value > 0) {
			var y0 = 175, y1 = 204;
			var h = this.value / 90 * (y1 - y0); 
			var points = [205, y1, 218, y1, 218, y1 - h, 205, y1 - h];
			this.powers[1].setPoints(points);
			
			var y2 = 152, y3 = 182;
			var h2 = this.value / 90 * (y3 - y2); 
			
			points = [205, y1, 218, y1, 228, 182, 228, y3 - h2, 214, y3 - h2, 205, y1 - h, 205, y1];
			this.powers[0].setPoints(points);
			
			if (this.showingPower == false) {
				this.showingPower = true;
				this.powers[0].transitionTo( { alpha: 1.0, duration: .25 } );
				this.powers[1].transitionTo( { alpha: 1.0, duration: .25 } );
			}
		} else {
			if (this.showingPower == true) {
				this.showingPower = false;
				this.powers[0].transitionTo( { alpha: 0, duration: .25 } );
				this.powers[1].transitionTo( { alpha: 0, duration: .25 } );
			}
		}
	},

	drawCell: function () {
		var context = mainLayer.getContext();
		
		var xx = 333, yy = this.y + 65;
		
		var increment = this.value / 12.0;
		var angle = 0;

		var ANGLES_PER_IMAGE = 90 / 12;
		
		// draw molecules
		for (var i = 0; i < 12; i++) {
			var roundedAngle = Math.floor(angle / ANGLES_PER_IMAGE);
			context.drawImage(images["molecule_" + roundedAngle], xx + i * 8, yy);
			angle += increment;
		}
	},
	
	setValue: function (val) {
		this.value = val;
		if (this.value < 0) this.value = 0;
		else if (this.value > 90) this.value = 90;
		
		var yy = this.redControl.getAbsolutePosition().y;
		this.slider.setPosition( { y: yy + this.controlHeight - (this.value / 90) * this.controlHeight } );
		
		this.updateBeams();
		this.updatePower();
	},
	
	getIntValue: function () {
		return Math.floor((this.value / 90) * 255);
	},
}