var UPDATE_INTERVAL = 40;
var COLS = 8;

var images = new Array();

var boat1 = {};
var boat2 = {};

var boat_left, boat_middle, boat_right;
var arrow;//, bandwidth_button;

//var raff;

var lastTouchBandwidth_x, lastTouchSpeed_x;

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault() ;
}

function restart () {
	boat1 = { x: 1024 - 150, y: 50, width: 50, starting_bandwidth: 6000, bandwidth: 6000, speed: 6, mode: "setting", crates: [] };
	boat2 = { x: 1024 - 150, y: 180, width: 50, starting_bandwidth: 15000, bandwidth: 15000, speed: 4, mode: "setting", crates: [] };
	
	initializeCargo(boat1);
	buildCargo(boat1);
	dropCrates(boat1);

	initializeCargo(boat2);
	buildCargo(boat2);
	dropCrates(boat2);
	
	boat1.x = 1024 - 150 - boat1.width - 65;
	boat2.x = 1024 - 150 - boat2.width - 65;
}

function quasi_restart () {
	boat1 = { x: 1024 - 150, y: 50, width: 50, bandwidth: boat1.starting_bandwidth, speed: boat1.speed, starting_bandwidth: boat1.bandwidth, mode: "setting", crates: [], startTime: 0 };
	boat2 = { x: 1024 - 150, y: 180, width: 50, bandwidth: boat2.starting_bandwidth, speed: boat2.speed, starting_bandwidth: boat2.bandwidth, mode: "setting", crates: [], startTime: 0 };
	
	initializeCargo(boat1);
	buildCargo(boat1);
	dropCrates(boat1);

	initializeCargo(boat2);
	buildCargo(boat2);
	dropCrates(boat2);
	
	boat1.x = 1024 - 150 - boat1.width - 65;
	boat2.x = 1024 - 150 - boat2.width - 65;
}

function onGo () {
	boat1.mode = "sailing";
	boat2.mode = "sailing";
	
	var obj = $("#go_button")[0];
	obj.style.opacity = "1";
	Tween.get(obj.style, { css: true }).to({ opacity: 0 }, 500).call(function () { this.display = "none"; });
	
	/*
	obj = $("#speed_button")[0];
	obj.style.opacity = "1";
	Tween.get(obj.style, { css: true }).to({ opacity: 0 }, 500);

	obj = $("#bandwidth_button")[0];
	obj.style.opacity = "1";
	Tween.get(obj.style, { css: true }).to({ opacity: 0 }, 500);
	*/

	obj = $("#restart_button")[0];
	obj.style.opacity = "0";
	obj.style.display = "block";
	Tween.get(obj.style, { css: true }).to({ opacity: 1 }, 500);
	
	boat1.startTime = boat2.startTime = new Date();
	
//	$("#go_button").css("display", "none");
//	$("#speed_button").css("display", "none");
//	$("#bandwidth_button").css("display", "none");
//	$("#restart_button").css("display", "block");
}

function onRestart () {
	quasi_restart();
	
	var obj = $("#go_button")[0];
	obj.style.opacity = "0";
	obj.style.display = "block";
	Tween.get(obj.style, { css: true }).to({ opacity: 1 }, 500);
	
	obj = $("#speed_button")[0];
	obj.style.opacity = "0";
	Tween.get(obj.style, { css: true }).to({ opacity: 1 }, 500);

	obj = $("#bandwidth_button")[0];
	obj.style.opacity = "0";
	Tween.get(obj.style, { css: true }).to({ opacity: 1 }, 500);

	obj = $("#restart_button")[0];
	obj.style.opacity = "1";
	obj.style.display = "block";
	Tween.get(obj.style, { css: true }).to({ opacity: 0 }, 500).call(function () { this.display = "none"; });
	
	$("#elapsed1").text("0:00");
	$("#elapsed2").text("0:00");

	/*
	$("#go_button").css("display", "block");
	$("#speed_button").css("display", "block");
	$("#bandwidth_button").css("display", "block");
	$("#restart_button").css("display", "none");
	*/
}

function changingSettings () {
	if (boat2.mode == "sailing") {
		boat2.mode = "setting";
	}
}

function ontouchslider_bandwidth_start (event) {
	boat2.previousMode = boat2.mode;
	
	if (boat2.mode == "sailing") {
		boat2.mode = "setting";
	}
}

function ontouchslider_bandwidth_move (event) {
	if (boat2.mode == "setting") {
		if (lastTouchBandwidth_x != undefined) {
			var xx = event.touches[0].clientX;
			
			var deltaX = xx - lastTouchBandwidth_x;
			var newBandwidth = boat2.bandwidth + deltaX * 400;
			boat2.bandwidth = Math.min(54000, Math.max(3000, newBandwidth));
			
			buildCargo(boat2);
		}
		
		lastTouchBandwidth_x = event.touches[0].clientX;
		
		changingSettings();
	}
}

function ontouchslider_bandwidth_end (event) {
	if (boat2.mode == "setting") {
		lastTouchBandwidth_x = undefined;
		
		dropCrates(boat2);
		
	//	boat1.mode = boat2.mode = "sailing";	
		boat2.mode = boat2.previousMode;
		boat2.previousMode = "";
	}
}

function ontouchslider_speed_move (event) {
	if (lastTouchSpeed_x != undefined) {
		var xx = event.touches[0].clientX;
		
		var deltaX = xx - lastTouchSpeed_x;
		var newSpeed = boat2.speed + deltaX * .05;
		boat2.speed = Math.min(8, Math.max(1, newSpeed));
	}
	
	lastTouchSpeed_x = event.touches[0].clientX;
}

function ontouchslider_speed_end (event) {
	lastTouchSpeed_x = undefined;
}

function onHandleScale (event) {
	if (boat1.mode == "setting") {
		var s = boat1.starting_bandwidth * event.scale;
		if (s < 3000) s = 3000;
		else if (s > 54000) s = 54000;
		
		boat1.bandwidth = s;
		
		buildCargo(boat1);
	}
}

function onGestureEnd (event) {
	if (boat1.mode == "setting") {
		dropCrates(boat1);
		
		boat1.starting_bandwidth = boat1.bandwidth;
		
		boat1.mode = "sailing";
	}
}

function onGestureStart (event) {
	if (boat1.mode == "sailing")
		boat1.mode = "setting";
}

function onTestGesture () {
	boat2.bandwidth += 500;
	
	buildCargo(boat2);
}

function isCargoLeft (boat) {
	for (var i = 0; i < boat.crates.length; i++) {
		if (boat.crates[i].new) return true;
	}
	return false;
}

function draw () {
	var canvas = $("#myCanvas")[0];
	var context = canvas.getContext("2d");

	context.clearRect(0, 0, 1024, 250);
	
	context.save();
	
	context.beginPath();
	context.rect(150, boat1.y - 40, 1024 - 300, 220);
	context.clip();

	context.drawImage(boat_left, boat1.x, boat1.y - 7);
	context.drawImage(boat_middle, boat1.x + boat_left.width - 2, boat1.y, boat1.width, boat_middle.height);
	context.drawImage(boat_right, boat1.x + boat_left.width + boat1.width - 7, boat1.y - 19);
	context.drawImage(arrow, boat1.x + 60 - arrow.width - 5, boat1.y + 13);

	context.drawImage(boat_left, boat2.x, boat2.y - 7);
	context.drawImage(boat_middle, boat2.x + boat_left.width - 2, boat2.y, boat2.width, boat_middle.height);
	context.drawImage(boat_right, boat2.x + boat_left.width + boat2.width - 7, boat2.y - 19);
	context.drawImage(arrow, boat2.x + 60 - arrow.width - 5, boat2.y + 13);

	// water
	var my_gradient = context.createLinearGradient(0, boat1.y + 3, 0, boat1.y + 20);
	my_gradient.addColorStop(0, "rgba(60, 196, 205, .5)");
	my_gradient.addColorStop(1, "rgba(240, 238, 219, 0)");
	context.fillStyle = my_gradient;
	context.fillRect(150, boat1.y + 3, 1024 - 300, 20);
	
	// labels
	context.font = "8pt Futura";
	context.textAlign = "left";
	context.fillStyle = "black";
	context.fillText(Math.floor(boat1.speed * 5) + " knots", boat1.x + 60, boat1.y + 20);
	context.fillText(Math.floor(boat2.speed * 5) + " knots", boat2.x + 60, boat2.y + 20);
	
	// more water
	my_gradient = context.createLinearGradient(0, boat2.y + 3, 0, boat2.y + 20);
	my_gradient.addColorStop(0, "rgba(60, 196, 205, .5)");
	my_gradient.addColorStop(1, "rgba(240, 238, 219, 0)");
	context.fillStyle = my_gradient;
	context.fillRect(150, boat2.y + 3, 1024 - 300, 20);
	
	context.restore();
	
	drawCrates(boat1, boat1.y);	
	drawCrates(boat2, boat2.y);	
}

function onTestCargo () {
	boat1.bandwidth += 6000;
	buildCargo(boat1);
	dropCrates(boat1);
}

function initializeCargo (boat) {
	boat.crates = [];

	for (var i = 0; i < 32; i++) {
		var n = i % COLS;
		var x = (1024 - 130) + n * 17;
		var y = 110 - Math.floor(i / COLS) * 6;
		
		var crate = { x: x, y: y, width: 15, height: 5, new: true };
		boat.crates.push(crate);
	}
}

function getBigCrates (boat) {
	var r = [];
	for (var i = 0; i < boat.crates.length; i++) {
		var crate = boat.crates[i];
		if (crate.onboard) r.push(crate);
	}
	return r;
}

function buildCargo (boat) {
	var i = 0;
	var crates = Math.floor(boat.bandwidth / 3000);
	
	if (boat.numCrates == crates) return;
	else boat.numCrates = crates;
	
	var divisor = 2;
	var height = crates / divisor;
	
	while (height > 3) {
		divisor++;
		height = crates / divisor;
	}
	
	boat.height = height * 11;
	boat.width = (crates < divisor ? crates * 47 : divisor * 47);
	
	if (boat.previousMode == "setting") {
		boat.x = 1024 - 150 - boat.width - 65;
	}
	
	var existing = 0;
	for (i = 0; i < boat.crates.length; i++) {
		var crate = boat.crates[i];
		if (crate.fully_onboard) existing++;
	}
	
	// take (crates - existing) off the pile
	var count = crates - existing;
	i = 0;
	while (count > 0 && i < boat.crates.length) {
		if (boat.crates[i].new) {
			//boat.crates.splice(i, 1);
			var crate = boat.crates[i];
			crate.onboard = true;
			crate.fully_onboard = false;
			crate.new = false;
			crate.needsToLoad = true;
			crate.destY = 0;
			count--;
		}
		i++;
	}
	
	// now rearrange the ones on the ship's deck or waiting
	var row = 0, col = 0;
	var big_crates = getBigCrates(boat);
	for (i = 0; i < big_crates.length; i++) {
		var crate = big_crates[i];
		crate.x = col * 47;
		crate.y = -row * 11;
		crate.width = 45;
		crate.height = 10;
		col++;
		if (col >= divisor) {
			row++;
			col = 0;
		}
		if (crate.needsToLoad) {
			crate.destY = crate.y;
			crate.y -= 60;
		}
	}	
	
	// see if we need to take any off the ship
	var count = 0;
	i = 0;
	while (i < boat.crates.length) {
		var crate = boat.crates[i];
		if (crate.onboard) {
			if (count >= crates) {
				crate.onboard = false;
				crate.fully_onboard = false;
				crate.needsToLoad = false;
				crate.new = true;
				crate.width = 15;
				crate.height = 5;
				Tween.removeTweens(crate);
//				boat.crates.splice(i, 1);
				i++;
			} else {
				count++;
				i++;
			}
		} else
			i++;
	}
}

function checkForAllLoaded (url) {
	for (i = 0; i < images.length; i++) {
		if (images[i] == url) {
			images.splice(i, 1);
			break;
		}
	}
	
	if (images.length == 0) {
		// TODO: anything?
	}
}

function loadImage (url) {
	images.push(url);
	var image = new Image();
	image.src = url;
	image.onload = function (evt) { checkForAllLoaded(url); }
	return image;
}

function onUpdate () {
	Tween.tick(UPDATE_INTERVAL);
	
	if (boat1.mode == "sailing") {
		boat1.x -= boat1.speed;
		
		if (boat1.x < 152) {
			boat1.x = 152;
			boat1.mode = "unloading";			
		}
	} else if (boat1.mode == "unloading") {
		unloadCrates(boat1, boat1.y);
		
		boat1.delay = 1000 / UPDATE_INTERVAL;
		boat1.mode = "pausing";
	} else if (boat1.mode == "pausing") {
		boat1.delay--;
		if (boat1.delay == 0) {
			if (isCargoLeft(boat1)) {
				boat1.mode = "continuing";
			} else {
				boat1.mode = "done";
			}
		}
	} else if (boat1.mode == "continuing") {
		boat1.x -= boat1.speed * 2;
		if (boat1.x < 100 - boat1.width) {
			boat1.x = 1024 - 150;
			boat1.mode = "sailing";
			buildCargo(boat1);
			dropCrates(boat1);
		}
	}

	if (boat2.mode == "sailing") {
		boat2.x -= boat2.speed;
		
		if (boat2.x < 152) {
			boat2.x = 152;
			boat2.mode = "unloading";			
		}
	} else if (boat2.mode == "unloading") {
		unloadCrates(boat2, boat2.y);
		
		boat2.delay = 1000 / UPDATE_INTERVAL;
		boat2.mode = "pausing";
	} else if (boat2.mode == "pausing") {
		boat2.delay--;
		if (boat2.delay == 0) {
			if (isCargoLeft(boat2)) {
				boat2.mode = "continuing";
			} else {
				boat2.mode = "done";
			}
		}
	} else if (boat2.mode == "continuing") {
		boat2.x -= boat2.speed * 2;
		if (boat2.x < 100 - boat2.width) {
			boat2.x = 1024 - 150;
			boat2.mode = "sailing";
			buildCargo(boat2);
			dropCrates(boat2);
		}
	}
	
	var curTime = new Date();
	
	if (boat1.mode != "done" && boat1.mode != "setting") {
		$("#elapsed1").text(toFriendlyTime(curTime - boat1.startTime));	
	}
	
	if (boat2.mode != "done" && boat1.mode != "setting") {
		$("#elapsed2").text(toFriendlyTime(curTime - boat2.startTime));
	}
	
	draw();
}

function toFriendlyTime (secs) {
	var timeDiff = secs;
	var timeDiff = timeDiff / 1000;
	var seconds = Math.floor(timeDiff % 60);
	timeDiff /= Math.floor(60);
	var minutes = Math.floor(timeDiff % 60);
	
	var s = minutes + ":";
	if (seconds < 10) s += "0";
	s += seconds;
	
	return s;
}

function dropCrates (boat) {
	for (var i = 0; i < boat.crates.length; i++) {
		var crate = boat.crates[i];
		
		if (crate.needsToLoad) {
			var myTween = Tween.get(crate).to( { y: crate.destY }, 200 ).call(function () { this.fully_onboard = true; });
			crate.needsToLoad = false;
		}
	}
}

function unloadCrates (boat, start_y) {
	var i;
		
	var w2 = 15, h2 = 5;
	var j = 0;
	
	for (i = 0; i < boat.crates.length; i++) {
		var crate = boat.crates[i];
		if (!crate.onboard && !crate.new) j++;
	}
	
	for (i = 0; i < boat.crates.length; i++) {
		var crate = boat.crates[i];
		if (crate.onboard) {		
			var n = j % COLS;
			var x2 = 10 + n * 17;
			var y2 = start_y - Math.floor(j / COLS) * 6;
			
			crate.x = boat.x + crate.x;
			crate.y = boat.y + crate.y;
			crate.onboard = crate.fully_onboard = crate.needsToLoad = false;
			var myTween = Tween.get(crate).to( { x: x2, y: y2, width: w2, height: h2 }, 1000 );
			
			j++;
		}
	}
}

function drawCrates (boat, start_y) {
	var canvas = $("#myCanvas")[0];
	var context = canvas.getContext("2d");
	
	var newCrateNumber = 0;
	
	for (var i = 0; i < boat.crates.length; i++) {
		var crate = boat.crates[i];
		var xx = crate.x, yy = crate.y;
		if (crate.onboard) {
			xx += boat.x + 28;
			yy += boat.y - 9;
		}
		context.fillStyle = "#D03";
		
		if (crate.new) {
			var n = newCrateNumber % COLS;
			var x = (1024 - 140) + n * 17;
			var y = start_y - Math.floor(newCrateNumber / COLS) * 6;
			
			crate.x = x;
			crate.y = y;
			
			newCrateNumber++;
		}
		
		if (crate.new || xx < 1024 - 150) {	
			var ww = crate.width;
			var clipped = false;
			if (!crate.new && xx + ww > 1024 - 150) {
				ww = 1024 - 150 - xx;
				clipped = true;
			}
			context.fillRect(xx, yy, ww, crate.height);
		
			if (crate.onboard) {
				context.font = "5pt Futura";
				context.textAlign = "center";
				context.fillStyle = "white";
				
				// NOTE: turning clipping on only when needed seemed to really improve performance
				if (clipped) {
					context.save();
					context.beginPath();
					context.rect(150, boat.y - 40, 1024 - 300, 120);
					context.clip();
				}
				
				context.fillText("3,000 TONS", xx + crate.width * .5, yy + crate.height - 2);
				
				if (clipped) {
					context.restore();
				}
			}
		}
	}
}

$(document).ready(function () {
	var canvas = $("#myCanvas")[0];
	var context = canvas.getContext("2d");
	
//	raff = Raphael(0, 0, 1024, 400);
	
	// bandwidth button
	$('#bandwidth_button')[0].ontouchstart = ontouchslider_bandwidth_start;
	$('#bandwidth_button')[0].ontouchmove = ontouchslider_bandwidth_move;
	$('#bandwidth_button')[0].ontouchend = ontouchslider_bandwidth_end;
	
	// speed button
	$('#speed_button')[0].ontouchmove = ontouchslider_speed_move;
	$('#speed_button')[0].ontouchend = ontouchslider_speed_end;
	
	// go button
	$('#go_button')[0].onclick = onGo;
	
	// restart button
	$('#restart_button')[0].onclick = onRestart;
	
	arrow = loadImage("arrow.png");
	
	boat_left = loadImage("boat_left.png");
	boat_middle = loadImage("boat_middle.png");
	boat_right = loadImage("boat_right.png");

	/*
	var path = new paper.Path();
	// Give the stroke a color
	path.strokeColor = 'black';
	var start = new paper.Point(100, 100);
	// Move to start and draw a line from there
	path.moveTo(start);
	// Note that the plus operator on Point objects does not work
	// in JavaScript. Instead, we need to call the add() function:
//	path.lineTo(start.add([ 200, -50 ]));
	path.lineTo(new paper.Point(200, 200));
	// Draw the view now:
	paper.view.draw();
    */
    
	initializeCargo(boat1);
	buildCargo(boat1);
	dropCrates(boat1);

	initializeCargo(boat2);
	buildCargo(boat2);
	dropCrates(boat2);
    
	setInterval(onUpdate, UPDATE_INTERVAL);
	
	canvas.ontouchmove = onHandleScale;
	canvas.ongesturestart = onGestureStart;
	canvas.ongestureend = onGestureEnd;
	
	restart();
	
	/*
//	canvas.onmousedown = onTestCargo;	
	canvas.onmousedown = onTestGesture;
	canvas.onmouseup = onGestureEnd;
	*/
});
