define(["Helpers"], function (Helpers) {
	var DEFAULT_FONT_SIZE = 12, MARGIN = 30;
	var SIDE_MARGIN = 15, INCREMENT = 10;
	
	// number, text, image, anchor
	Step = function (options, hints) {
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
		this.anchor = hints.anchor;
		this.rect = hints.rect;
		this.options = options;
		this.hints = hints;
		
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
	
	Step.prototype.calculateExpandedPosition = function () {
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
		
		offscreen.remove();
		
		this.screenPositions.expanded = {
			rect: this.rect,
			left: this.rect.left,
			top: this.rect.top,
			anchor: Helpers.convertAlignToJQueryAlign(this.anchor),
			overflow: false,
			height: Math.min(text_height, this.rect.height),
			width: this.rect.width,
			fontSize: DEFAULT_FONT_SIZE,
		};
	}
	
	Step.prototype.gotoPosition = function (val) {
		if (this.isExtracted()) return;
		
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
//		this.elem.parent().find(".step.selected").removeClass("selected");
		
//		this.elem.parent().find(".highlighted").removeClass("highlighted");// animated");
		
		this.elem.removeClass("selected");
		
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
				this.elem.trigger("expand");				
				break;
			case "mouseleave":
//				this.unexpand();
				break;
		}
	}
	
	Step.prototype.isExtracted = function () {
		return (this.hints.anchor == "before" || this.hints.anchor == "after");
	}
	
	Step.prototype.format = function () {
		var elem = this.elem;
		var hint = this.hints;
		
		var img = elem.find(".image");
		img.find("img").css("width", "100%");
		var image_w = "50%";
		if (!isNaN(hint.imageWidth)) {
			image_w = Math.max(.1, Math.min(.9, hint.imageWidth)) * 100 + "%"
		}
		img.width(image_w);
		
		switch (hint.image) {
			case "TL":
				img.addClass("clear-left");
				break;
			case "T":
				img.addClass("top");
				img.prependTo(img.parent());
				break;
			case "TR":
				img.addClass("clear-right");
				break;
			case "R":
				var step = elem.find(".step");
				img.addClass("clear-right");
				img.insertBefore(step);
				step.css("margin-right", img.outerWidth() + MARGIN);
				break;
			case "BR":
				// try to position the image at the bottom, knowing the text will reflow and throw us off
				var h1 = elem.find(".span-text").height();
				var h2 = img.height();
				var h = h1 * .6;
				$("<div>").addClass("spacer").css({ float: "right", height: h }).prependTo(elem.find(".step"));
				img.addClass("clear-right");
				break;
			case "B":
				img.addClass("bottom");
				img.appendTo(img.parent());
				break;
			case "BL":
				// try to position the image at the bottom, knowing the text will reflow and throw us off
				var h1 = elem.find(".span-text").height();
				var h2 = img.height();
				var h = h1 * .6;
				$("<div>").addClass("spacer").css({ float: "left", height: h }).prependTo(elem.find(".step"));
				img.addClass("clear-left");						
				break;
			case "L":
				var step = elem.find(".step");
				img.addClass("clear-left");
				img.insertBefore(step);
				step.css("margin-left", img.outerWidth() + MARGIN);
				break;
		}
	
		// allow some CSS hinting
		if (hint.marginTop) {
			img.css("marginTop", hint.marginTop + "px");
		}
		
		// for extracted cells, always vertically center the textblock?
		if (this.isExtracted()) {
			var tb = this.elem.find(".textblock");
			var pt = (tb.parent().height() - tb.outerHeight()) * .5;
			tb.css({ paddingTop: pt });
		}
	}
	
	return Step;	
});
