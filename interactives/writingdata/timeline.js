var timeline;
var last_dx, lastPos;
var mouseDown = false;


function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault() ;
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
	document.body.onmousedown = function() { 
	  ++mouseDown;
	}
	document.body.onmouseup = function() {
	  --mouseDown;
	}

	timeline = new Timeline();
	
	timeline.createScrollingTimeline( { LEFT: 95, RIGHT: 800, OFF_LEFT: -750, toBeContinued: "#arrow" },
		[
			["#step1 .caption", "#step1 .image"],
			["#step2 .caption", "#step2 .image"],
			["#step3 .caption", "#step3 .image"],
			["#step4 .caption", "#step4 .image"],
			["#step5 .caption", "#step5 .image"],
			["#step6 .caption", "#step6 .image"],
			["#step7 .caption", "#step7 .image"],
			["#step8 .caption", "#step8 .image"],
		]
	);
	
	timeline.printKeyframes();
		
//	$("body").bind("mousedown", jQuery.proxy(this, "touchdown"));

	$("body").bind("mousedown", touchdown);
	$("body").bind("mousemove", touchmove);
	$("body").bind("mouseup", touchup);

	$(document).bind("touchstart", touchdown);
	$(document).bind("touchmove", true_touchmove);
	$(document).bind("touchend", touchup);
	
	$(".image").bind("dragstart", function () { return false; } );
	
	window.setInterval(update, 1000 / 24);
	
	timeline.gotoTime(1);	
}

function update () {
	timeline.update();
}

function touchdown () {
	Tween.removeTweens(timeline);
	
	lastPos = GetPos();
	last_dx = 0;
}

function true_touchmove () {
	touchmove(true);
}

function touchmove (isTrueTouch) {
	if (mouseDown || isTrueTouch) {
		var pos = GetPos();
		
		var dx = pos.x - lastPos.x;
		
		timeline.advance(-dx / 400);
		
		last_dx = dx;
		lastPos = GetPos();
	}
}

function touchup () {
	var t1 = timeline.currentTime;
	var t1_f = t1 - Math.floor(t1);
	
	if (last_dx <= 0) {
		if (t1_f > .2) {
			timeline.animateTo(Math.floor(t1) + 1);
		} else {
			timeline.animateTo(Math.floor(t1));
		}
	} else if (last_dx > 0) {
		if (t1_f < .8) {
			timeline.animateTo(Math.floor(t1));
		} else {
			timeline.animateTo(Math.floor(t1) + 1);
		}
	}
}

function interpolate (key, n) {
	var d = key.timeEnd - key.timeStart;
	var r = (n - key.timeStart) / d;
	var range = key.valEnd - key.valStart;
	return key.valStart + (range * r);
}

function Timeline () {
	this.objects = [];
	this.lastTime = undefined;
	this.keyframes = [];
	this.currentTime = undefined;
	this.previousTime = undefined;
	this.options = {};
	this.animating = false;
}

Timeline.prototype = {
	addKeyframe: function (target, obj) {
		this.keyframes.push( { target: target, obj: obj } );
		
		if (obj.timeEnd > this.lastTime || this.lastTime == undefined) {
			this.lastTime = obj.timeEnd;
		}
	},
	
	advance: function (n) {
		var newtime = this.currentTime + n;
		
		if (newtime < 1) newtime = 1;
		else if (newtime > this.lastTime) newtime = this.lastTime;
		
		this.gotoTime(newtime);		
	},
	
	gotoTime: function (n) {
		// go through all the objects, find the highest keyframe that isn't past this time and use it
		for (var i = 0; i < this.objects.length; i++) {
			var lastTimeEnd = -1;
			var lastKey = undefined;
			var found = false;
			for (var j = 0; j < this.keyframes.length; j++) {
				var key = this.keyframes[j];
				if (key.target == this.objects[i]) {
					if (n >= key.obj.timeStart && n <= key.obj.timeEnd) {
						var val = interpolate(key.obj, n);
						var target = this.keyframes[j].target;
						$(target).css(key.obj.property, val);
						found = true;
						break;
					} else if (n > key.obj.timeEnd && key.obj.timeEnd > lastTimeEnd) {
						lastKey = key;
						lastTimeEnd = key.obj.timeEnd;
					}
				}
			}
			
			if (!found) {
//				console.log("wanting to move " + lastKey.target + " " + lastKey.obj.property + " to " + lastKey.obj.valEnd);
				$(lastKey.target).css(lastKey.obj.property, lastKey.obj.valEnd);
			}
		}
		
		this.currentTime = n;
	},
	
	animateTo: function (n) {
		if (this.currentTime != n) {
			animating = true;
			Tween.get(this).to( { currentTime: n }, 500, Ease.cubicOut).call(this.done);
			$(this.options.toBeContinued).css("display", "none");
		}
	},
	
	done: function () {
		animating = false;
		if (this.currentTime < this.lastTime) {
			$(this.options.toBeContinued).css("display", "block");
		} else {
			$(this.options.toBeContinued).css("display", "none");
		}
		
		/*
		// enforce all the keyframes so we don't end up in an intermediate state
		for (var i = 0; i < this.keyframes.length; i++) {
			var key = this.keyframes[i];
			if (key.obj.timeStart < this.currentTime) {
				$(key.target).css(key.obj.property, key.obj.valEnd);
				console.log(key.target + " A");
			} else if (key.obj.timeStart > this.currentTime - 1) {
				$(key.target).css(key.obj.property, key.obj.valStart);
				console.log(key.target + " B");
			}
		}
		*/
	},
	
	update: function () {
		if (this.previousTime != this.currentTime) {
//			$("#time").html(this.currentTime);
			this.gotoTime(this.currentTime);
			this.previousTime = this.currentTime;
		}
	},
	
	createScrollingTimeline: function (options, array) {
		this.objects = [];
		for (var i = 0; i < array.length; i++) {
			this.objects.push(array[i][0]);
			this.objects.push(array[i][1]);
		}
		this.options = options;
		
		for (var i = 0; i < array.length; i++) {
			var caption = array[i][0];
			var image = array[i][1];
			
			if (i > 0) {
				this.addKeyframe(image, { timeStart: 0, timeEnd: 1, property: "opacity", valStart: 0, valEnd: 0 });
				this.addKeyframe(caption, { timeStart: 0, timeEnd: 1, property: "left", valStart: options.RIGHT, valEnd: options.RIGHT });
			}
			
			/*
			$(caption).css("left", options.RIGHT);
			$(image).css("opacity", 0);
			*/
			
			if (i < array.length - 1) {
				var t1 = i + 1;
				
				this.addKeyframe(image, { timeStart: t1, timeEnd: t1 + 1, property: "opacity", valStart: 1, valEnd: 0 });
				this.addKeyframe(caption, { timeStart: t1, timeEnd: t1 + 1, property: "left", valStart: options.LEFT, valEnd: options.OFF_LEFT });
			
				caption = array[i + 1][0];
				image = array[i + 1][1];
				
				this.addKeyframe(image, { timeStart: t1, timeEnd: t1 + 1, property: "opacity", valStart: 0, valEnd: 1 });
				this.addKeyframe(caption, { timeStart: t1, timeEnd: t1 + 1, property: "left", valStart: options.RIGHT, valEnd: options.LEFT });
			}
		}
	},
	
	printKeyframes: function () {
		for (var i = 0; i < this.keyframes.length; i++) {
			var key = this.keyframes[i];
			console.log(key.obj.timeStart + " to " + key.obj.timeEnd + " " + key.target + " " + key.obj.property + " = " + key.obj.valEnd);
		}
	}
}