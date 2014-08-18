define([], function () {

	// title, text, image
	CalloutLine = function (container, from, to, coords) {
		var canvas = $("<canvas>").attr({ width: 10, height: 10 });
		
		canvas.appendTo(container);
		
		var img = to.find("img");
		
		var target = $("<div>").addClass("callout-line-target").offset({ top: 0, left: 0 });
		img.parent().append(target);

		target.position( { my: "center", at: coords, of: img, collision: "none" } );
		
		var elemSource = from.find(".block");
		var viewSource = elemSource[0].getBoundingClientRect();
		var viewTarget = target[0].getBoundingClientRect();
		
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
		
		if (dy < 10) {
			dir = "horizontal";
			if (viewTarget.left > viewSource.left)
				startX = viewSource.left + Math.floor(from.find(".block").width());
			else
				startX = viewSource.left;
			startY = 1;
		} else if (dx < 10) {
			dir = "vertical";
			startX = viewSource.left + Math.floor(from.find(".block").width() * .5);
		// go below text and then over:
		} else if (viewTarget.top - viewSource.top > from.outerHeight()) {
			dir = "BL";
			startX = viewSource.left + Math.floor(from.find(".block").width() * .5);
			startY = viewSource.top + Math.floor(from.find(".block").height());
		} else {
			// NOTE: could also draw from middle of block up and then over
			dir = "TR";
			if (viewTarget.left > viewSource.left)
				startX = viewSource.left + Math.floor(from.find(".block").width());
			else
				startX = viewSource.left;
			startY = viewSource.top + 1;
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
		
		// draw the actual lines
				
		context.lineWidth = 2;
		context.strokeStyle = "black";
		context.moveTo(startX, startY);
		
		switch (dir) {
			case "horizontal":
				context.lineTo(viewTarget.left, startY);
				break;
			
			case "vertical":
				context.lineTo(startX, viewTarget.top);
				break;
				
			case "BL":
				context.lineTo(startX, viewTarget.top);
				context.lineTo(viewTarget.left, viewTarget.top);
				break;
				
			case "TR":
				context.lineTo(viewTarget.left, startY);
				context.lineTo(viewTarget.left, viewTarget.top);
				break;
		}
		
		context.stroke();
		
		this.canvas = canvas;
		this.target = target;
	}
	
	CalloutLine.prototype = Object.create(null);
	CalloutLine.prototype.constructor = CalloutLine;
	
	CalloutLine.prototype.remove = function () {
		this.canvas.remove();
		this.target.remove();
	}
	
	return CalloutLine;
});