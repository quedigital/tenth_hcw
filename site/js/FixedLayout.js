define(["jqueryui",
		"imagesloaded.pkgd.min",
		"Step",
		"Callout",
		"auto-size-text",
		"Helpers",
		"debug",
		], function (jqueryui, imagesLoaded, Step, Callout, autoSizeText, Helpers, debug) {
	FixedLayout = function (container, layout, content) {
		this.container = container;
		this.layout = layout;
		this.content = content;

		this.container.addClass("fixed");

//		var div = $("<div>").attr("background-url", layout.background).css({ width: 200, height: 200, backgroundSize: "cover" });
//		$(container).append(div);
		var img = $("<img>").addClass("background").attr("src", layout.background);
		// size to fit window
		var h = $(window).height(), w = this.container.width();
//		img.height(h);
		img.width(w);
		$(container).append(img);
//		this.container.height(h);
		
		$("<div>").addClass("highlight").appendTo(container);		
		
		imagesLoaded(container, $.proxy(this.positionCells, this));
	}
	
	FixedLayout.prototype = Object.create(null);
	FixedLayout.prototype.constructor = FixedLayout;
	
	FixedLayout.prototype.reflow = function () {
	}
	
	FixedLayout.prototype.getImageScale = function (img) {
		if (Helpers.isVectorImage(img)) {
			var currentSize = { width: img.width(), height: img.height() };
			return currentSize.width / 1000;
		} else {
			var currentSize = { width: img.width(), height: img.height() };
			var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
	
			return currentSize.width / originalSize.width;
		}
	}
	
	FixedLayout.prototype.positionCells = function () {
		var img = this.container.find(".background");
		
		this.container.height(img.height());
		
		var currentSize = { width: img.width(), height: img.height() };
		var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
		
		this.scale = this.getImageScale(img);

		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			var cell = Helpers.findByID(hint.id, this.content.cells);
			var rect = { left: Math.round(hint.bounds[0] * this.scale), top: Math.round(hint.bounds[1] * this.scale), width: Math.round(hint.bounds[2] * this.scale), height: Math.round(hint.bounds[3] * this.scale) };
			
//			this.drawRect(rect);
			
			var options = $.extend({ rect: rect }, cell, hint);
			
			if (!cell) {
				debug("Couldn't find cell for hint " + hint.id);
				break;
			}
			
			switch (cell.type) {
				case "step":
					var step = new Step(options);
			
					this.container.append(step.elem);
					
					step.initialize();

					step.elem.hover($.proxy(step.onHover, step));
					step.elem.on("touchend", $.proxy(step.onTouch, step));
					
					break;
				case "callout":
					options.shrinkable = true;
					
					var callout = new Callout(options);
												
					this.container.append(callout.elem);
					
					callout.setSize(rect.width, rect.height);
					
					callout.setPosition(hint.anchor, rect);
					
					break;
			}
		}
		
		autoSizeText( { minSize: 12 } );
	}

	FixedLayout.prototype.drawRect = function (rect) {
		var r = $("<div>").addClass("testrect");
		r.css({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
		
		this.container.append(r);
	}
	
	return FixedLayout;
});