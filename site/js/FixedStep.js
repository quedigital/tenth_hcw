define(["Helpers"], function (Helpers) {
	var DEFAULT_FONT_SIZE = 12, MARGIN = 30;
	var SIDE_MARGIN = 15, INCREMENT = 10;
	
	// number, text, image, anchor
	FixedStep = function (options, hints) {
		// TODO: Handlebars or Mustache (or even Backbone)?
		this.elem = $("<div>").addClass("fixed_step");
		
		this.elem.data("step", this);
		
		if (options.title && options.title.length) {
			$("<h2>").html(options.title).appendTo(this.elem);
		}
		
		if (options.number != undefined && parseInt(options.number) > 0) {
			$("<span>").addClass(options.number == 1 ? "diamond" : "block")
				.addClass("shape")
				.append("<span>" + options.number)
				.appendTo(this.elem);
		} else {
			this.elem.addClass("no-number");
		}
		
		// TODO: use a div with a background-image to allow for easier scaling?
		if (options.image) {
			var img = $("<img>").attr("src", options.image);
			var div = $("<div>").addClass("image").append(img);
			this.elem.append(div);
		}
		
		// adding support for resizing the text to fit Fixed layouts
		var d = $("<div>").addClass("textblock");
		
		$("<span>").addClass("span-text").html(options.text).appendTo(d);
		
		var bounds = $("<div>").addClass("bounds");
		this.elem.append(bounds);
		this.bounds = bounds;

		this.number = options.number;
		this.anchor = hints.anchor;
		this.options = options;
		this.hints = hints;
		
		d.appendTo(this.elem);
	}
	
	FixedStep.prototype = Object.create(null);
	FixedStep.prototype.constructor = FixedStep;

	FixedStep.prototype.setupPositions = function () {
		this.calculatePositions();
		this.updateBoundsBox();
		
		this.gotoPosition("layout");
	}
	
	function rectInRect (rect1, rect2) {
		if (rect1.left >= rect2.left && rect1.right <= rect2.rect && rect1.top >= rect2.top && rect1.bottom <= rect2.bottom) {
			return true;
		} else {
			return false;
		}
	}
	
	FixedStep.prototype.setRect = function (rect) {
		this.rect = rect;		
	}
	
	FixedStep.prototype.updateBoundsBox = function () {
		this.bounds.css({ width: this.rect.width, height: this.screenPositions.expanded.height });
	}
		
	function reflow (elem) {
		// NOTE: this hack forces a reflow so we can get the text height properly
		elem.hide().show(0);
//		elem[0].offsetWidth;
	}
	
	FixedStep.prototype.calculatePositions = function () {
		this.screenPositions = {};
		
		this.calculateNormalPosition();
		this.calculateExpandedPosition();
	}

	FixedStep.prototype.calculateNormalPosition = function () {
		this.screenPositions.normal = {
			left: this.rect.left,
			top: this.rect.top,
			rect: this.rect,
			anchor: Helpers.convertAlignToJQueryAlign(this.anchor),
			overflow: false,
			height: this.rect.height,
			width: this.rect.width,
			fontSize: DEFAULT_FONT_SIZE
		};
	}
	
	FixedStep.prototype.calculateExpandedPosition = function () {
		// see if we can use a smaller text area
		var offscreen = this.elem.clone();
		offscreen.css("opacity", "0");
		this.elem.parent().append(offscreen);

		var t = offscreen.find(".textblock");
		offscreen.height("auto");
		t.height("auto");
		t.css("font-size", DEFAULT_FONT_SIZE + "px");
		var width = this.rect.width;
		offscreen.css("width", width);
		var text_height = t.height();
		
		// use the actual text height if it's close enough to the rect height
		var overflow_amount = text_height - this.rect.height;
		var box_height = Math.min(text_height, this.rect.height);
		var THRESHOLD = 12;
		if (overflow_amount > 0 && overflow_amount < THRESHOLD) {
			box_height = text_height;
		}
		
		offscreen.remove();
		
		this.screenPositions.expanded = {
			rect: this.rect,
			left: this.rect.left,
			top: this.rect.top,
			anchor: Helpers.convertAlignToJQueryAlign(this.anchor),
			overflow: false,
			height: box_height,
			width: this.rect.width,
			fontSize: DEFAULT_FONT_SIZE,
		};
		
		this.elem.find(".textblock").height(box_height);
	}
	
	FixedStep.prototype.gotoPosition = function (val) {
		var opts = this.screenPositions[val];
		
		switch (val) {
			case "expanded":
				this.elem.addClass("selected");
		
				var t = this.elem.find(".textblock");
				t.css( { "font-size": opts.fontSize + "px", visibility: "visible" } );
				this.elem.height("auto");
				t.height(opts.height);
				this.elem.css("width", opts.width);
		
				if (opts.overflow) {
					this.elem.addClass("overflow");
				} else {
					this.elem.removeClass("overflow");
				}
				
				this.elem.find("h2").css("display", "none");
		
				this.elem.css({ left: opts.left, top: opts.top });
		
				animateHighlightTo(this.elem.parent().find(".highlighted"), opts.left, opts.top, opts.width, opts.height);
				
				this.elem.find(".callout-line").hide().css("visibility", "visible").show();
				/*
				var elem = this.elem;

				setTimeout(function () {
					elem.find(".callout-line").hide().css("visibility", "visible").show("blind", { direction: "left", duration: 1000 });
				}, 750);
				*/

				var shape = this.elem.find(".shape");
				var transform = "scale(1)";
				shape.css("transform", transform);
				
				break;
				
			case "layout":
				this.elem.addClass("selected");
				
				var opts = this.screenPositions["expanded"];
				
				var t = this.elem.find(".textblock");
				t.css( { "font-size": opts.fontSize + "px", visibility: "visible" } );
				this.elem.height("auto");
				t.height(opts.height);
				this.elem.css("width", opts.width);
		
				this.elem.find("h2").css("display", "none");
		
				this.elem.css({ left: opts.left, top: opts.top });
		
				var shape = this.elem.find(".shape");
				var transform = "scale(1)";
				shape.css("transform", transform);
				
				break;
			
			case "normal":
				this.elem.removeClass("selected");
				
				this.elem.css("width", opts.width);
				var t = this.elem.find(".textblock");
				t.css({ visibility: "hidden" });

				var h2 = this.elem.find("h2");
				if (h2.length) {
					h2.css("display", "inline-block");
					h2.position( { my: "center", at: "center", of: this.bounds, collision: "none" } );
				}
				
				this.elem.css({ left: opts.left, top: opts.top });

				this.elem.find(".callout-line").hide().css("visibility", "hidden");
				
				var shape = this.elem.find(".shape");
				var scale = 1.5;
				var w = shape.width();// * scale;
				var h = shape.height();// * scale;
				
				var tx = this.rect.width / scale * .5 - (w * .5);
				var ty = (this.screenPositions.expanded.height / scale) * .5 - (h * .5);
				
				var transform = "scale(" + scale + ") translate(" + tx + "px," + ty + "px)";
				
				shape.css("transform", transform);
				
				break;			
		}
	}
	
	function animateHighlightTo (highlight, x, y, w, h) {
		highlight.addClass("animated");
		
		x -= 10;
		w += 20;
		y -= 20;
		h += 40;
				
		highlight.width(w).height(h).css("-webkit-transform", "translate3d(" + x + "px," + y + "px, 0)");
	}
	
	FixedStep.prototype.expand = function () {
		this.elem.css("zIndex", 2);
		
		this.elem.parent().find(".highlight").addClass("highlighted");
		
		this.gotoPosition("expanded");
		
		this.isExpanded = true;
	}
	
	FixedStep.prototype.unexpand = function () {
		this.elem.css("zIndex", "auto");
		
		this.gotoPosition("normal");
		
		this.isExpanded = false;
	}
	
	FixedStep.prototype.onTouch = function (event) {
		console.log("step ontouch");
		
		if (this.isExpanded) this.unexpand();
		else this.expand();
	}
	
	FixedStep.prototype.onClick = function (event) {
		this.expand();
		this.elem.trigger("expand");				
	}
	
	return FixedStep;	
});
