define(["Helpers", "SiteHelpers"], function (Helpers, SiteHelpers) {
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

		this.number = options.number;
		
		if (this.hasNumber()) {
			this.shape = $("<span>").addClass(options.number == 1 ? "diamond" : "block")
				.append("<span>" + options.number)
				.appendTo(this.elem);
		} else {
			this.elem.addClass("no-number");
		}
		
		if (options.image) {
			var img = $("<img>").attr("src", options.image);
			var div = $("<div>").addClass("image").append(img);
			div.addClass("align-" + hints.image);
			this.elem.append(div);
			
			img.click($.proxy(SiteHelpers.showImageInLightbox, SiteHelpers, img, options.text, undefined, hints.background));
		}
		
		// adding support for resizing the text to fit Fixed layouts
		var d = $("<div>").addClass("textblock");
		
		this.spanText = $("<p>").addClass("span-text").html(options.text).appendTo(d);
		
		this.anchor = hints.anchor;
		this.rect = hints.rect;
		this.options = options;
		this.hints = hints;
		
		d.appendTo(this.elem);
		
		if (this.rect) {
//			this.elem.find(".textblock").addClass("resizeable").css("font-size", "12px");
			this.elem.css( { width: this.rect.width } );
		}		
	}
	
	Step.prototype = Object.create(null);
	Step.prototype.constructor = Step;
	
	function reflow (elem) {
	}
	
	Step.prototype.hasNumber = function () {
		return (this.number != undefined && parseInt(this.number) > 0);
	}
	
	Step.prototype.styleFirstWords = function () {
		this.spanText.addClass("intro");
		this.spanText.wrapStart(4, "intro");
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
		img.css("width", image_w);
		
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
				img.addClass("clear-right");
				break;
			case "BR":
				// try to position the image at the bottom, knowing the text will reflow and throw us off
				var h1 = elem.find(".span-text").height();
				var h2 = img.height();
				var h = h1 * .6;
				$("<div>").addClass("spacer").css({ float: "right", height: h }).prependTo(elem);
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
				$("<div>").addClass("spacer").css({ float: "left", height: h }).prependTo(elem);
				img.addClass("clear-left");						
				break;
			case "L":
				img.addClass("clear-left");
				break;
		}
		
		// allow some CSS hinting
		if (hint.marginTop) {
			img.css("marginTop", hint.marginTop + "px");
		}
		
		// for extracted cells, always vertically center the textblock?
		if (this.elem.hasClass("extracted")) {
			var tb = this.elem.find(".textblock");
			var pt = (tb.parent().height() - tb.outerHeight()) * .5;
			tb.css({ paddingTop: pt });
		}				
	}
	
	return Step;	
});
