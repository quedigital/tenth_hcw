var ram;
var frame = 0;
var img;
var addressline, datalines = [];

var ANIMATION_TIME = 500;

$(document).ready(function () {
	initialize();
});

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault() ;
}

function getContext () {
	var canvas = $("#canvas")[0];
	
	return canvas.getContext("2d");
}

function getRaffContext () {
	return raff.canvas;
}

function drawRotatedImage (img, x, y, radians) {
	var context = getContext();
	
	context.translate(x, y);
	context.rotate(radians);
	context.drawImage(img, -img.width * .5, -img.height * .5, img.width, img.height);
	context.rotate(-radians);
	context.translate(-x, -y);	
}

function initialize () {
	var i, path;
	
	raff = Raphael($("#raff_container")[0], 1024, 768);
	
	ram = new RAM();
	ram.initialize();
	
	var slope = -450 / 1002;
	// data lines
	for (i = 0; i < 8; i++) {
		var x1 = -160 + (i * 120);
		var y1 = 70 + x1 * slope;
		var x2 = x1 + 35, y2 = y1;
		var x3 = x1 + 365, y3 = y1 + 680;
		var x4 = x1 + 325, y4 = y1 + 680;
		/*
		if (x1 < 0) x1 = 0;
		if (x2 < 0) x2 = 0;
		if (x4 > 1024) x4 = 1024;
		if (y1 < 0) y1 = 0;
		if (y2 < 0) y2 = 0;
		if (y3 > 768) y3 = 768;
		if (y4 > 768) y4 = 768;
		*/
		
//		var obj = { index: i, onTouch: function () { ram.onTouchDataLine(this.index); } };
		
		path = raff.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2 + " L " + x3 + " " + y3 + " L " + x4 + " " + y4 + " Z").attr( { fill: "red", stroke: "none", opacity: .5 });
		path.hide();
		datalines.push(path);		
		
//		path.mousedown(jQuery.proxy(obj.onTouch, obj));
	}
	
	// address line
	path = raff.path("M 5,487 L 3,532 L 1022,76 L 1023,29 Z").attr( { fill: "red", stroke: "none", opacity: .5 });
	path.hide();
	addressline = path;

	setInterval(redraw, 1000 / 12);
	
	$("body").bind("mousedown", BlockMove);
	$("body").bind("touchstart", BlockMove);
	
//	$("#canvas").bind("mousedown", onMouseDown);
//	$("#canvas").bind("touchstart", onMouseDown);
	
	$(".container").bind("mousedown", onMouseDown);
	$(".container").bind("touchstart", onMouseDown);
	
}

function onMouseDown (event) {
	var pt = GetPos();
	// NOTE: raff.getElementByPoint did not seem to work and elem.isPointInside is not part of the -min build
	// console.log(pt.x + ", " + pt.y + " = " + raff.getElementByPoint(pt.x, pt.y));
	if (addressline.isPointInside(pt.x, pt.y)) {
		ram.onTouchAddressLine();
	} else {
		for (var i = 0; i < 8; i++) {
			if (datalines[i].isPointInside(pt.x, pt.y)) {
				ram.onTouchDataLine(i);
				break;
			}
		}
	}
}

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
	
	var pos = { x: posx, y: posy };
	return pos;
}

function redraw () {
	ram.update();
	ram.draw();
	frame++;
}

function RAM () {
	this.images = {};
	this.imageCount = 0;
	
	this.display = {};
	this.properties = {};
	
	this.loadImage("capacitor_charged", "capacitor_charged.png");
	this.loadImage("capacitor_uncharged", "capacitor_uncharged.png");
	this.loadImage("transistor_charged_closed", "transistor_charged_closed.png");
	this.loadImage("transistor_uncharged_open", "transistor_uncharged_open.png");
	this.loadImage("transistor_uncharged_closed", "transistor_uncharged_closed.png");
	this.loadImage("dataline_uncharged", "dataline_uncharged.png");	
	this.loadImage("dataline_charged", "dataline_charged.png");	
	this.loadImage("junction_charged", "junction_charged.png");	
	this.loadImage("junction_uncharged", "junction_uncharged.png");	
	this.loadImage("addressline_charged", "addressline_charged.png");	
	this.loadImage("addressline_uncharged", "addressline_uncharged.png");	
	this.loadImage("dart", "dart.png");
	this.loadImage("spark", "spark.png");
}

RAM.prototype = {
	loadImage: function (id, filename) {
		this.imageCount++;
		var img = new Image();
		img.id = id;
		img.src = filename;
		var ram = this;
		img.onload = function () {
			ram.onLoaded(id);
		}
		this.images[id] = img;
	},
	
	setProperty: function (p, val) {
		this.properties[p] = val;
	},
	
	onLoaded: function (id) {
		this.imageCount--;
		//if (this.imageCount == 0) this.draw();
	},
	
	onTouchAddressLine: function () {
		var setting = this.properties.addressline == 'charged' ? '' : 'charged';
		
		this.setProperty("addressline", setting);
		
		Tween.removeTweens(this);
		Tween.removeTweens(this.properties);
		
		this.properties.addresslineCharge = 0;
		Tween.get(this.properties).to( { addresslineCharge: 1.0 }, 1000, Ease.cubicOut);
		
		if (setting == "charged") {
			var tw = Tween.get(this);
			for (var i = 0; i < 8; i++) {
				var obj = { index: i, go: function () { ram.closeTransistor(this.index); } };
				tw.call(jQuery.proxy(obj.go, obj));
				if (i < 8 - 1) tw.wait(250);
				
				this.junctionArrows[i].resetPoints();				
			}
			
			this.addressArrows.resetPoints();
		} else {
			var tw = Tween.get(this);
			for (var i = 0; i < 8; i++) {
				var obj = { index: i, go: function () { ram.openTransistor(this.index); } };
				tw.call(jQuery.proxy(obj.go, obj));
				if (i < 8 - 1) tw.wait(250);
			}
		}
		
		this.clearBitCaptions();
	},
	
	clearBitCaptions: function () {
		$("#result_caption").html("00000000 = 0");
		
		for (var i = 0; i < 8; i++) {
			$("#bit" + i).html("0");
		}
	},
	
	closeTransistor: function (n) {
		if (this.properties["transistor" + n].indexOf("charged") == -1)
			this.setProperty("transistor" + n, "closed");
		else
			this.setProperty("transistor" + n, "charged,closed");
			
		if (this.properties["dataline" + n] == "charged" && this.properties["transistor" + n] && this.properties["transistor" + n].indexOf("closed") != -1 && this.properties["transistor" + n] && this.properties["transistor" + n].indexOf("charged") == -1) {
			var obj = { index: n, go: function () { ram.chargeTransistor(this.index); } };
			Tween.get(this.properties["transistor" + n]).wait(ANIMATION_TIME).call(jQuery.proxy(obj.go, obj));
			
			this.transistorArrows[n].resetPoints();
		} else if (this.properties["dataline" + n] == "" && this.properties["transistor" + n] && this.properties["transistor" + n].indexOf("closed") != -1 && this.properties["capacitor" + n] && this.properties["capacitor" + n].indexOf("charged") != -1) {
			// discharge this capacitor
			this.capacitorArrows[n].resetPoints();
			this.capacitorArrows[n].update(true);
			this.setProperty("capacitor" + n, "");
			this.properties["capacitor" + n + "Charge"] = { charge: 1.0 };
			Tween.get(this.properties["capacitor" + n + "Charge"]).to( { charge: 0 }, 1500);			
		}
	},
	
	chargeTransistor: function (n) {
		this.setProperty("transistor" + n, "charged,closed");
	},

	openTransistor: function (n) {
		this.setProperty("transistor" + n, "");
	},

	onTouchDataLine: function (n) {		
		var setting = this.properties["dataline" + n] == "charged" ? '': 'charged';
		
		this.setProperty("dataline" + n, setting);
		
		this.properties["dataline" + n + "Charge"] = { charge: 0 };
		
		Tween.removeTweens(this.properties["dataline" + n + "Charge"]);
		Tween.removeTweens(this.properties["transistor" + n]);

		Tween.get(this.properties["dataline" + n + "Charge"]).to( { charge: 1.0 }, ANIMATION_TIME);
		
		if (setting == "charged") {
			if (this.properties["transistor" + n].indexOf("closed") != -1) {
				var obj = { index: n, go: function () { ram.chargeTransistor(this.index); } };
				Tween.get(this.properties["transistor" + n]).wait(ANIMATION_TIME).call(jQuery.proxy(obj.go, obj));
			}
			this.dataArrows[n].resetPoints();
			this.transistorArrows[n].resetPoints();
		}		
	},
	
	initialize: function () {
		this.addressArrows = new ArrowSet( { pathString: "M 2 499 L 1058 23", angle: -24, count: 7, offset: 180 } );
		this.dataArrows = new Array();
		this.junctionArrows = new Array();
		this.transistorArrows = new Array();
		this.capacitorArrows = new Array();
		
		for (var i = 0; i < 8; i++) {
			this.properties["transistor" + i] = "";
			this.properties["dataline" + i + "Charge"] = { charge: 1.0 };
			this.properties["capacitor" + i + "Charge"] = { charge: 0.0 };
			
			var slope = -450 / 1002;
			
			var x1 = -138 + (i * 120) + 40;
			var y1 = 90 + x1 * slope + 105;
			var x2 = -138 + (i * 120) + 302;
			var y2 = 90 + x1 * slope + 650;
			var s = "M " + x2 + " " + y2 + " L " + x1 + " " + y1;
			this.dataArrows[i] = new ArrowSet({ pathString: s, angle: -112, count: 3, speed: 50, offset: 220, delayRestart: 40 });

//pathString, angle, count, offset, speed, delayRestart, opts

			x1 = -150 + (i * 120) + 278;
			y1 = 70 + x1 * slope + 435;
			x2 = x1 - 12;
			y2 = y1 + 65;
			s = "M " + x1 + " " + y1 + " L " + x2 + " " + y2;
			this.junctionArrows[i] = new ArrowSet({ pathString: s, angle: 103, count: 1, offset: i * -20 - 1, speed: 4, delayRestart: -50 });
			
			x1 = -150 + (i * 120) + 220;
			y1 = 70 + x1 * slope + 522;
			x2 = x1 + 90;
			y2 = y1 - 48;
			var x3 = x2 - 8, y3 = y2 + 65;
			s = "M " + x1 + " " + y1 + " L " + x2 + " " + y2 + " T " + x3 + " " + y3;
			this.transistorArrows[i] = new ArrowSet( { pathString: s, angle: -24, count: 1, offset: -1, speed: 12, delayRestart: -50, aim: true, splash: "spark", index: i } );
			
			x1 = -150 + (i * 120) + 210;
			y1 = 70 + x1 * slope + 522;
			x2 = x1 + 100;
			y2 = y1 - 54;
			var x3 = x2 - 8, y3 = y2 + 65;
			var xx = -138 + (i * 120);
			var yy = 90 + xx * slope;
			var x4 = xx + 310;
			var y4 = yy + 650;
			s = "M " + x3 + " " + y3 + " L " + x2 + " " + y2 + " T " + x1 + " " + y1 + " L " + x4 + " " + y4;
			this.capacitorArrows[i] = new ArrowSet( { pathString: s, angle: -24, count: 1, offset: -1, speed: 12, delayRestart: -50, aim: true, flip: true, splash: "spark", index: i } );
		}
	},
	
	draw: function () {		
		var i, xx, yy, slope;
		
		var ctx = getContext();
		ctx.clearRect(0, 0, 1024, 768);
		
		xx = 0, yy = 70;
		slope = -450 / 1002;
		
		for (i = 0; i < 8; i++) {
			xx = -150 + (i * 120);
			yy = 70 + xx * slope;
			
			var charge = this.properties["capacitor" + i + "Charge"].charge;
			if (this.properties["capacitor" + i] == "charged") {
				if (charge < 1) {
					ctx.globalAlpha = charge;
					ctx.drawImage(this.images["capacitor_charged"], xx + 275, yy + 371);
					ctx.globalAlpha = 1.0 - charge;
					ctx.drawImage(this.images["capacitor_uncharged"], xx + 275, yy + 371);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.drawImage(this.images["capacitor_charged"], xx + 275, yy + 371);
				}					
			} else {
				if (charge < 1) {
					ctx.globalAlpha = charge;
					ctx.drawImage(this.images["capacitor_charged"], xx + 275, yy + 371);
					ctx.globalAlpha = 1.0 - charge;
					ctx.drawImage(this.images["capacitor_uncharged"], xx + 275, yy + 371);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.drawImage(this.images["capacitor_uncharged"], xx + 275, yy + 371);
				}
			}

			var state = this.properties["transistor" + i];
			if (state.indexOf("charged") != -1) {
				ctx.drawImage(this.images["transistor_charged_closed"], xx + 226, yy + 366);
			} else if (state.indexOf("closed") != -1) {
				ctx.drawImage(this.images["transistor_uncharged_closed"], xx + 225, yy + 367);
			} else {
				ctx.drawImage(this.images["transistor_uncharged_open"], xx + 240, yy + 366);
			}
			
			if (this.properties["dataline" + i] == "charged") {
				var charge = this.properties["dataline" + i + "Charge"].charge;
				if (charge < 1) {
					ctx.globalAlpha = charge;
					ctx.drawImage(this.images["dataline_charged"], xx, yy);
					ctx.globalAlpha = 1.0 - charge;
					ctx.drawImage(this.images["dataline_uncharged"], xx, yy);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.drawImage(this.images["dataline_charged"], xx, yy);
				}
			} else {
				var charge = this.properties["dataline" + i + "Charge"].charge;
				if (charge < 1) {
					ctx.globalAlpha = charge;
					ctx.drawImage(this.images["dataline_uncharged"], xx, yy);
					ctx.globalAlpha = 1.0 - charge;
					ctx.drawImage(this.images["dataline_charged"], xx, yy);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.drawImage(this.images["dataline_uncharged"], xx, yy);
				}
			}
			
			if (this.properties.addressline == 'charged') {
				if (this.properties.addresslineCharge < 1) {
					ctx.globalAlpha = this.properties.addresslineCharge;
					ctx.drawImage(this.images["junction_charged"], xx + 253, yy + 298);
					ctx.globalAlpha = 1.0 - this.properties.addresslineCharge;
					ctx.drawImage(this.images["junction_uncharged"], xx + 253, yy + 298);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.drawImage(this.images["junction_charged"], xx + 253, yy + 298);
				}
			} else {
				if (this.properties.addresslineCharge < 1) {
					ctx.globalAlpha = this.properties.addresslineCharge;
					ctx.drawImage(this.images["junction_uncharged"], xx + 253, yy + 298);
					ctx.globalAlpha = 1.0 - this.properties.addresslineCharge;
					ctx.drawImage(this.images["junction_charged"], xx + 253, yy + 298);
					ctx.globalAlpha = 1.0;
				} else {
					ctx.drawImage(this.images["junction_uncharged"], xx + 253, yy + 298);
				}
			}
		}

		for (i = 0; i < 8; i++) {
			this.dataArrows[i].draw();
			this.junctionArrows[i].draw();
			this.transistorArrows[i].draw();
			this.capacitorArrows[i].draw();
		}

		if (this.properties.addressline == 'charged') {
			if (this.properties.addresslineCharge < 1) {
				ctx.globalAlpha = this.properties.addresslineCharge;
				ctx.drawImage(this.images["addressline_charged"], -20, 30);
				ctx.globalAlpha = 1.0 - this.properties.addresslineCharge;
				ctx.drawImage(this.images["addressline_uncharged"], -20, 30);
				ctx.globalAlpha = 1.0;
			} else {
				ctx.drawImage(this.images["addressline_charged"], -20, 30);
			}
		} else {
			if (this.properties.addresslineCharge < 1) {
				ctx.globalAlpha = this.properties.addresslineCharge;
				ctx.drawImage(this.images["addressline_uncharged"], -20, 30);
				ctx.globalAlpha = 1.0 - this.properties.addresslineCharge;
				ctx.drawImage(this.images["addressline_charged"], -20, 30);
				ctx.globalAlpha = 1.0;
			} else {
				ctx.drawImage(this.images["addressline_uncharged"], -20, 30);
			}
		}
		
		this.addressArrows.draw();		
	},
	
	update: function () {
		this.addressArrows.update(this.properties.addressline == 'charged');
		
		for (i = 0; i < 8; i++) {
			this.dataArrows[i].update(this.properties["dataline" + i] == 'charged');
			this.junctionArrows[i].update(this.properties.addressline == 'charged');
			
			var state = this.properties["transistor" + i];
			this.transistorArrows[i].update(state.indexOf("charged") != -1 && this.properties["dataline" + i] == 'charged');
			
			state = this.properties["capacitor" + i] == "charged" && this.properties["transistor" + i].indexOf("closed") != -1 && this.properties["dataline" + i] == "";
			this.capacitorArrows[i].update(state);
		}
	},
	
	setBit: function (index) {
		$("#bit" + index).html("1");
		
		var s = "", val = 0;
		for (var i = 0; i < 8; i++) {
			var c = $("#bit" + i).html();
			if (c == "1") {
				val += (Math.pow(2, (7 - i)));
			}
			s += c;
		}
		
		if (val < 32 || val >= 127) {
			$("#result_caption").html(s + " = " + val);
		} else {
			$("#result_caption").html(s + " = " + String.fromCharCode(val));
		}
	},
}

function ArrowSet (opts) {	
//pathString, angle, count, offset, speed, delayRestart, opts
	this.path = raff.path(opts.pathString);
	this.angle = opts.angle;
	this.path.hide();
	this.len = this.path.getTotalLength();
	this.count = opts.count;
	this.offset = opts.offset;
	this.hasSplash = false;
	this.splashTimer = 0;
	
	if (opts.speed == undefined) this.speed = 60;
	else this.speed = opts.speed;
	
	if (opts.delayRestart == undefined) this.delayRestart = 0;
	else this.delayRestart = opts.delayRestart;
	
	this.opts = opts;
	
	this.resetPoints();
}

ArrowSet.prototype = {
	resetPoints: function () {
		// points
		this.pts = [];
		for (var i = 0; i < this.count; i++) {
			var offset = -i * this.offset - 1;
			if (this.count == 1) {
				offset = this.offset;
			}
			this.pts.push( { pos: offset, visible: true } );
		}
		
		this.hasSplash = false;
	},
	
	update: function (charged) {
		for (var i = 0; i < this.pts.length; i++) {
			var pt = this.pts[i];
			if (pt.pos < 0 && !charged) {
				// waiting for charge
			} else {
				if (pt.pos < this.len) {
					pt.pos += this.speed;
				} else if (charged == true) {
					if (this.opts && this.opts.splash && this.hasSplash == false) {
						this.splashPos = pt.pos;
						this.splashTimer = 10;
						this.splashDuration = 10;
						this.hasSplash = true;
						
						ram.setProperty("capacitor" + this.opts.index, "charged");
						Tween.get(ram.properties["capacitor" + this.opts.index + "Charge"]).to( { charge: 1.0 }, 250);
						
						ram.setBit(this.opts.index, 1);
					}
					pt.pos = this.delayRestart;
				} else if (this.opts && this.opts.splash && this.hasSplash == false) {
					this.splashPos = pt.pos;
					this.splashTimer = 10;
					this.splashDuration = 10;
					this.hasSplash = true;
					
					ram.setBit(this.opts.index, 1);
				} else {
					pt.visible = false;					
				}
			}
		}
	},
	
	draw: function () {
		var ctx = getContext();
		
		for (var i = 0; i < this.pts.length; i++) {
			var pt = this.pts[i];
			
			if (pt.visible && pt.pos >= 0) {
				var p = this.path.getPointAtLength(pt.pos);
				
				var angle = this.angle / 180 * Math.PI;
				if (this.opts && this.opts.aim == true) {
					var palpha = p.alpha;
					// NOTE: kludge to accommodate a strange return angle
					if (this.opts.flip || (palpha > 90 && palpha < 150)) palpha = palpha + 180;
					if (this.opts.flip && palpha > 270 && palpha < 300) palpha += 180;
					angle = (palpha + 180)  / 180 * Math.PI;
				}
				drawRotatedImage(ram.images["dart"], p.x, p.y, angle);
			}
			
			if (this.hasSplash && this.splashTimer > 0) {
				var p = this.path.getPointAtLength(this.splashPos);
				var img = ram.images[this.opts.splash];
				ctx.globalAlpha = this.splashTimer / this.splashDuration;
				ctx.drawImage(img, p.x - img.width * .5, p.y - img.height * .5);
				ctx.globalAlpha = 1.0;
				this.splashTimer--;
				/*
				if (this.splashTimer <= 0) {
					this.hasSplash = false;
				}
				*/
			}
		}
	}
}
