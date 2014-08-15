define([], function () {

	// title, text, image
	CalloutLine = function (container, from, to, coords) {
		var canvas = $("<canvas>").attr({ width: 10, height: 10 });
		
		canvas.appendTo(container);
		canvas.position( { my: "left top", at: "left top", of: from.find(".block"), collision: "none" } );
		
		var img = to.find("img");
		
		var target = $("<div>").addClass("callout-line-target").offset({ top: 0, left: 0 });
		img.parent().append(target);

		target.position( { my: "center", at: coords, of: img, collision: "none" } );
		
		var viewSource = canvas[0].getBoundingClientRect();
		var viewTarget = target[0].getBoundingClientRect();
		
		var dx = Math.round(viewTarget.left - viewSource.left);
		var dy = Math.round(viewTarget.top - viewSource.top);
		
		// TODO: diagonal lines?
		
		var dir = undefined;
		var startX = 0, startY = 0;
		
		if (dy < 10) {
			dir = "horizontal";
			if (dx > 0)
				startX = Math.floor(from.find(".block").width());
			else
				startX = 0;
			startY = 1;
		} else if (dx < 10) {
			dir = "vertical";
			startX = Math.floor(from.find(".block").width() * .5);
		} else if (dy > from.outerHeight()) {
			dir = "BL";
			startX = Math.floor(from.find(".block").width() * .5);
			startY = Math.floor(from.find(".block").height());
		} else {
			// NOTE: could also draw from middle of block up and then over
			dir = "TR";
			if (dx > 0)
				startX = Math.floor(from.find(".block").width());
			else
				startX = 0;
			startY = 1;
		}
		
		// add some to the canvas to allow for line width (drawn from center)
		canvas[0].width = dx + 4;
		canvas[0].height = dy + 4;
		
		var context = canvas[0].getContext("2d");
		
		// offset the lines a bit so they aren't antialiased
		context.translate(.5, .5);
		
		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.moveTo(startX, startY);
		
		switch (dir) {
			case "horizontal":
				context.lineTo(dx, startY);
				break;
			
			case "vertical":
				context.lineTo(startX, dy);
				break;
				
			case "BL":
				context.lineTo(startX, dy);
				context.lineTo(dx, dy);
				break;
				
			case "TR":
				context.lineTo(dx, startY);
				context.lineTo(dx, dy);
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