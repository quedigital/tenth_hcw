define(["jquery", "jqueryui"], function ($) {
	// number, text, image, anchor
	Step = function (options) {
		// TODO: Handlebars or Mustache (or even Backbone)?
		this.elem = $("<div>").addClass("step");
		
		this.elem.data("step", this);
		
		$("<span>").addClass(options.number == 1 ? "diamond" : "block")
			.append("<span>" + options.number)
			.appendTo(this.elem);
		
		// TODO: use a div with a background-image to allow for easier scaling?
		if (options.image) {
			var img = $("<img>").attr("src", options.image);
			var div = $("<div>").addClass("image").append(img);
			this.elem.append(div);
		}
		
		// adding support for resizing the text to fit Fixed layouts
		var d = $("<div>").addClass("textblock");
		
		$("<span>").addClass("span-text").html(options.text).appendTo(d);
		
		this.number = options.number;
		this.anchor = options.anchor;
		this.bounds = options.bounds;
		
		d.appendTo(this.elem);
		
		if (this.bounds) {
			//this.elem.find(".textblock").css( { width: this.bounds.width, height: this.bounds.height } ).addClass("resizeable");
			this.elem.find(".textblock").addClass("resizeable").css("font-size", "12px");
			this.elem.css( { width: this.bounds.width } );//, height: this.bounds.height } );
		}		
	}
	
	Step.prototype = Object.create(null);
	Step.prototype.constructor = Step;

	Step.prototype.setPosition = function (x, y) {
		this.x = x;
		this.y = y;
		
//		this.elem.css( { left: this.x, top: this.y } );
		
		this.position(false);		
	}
	
	function rectInRect (rect1, rect2) {
		if (rect1.left >= rect2.left && rect1.right <= rect2.rect && rect1.top >= rect2.top && rect1.bottom <= rect2.bottom) {
			return true;
		} else {
			return false;
		}
	}
	
	function opposite (anchor) {
		var opp = anchor.split(" ");
		if (opp[0] == "left") opp[0] = "right";
		else if (opp[0] == "right") opp[0] = "left";
		if (opp[1] == "top") opp[1] = "bottom";
		else if (opp[1] == "bottom") opp[1] = "top";
		return opp;
	}
	
	function reflow (elem) {
		// NOTE: this hack forces a reflow so we can get the text height properly
		elem.hide().show(0);
//		elem[0].offsetWidth;
	}
	
	// TODO: optimize this for better fitting
	Step.prototype.position = function (expand) {
		var pos;

		switch (this.anchor) {
			case "right bottom":
				pos = { x: this.bounds.left + this.bounds.width, y: this.bounds.top + this.bounds.height };
				break;
			case "left bottom":
				pos = { x: this.bounds.left, y: this.bounds.top + this.bounds.height };
				break;
			case "left top":
			case "left":
				pos = { x: this.bounds.left, y: this.bounds.top };
				break;
			case "right top":
			case "right":
				pos = { x: this.bounds.left + this.bounds.width, y: this.bounds.top };
				break;
		}

		var DEFAULT_FONT_SIZE = 12, MARGIN = 30;
		var fs = DEFAULT_FONT_SIZE;
		
		var scrollLeft = this.elem.parent().scrollLeft();
		
		// TODO: why isn't step #2 positioned with right-bottom in the same place as it is when highlighted? (esp. in full height window)
		if (!expand) {
			var t = this.elem.find(".textblock");
			t.css("font-size", "12px");
			this.elem.height("auto");//this.bounds.height);
			t.height("auto");//this.bounds.height);
			this.elem.css("width", this.bounds.width);
			if (t.height() > this.bounds.height) {
				t.height(this.bounds.height);
			}
			
			if (t.height() < t[0].scrollHeight) {
				this.elem.addClass("overflow");
			} else {
				this.elem.removeClass("overflow");
			}
			
			var at = "left+" + Math.floor(pos.x - scrollLeft) + "px top+" + Math.floor(pos.y) + "px";
			this.elem.position( { my: this.anchor, at: at, of: this.elem.parent(), collision: "none" } );
			
		} else {
			var offscreen = this.elem.clone();
			offscreen.css("opacity", "0");
			this.elem.parent().append(offscreen);

			offscreen.height("auto");
			offscreen.find(".textblock").height("auto");
			
			// find width of image (ie, not the spread, which is limited to the column width)
			var container_w = this.elem.siblings(".background").width();
			var container_h = this.elem.parent().height() - MARGIN;
			
			// expand the width and move opposite the anchor point until we fit
			var JUMP = 5;
			var atWidth = false, atHeight = false;
			
			var x = this.elem.position().left + scrollLeft;
			var y = this.elem.position().top;
			var w = parseInt(offscreen.css("width"));	
			var h = offscreen.find(".textblock").height();
			
			moveHighlightTo(x, y, w, this.elem.height());
			
			for (var tries = 0; tries < 100; tries++) {
//				if (x >= 0 && y >= 0 && y + h <= container_h) break;
			
				var direction = opposite(this.anchor);
			
				switch (direction[0]) {
					case "left":
						// if we're already hitting the edge, shrink us
						if (x > JUMP) x -= JUMP;
						else {
							x = 0;
							atWidth = true;
						}
						w = this.bounds.left + this.bounds.width - x;
						break;
					case "right":
						// expand to the right until we're not over the bottom
						if (x + w + JUMP < container_w) {
							w += JUMP;							
						} else {
							w = container_w - x;
							atWidth = true;
						}
						break;
				}
		
				switch (direction[1]) {
					case "top":
						y = this.bounds.top + this.bounds.height - h;
						atHeight = true;
						break;
					case "bottom":
						break;
				}
			
				// try reducing font
				if (atWidth && atHeight) {
					if (fs > 8) {
						fs -= .5;
						offscreen.find(".textblock").css("font-size", fs + "px");
					}
				}
			
				offscreen.css("left", x).css("top", y);
				offscreen.css("width", w);
				
				reflow(offscreen);
				
				h = offscreen.find(".textblock").height();
			
				if (x >= 0 && y >= MARGIN && y + h <= container_h) break;
			}
			
			moveHighlightTo(this.elem);
			
			this.elem.css("left", x).css("top", y);
			this.elem.css("width", w);
			this.elem.find(".textblock").height("auto");
			if (fs != DEFAULT_FONT_SIZE) {
				this.elem.find(".textblock").css("font-size", fs + "px");
			}

			
			animateHighlightTo(x, y, w, h);
			
			offscreen.remove();
		}		
	}
	
	function moveHighlightTo (x, y, w, h) {
		x -= 10;
		w += 20;
		y -= 20;
		h += 40;
				
		$(".highlighted").width(w).height(h).css( { left: x, top: y } );
	}
	
	function animateHighlightTo (x, y, w, h) {
		$(".highlighted").addClass("animated");
		
		x -= 10;
		w += 20;
		y -= 20;
		h += 40;
				
		$(".highlighted").width(w).height(h).css( { left: x, top: y } );
	}
	
	Step.prototype.onHover = function (event) {
		switch (event.type) {
			case "mouseenter":
				this.elem.css("zIndex", 2);
				
				this.elem.addClass("animated selected");
				
				$(".highlight").addClass("highlighted");
				
				this.position(true);
				
				break;
				
			case "mouseleave":
				$(".step.selected").removeClass("selected");
				
				$(".highlighted").removeClass("highlighted animated");
				
				this.elem.css("zIndex", "auto");
				
				this.position(false);
		
				break;
		}
	}
	
	return Step;	
});
