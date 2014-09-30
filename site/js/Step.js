define(["Helpers"], function (Helpers) {
	var DEFAULT_FONT_SIZE = 12, MARGIN = 30;
	var SIDE_MARGIN = 15, INCREMENT = 10;
	
	// number, text, image, anchor
	Step = function (options) {
		// TODO: Handlebars or Mustache (or even Backbone)?
		this.elem = $("<div>").addClass("step");
		
		this.elem.data("step", this);
		
		if (options.title && options.title.length) {
			$("<h2>").html(options.title).appendTo(this.elem);
		}
		
		if (options.number != undefined && parseInt(options.number) > 0) {
			$("<span>").addClass(options.number == 1 ? "diamond" : "block")
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
		
		this.number = options.number;
		this.anchor = options.anchor;
		this.rect = options.rect;
		
		d.appendTo(this.elem);
		
		if (this.rect) {
			this.elem.find(".textblock").addClass("resizeable").css("font-size", "12px");
			this.elem.css( { width: this.rect.width } );
		}		
	}
	
	Step.prototype = Object.create(null);
	Step.prototype.constructor = Step;

	Step.prototype.setupPositions = function () {
		this.calculatePositions();
		
		this.gotoPosition("normal");
	}
	
	function rectInRect (rect1, rect2) {
		if (rect1.left >= rect2.left && rect1.right <= rect2.rect && rect1.top >= rect2.top && rect1.bottom <= rect2.bottom) {
			return true;
		} else {
			return false;
		}
	}
	
	function opposite (anchor) {
		switch (anchor) {
			case "T":
				return "B";
			case "B":
				return "T";
			case "BR":
				return "TL";
			case "BL":
				return "TR";
			case "TL":
				return "BR";
			case "L":
				return "R";
			case "TR":
				return "BL";
			case "R":
				return "L";
		}
	}
	
	Step.prototype.setRect = function (rect) {
		this.rect = rect;
	}
		
	function reflow (elem) {
		// NOTE: this hack forces a reflow so we can get the text height properly
		elem.hide().show(0);
//		elem[0].offsetWidth;
	}
	
	Step.prototype.calculatePositions = function () {
		this.screenPositions = {};
		
		this.calculateNormalPosition();
		this.calculateExpandedPosition();
	}
	
	Step.prototype.calculateNormalPosition = function () {
		var pos;
		var anchor = Helpers.convertAlignToJQueryAlign(this.anchor);
		
		var pos = { x: this.rect.left, y: this.rect.top };
		
		var fs = DEFAULT_FONT_SIZE;
		
		var scrollLeft = this.elem.parent().scrollLeft();
				
		var offscreen = this.elem.clone();
		offscreen.css("opacity", "0");
		this.elem.parent().append(offscreen);

		var overflow = false;
		
		var t = offscreen.find(".textblock");
		t.css("font-size", fs + "px");
		offscreen.height("auto");
		t.height("auto");
		var width = this.rect.width;
		var height = "auto";
		offscreen.css("width", width);
		if (t.height() > this.rect.height) {
			height = this.rect.height;
			t.height(height);
		}
		
		var overflow = t.height() < t[0].scrollHeight;
		
		this.screenPositions.normal = {
			left: Math.floor(pos.x - scrollLeft),
			top: Math.floor(pos.y),
			rect: this.rect,
			anchor: anchor,
			overflow: overflow,
			height: height,
			width: width,
			fontSize: fs
		};

		offscreen.remove();		
	}
	
	function canGoLeft (offscreen, settings) {
		if (settings.allowedDirections.indexOf("L") == -1) return false;
		
		if (settings.x - INCREMENT <= SIDE_MARGIN) return false;
		
		return true;
	}
	
	function goLeft (offscreen, settings) {
		settings.x -= INCREMENT;
		settings.width += INCREMENT;
		
		checkNewPosition(offscreen, settings);
	}

	function canGoUp (offscreen, settings) {
		if (settings.allowedDirections.indexOf("T") == -1) return false;
		
		if (settings.y - INCREMENT <= MARGIN) return false;
		
		return true;
	}
	
	function goUp (offscreen, settings) {
		settings.y = (settings.rect.top + settings.rect.height) - settings.height;
		
		checkNewPosition(offscreen, settings);
	}

	function canGoRight (offscreen, settings) {
		if (settings.allowedDirections.indexOf("R") == -1) return false;
		
		if (settings.x + settings.width + INCREMENT >= settings.container_width - SIDE_MARGIN) return false;
		
		return true;
	}
	
	function goRight (offscreen, settings) {
		settings.width += INCREMENT;
		
		checkNewPosition(offscreen, settings);
	}

	function canGoDown (offscreen, settings) {
		if (settings.allowedDirections.indexOf("B") == -1) return false;
		
		if (settings.y + settings.height + INCREMENT >= settings.container_height - MARGIN) return false;
		
		return true;
	}	
	
	function goDown (offscreen, settings) {
		settings.height += INCREMENT;
		
		checkNewPosition(offscreen, settings);
	}
	
	function checkNewPosition (offscreen, settings) {
		offscreen.css("left", settings.x).css("top", settings.y);
		offscreen.css("width", settings.width);
		
		reflow(offscreen);
		
		settings.height = offscreen.find(".textblock").height();
	
		if (settings.x >= 0 && settings.x + settings.width <= settings.container_width
			&& settings.y >= 0 && settings.y + settings.height <= settings.container_height
			&& settings.height <= settings.rect.height) {
				settings.fits = true;
		}
	}
	
	Step.prototype.calculateExpandedPosition = function () {
		var offscreen = this.elem.clone();
		offscreen.css("opacity", "0");
		this.elem.parent().append(offscreen);

		var scrollLeft = this.elem.parent().scrollLeft();

		offscreen.height("auto");
		var t = offscreen.find(".textblock");
		t.css("font-size", DEFAULT_FONT_SIZE + "px");
		offscreen.height("auto");
		t.height("auto");
		var width = this.rect.width;
		offscreen.css("width", width);
		
		var settings = {
							allowedDirections: opposite(this.anchor),
							rect: this.rect,
							x: this.rect.left + scrollLeft,
							y: this.rect.top,
							width: parseInt(offscreen.css("width")),
							height: offscreen.find(".textblock").height(),
							container_width: this.elem.siblings(".background").width(),
							container_height: this.elem.parent().height(),// - MARGIN,
							fontSize: DEFAULT_FONT_SIZE,
							fits: false,
						};
						
		checkNewPosition(offscreen, settings);
		
		if (!settings.fits) {
			for (var tries = 0; tries < 100; tries++) {
				if (!settings.fits && canGoLeft(offscreen, settings)) {
					goLeft(offscreen, settings);
				}
				if (!settings.fits && canGoUp(offscreen, settings)) {
					goUp(offscreen, settings);
				}
				if (!settings.fits && canGoRight(offscreen, settings)) {
					goRight(offscreen, settings);
				}
				if (!settings.fits && canGoDown(offscreen, settings)) {
					goDown(offscreen, settings);
				}				
			}
		}
		
		this.screenPositions.expanded = {
			left: settings.x,
			top: settings.y,
			anchor: Helpers.convertAlignToJQueryAlign(this.anchor),
			overflow: false,
			height: settings.height,
			width: settings.width,
			fontSize: settings.fontSize
		};
		
		offscreen.remove();
	}
	
	Step.prototype.gotoPosition = function (val) {
		var opts = this.screenPositions[val];
		
		switch (val) {
			case "expanded":
				var t = this.elem.find(".textblock");
				t.css( { "font-size": opts.fontSize + "px", display: "block" } );
				this.elem.height("auto");
				t.height(opts.height);
				this.elem.css("width", opts.width);
		
				if (opts.overflow) {
					this.elem.addClass("overflow");
				} else {
					this.elem.removeClass("overflow");
				}
		
				this.elem.css({ left: opts.left, top: opts.top });
		
				animateHighlightTo(this.elem.parent().find(".highlighted"), opts.left, opts.top, opts.width, opts.height);		
				
				break;
			
			case "normal":
				var t = this.elem.find(".textblock");
				t.css({ display: "none" });
				
				this.elem.css({ left: opts.left, top: opts.top });
				
				break;			
		}
	}
	
	function animateHighlightTo (elem, x, y, w, h) {
		elem.addClass("animated");
		
		x -= 10;
		w += 20;
		y -= 20;
		h += 40;
				
		elem.width(w).height(h);
		elem.css("-webkit-transform", "translate3d(" + x + "px," + y + "px,0)");
	}
	
	Step.prototype.expand = function () {
		this.elem.css("zIndex", 2);
		
		this.elem.addClass("animated selected");
		
		this.elem.parent().find(".highlight").addClass("highlighted");
		
		this.gotoPosition("expanded");
		
		this.isExpanded = true;
	}
	
	Step.prototype.unexpand = function () {
		this.elem.parent().find(".step.selected").removeClass("selected");
		
		this.elem.parent().find(".highlighted").removeClass("highlighted");// animated");
		
		this.elem.css("zIndex", "auto");
		
		this.gotoPosition("normal");
		
		this.isExpanded = false;
	}
	
	Step.prototype.onTouch = function (event) {
		console.log("step ontouch");
		
		if (this.isExpanded) this.unexpand();
		else this.expand();
	}
	
	Step.prototype.onHover = function (event) {
		switch (event.type) {
			case "mouseenter":
				this.expand();				
				break;
			case "mouseleave":
				this.unexpand();
				break;
		}
	}
	
	return Step;	
});
