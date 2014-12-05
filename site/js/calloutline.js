define(["Helpers"], function (Helpers) {

	// title, text, image
	CalloutLine = function (container, from, to, coords, options) {
		var canvas = $("<canvas>").attr({ width: 10, height: 10 });
		this.elem = canvas;
		canvas.addClass("callout-line");
		
		canvas.appendTo(container);
		
		var img = to.find("img");
		
		// TODO: fix this
		if (img.length == 0) return;
		
		var target = $("<div>").addClass("callout-line-target").offset({ top: 0, left: 0 });
		img.parent().append(target);

		target.position( { my: "center", at: coords, of: img, collision: "none" } );
		
		var elemSource = from;
		
		if (elemSource.length == 0) return;
		
		var viewSource = elemSource[0].getBoundingClientRect();
		var viewTarget = target[0].getBoundingClientRect();
		
		this.options = $.extend(options, {});
		
		// first, calculate the best layout for the callout line
		
		var x0 = Math.round(Math.min(viewTarget.left, viewSource.left));
		var x1 = Math.round(Math.max(viewTarget.left, viewSource.left));
		var dx = Math.abs(x0 - x1);
		var y0 = Math.round(Math.min(viewTarget.top, viewSource.top));
		var y1 = Math.round(Math.max(viewTarget.top, viewSource.top));
		var dy = Math.abs(y0 - y1);
		
		// TODO: diagonal lines?
		
		var dir = undefined;
		var startX = 0, startY = 0;
		
		if (this.options.style == "label") {
			startX = viewSource.left + viewSource.width * .5;
			
			dir = "VH";
			
			// adjust start Y depending on line direction / destination
			if (this.options.my[0] == "B" && this.options.at[0] == "T") {
				startY = viewSource.bottom;
			} else if (this.options.my[0] == "T" && this.options.at[0] == "B") {
				startY = viewSource.top;
			} else if (this.options.my == "L" && this.options.at == "R") {
				startY = viewSource.top + viewSource.height * .5;
				startX = viewSource.left;
				dir = "S";
			} else {
				startY = viewSource.bottom;
				console.log("Don't know where to start line for " + this.options.my + " and " + this.options.at);
			}
			
			if (dy < 10)
				dir = "horizontal";
		} else {
			var diffBottom = viewTarget.top - viewSource.top - elemSource.parent().outerHeight();
			
			if (dy < 10) {
				dir = "horizontal";
				if (viewTarget.left > viewSource.left)
					startX = viewSource.left + Math.floor(elemSource.width());
				else
					startX = viewSource.left;
				startY = viewSource.top + 1;
			} else if (dx < 10) {
				dir = "vertical";
				startX = viewSource.left + Math.floor(elemSource.width() * .5) + 1;
 				if (viewTarget.top < viewSource.top) {
					startY = viewSource.top;
				} else {
					startY = viewSource.top + viewSource.height + 1;
				}
			} else if (viewTarget.left < viewSource.left) {
				dir = "HV";
				if (from.hasClass("diamond")) {
					startX = viewSource.left + Math.floor(elemSource.width() * .5);
					startY = viewSource.top - 4;
				} else if (from.eq(0).hasClass("bounds")) {
					startX = viewSource.left - 4;
					startY = viewSource.top + 8;
				} else {
					startX = viewSource.left;
					startY = viewSource.top + 1;
				}
			// go above and right if we're wider than the parent
			} else if (dx > elemSource.parent().width()) {
				// NOTE: could also draw from middle of block up and then over
				dir = "HV";
				if (viewTarget.left > viewSource.left) {
					if (from.hasClass("diamond")) {
						startX = viewSource.left + Math.floor(elemSource.width() * .5);
						startY = viewSource.top - 4;
					} else if (from.eq(0).hasClass("bounds")) {
						startX = viewSource.left + Math.floor(elemSource.width());
						startY = viewSource.top + 8;
					} else {
						startX = viewSource.left + Math.floor(elemSource.width());
						startY = viewSource.top + 1;
					}
				} else {
					startX = viewSource.left;
					startY = viewSource.top + 1;
				}
			// go down and over (this is a problem if we overlap the next cell below)
			} else {
				dir = "VH";
				startX = viewSource.left + Math.floor(elemSource.width() * .5);
				if (viewSource.top < viewTarget.top) {
					startY = viewSource.top + Math.floor(elemSource.height());
				} else {
					startY = viewSource.top;
				}
			}
		}
		
		// now see how big a canvas we need
		
		x0 = Math.min(viewTarget.left, viewSource.left, startX);
		x1 = Math.max(viewTarget.left, viewSource.left, startX);
		y0 = Math.min(viewTarget.top, viewSource.top, startY);
		y1 = Math.max(viewTarget.top, viewSource.top, startY);
		
		var rangeX = Math.abs(x1 - x0);
		var rangeY = Math.abs(y1 - y0);
		
		var BORDER = 1;
		
		// add some to the canvas to allow for line width (drawn from center)
		canvas[0].width = rangeX + BORDER * 2;
		canvas[0].height = rangeY + BORDER * 2;

		var x_offsetFromSourceToCanvas = x0 - viewSource.left - BORDER;
		var y_offsetFromSourceToCanvas = y0 - viewSource.top - BORDER;
		
		// position the canvas relative to the source
		
		var atPos = "left-" + x_offsetFromSourceToCanvas + "px top-" + y_offsetFromSourceToCanvas + "px";
		canvas.position( { my: "left top", at: atPos, of: elemSource, collision: "none" } );
				
		var context = canvas[0].getContext("2d");

		// all coordinates are relative to the viewport, so translate them back
		context.translate(-x0 + BORDER, -y0 + BORDER);
		
		// use the color of the container for the line color
		context.strokeStyle = container.parents(".spread").css("color");
		
		this.canvas = canvas;
		this.target = target;
		
		this.dir = dir;
		
		this.startX = startX;
		this.startY = startY;
		this.targetX = viewTarget.left;
		this.targetY = viewTarget.top;
		
		this.drawn = false;
		
		if (this.options.alwaysVisible)
			this.animate();
	}
	
	CalloutLine.prototype = Object.create(null);
	CalloutLine.prototype.constructor = CalloutLine;
	
	CalloutLine.prototype.remove = function () {
		if (this.canvas)
			this.canvas.remove();
		if (this.target)
			this.target.remove();
	}
	
	CalloutLine.prototype.animate = function () {
		var context = this.canvas[0].getContext("2d");
		
		var startX = this.startX, startY = this.startY, targetX = this.targetX, targetY = this.targetY;
		
		context.lineWidth = 2;
		
		var points = [];
		
		points.push( { x: startX, y: startY } );
		
		switch (this.dir) {
			case "horizontal":
				points.push( { x: targetX, y: startY } );
				break;
			
			case "vertical":
				points.push( { x: startX, y: targetY } );
				break;
				
			case "VH":
				points.push( { x: startX, y: targetY } );
				points.push( { x: targetX, y: targetY } );
				break;
				
			case "HV":
				points.push( { x: targetX, y: startY } );
				points.push( { x: targetX, y: targetY } );
				break;
				
			case "S":
				var nextDX = (targetX - startX) * .5;
				nextDX = nextDX > 0 ? Math.max(5, nextDX) : Math.min(-5, nextDX);
				points.push( { x: startX + nextDX, y: startY } );
				points.push( { x: startX + nextDX, y: targetY } );
				points.push( { x: targetX, y: targetY } );
				break;
		}
		
		if (!this.drawn) {
			if (this.options.alwaysVisible) {
				Helpers.drawCanvasPath(points, this.canvas[0]);
			} else {
				Helpers.animateCanvasPath(points, this.canvas[0]);
			}
			this.drawn = true;
		}
	}

	function moveTo (context, x, y) {
		context.moveTo(Math.floor(x), Math.floor(y));
	}

	function lineTo (context, x, y) {
		context.lineTo(Math.floor(x), Math.floor(y));
		Helpers.animateCanvasLine(points, context);
	}
	
	return CalloutLine;
});