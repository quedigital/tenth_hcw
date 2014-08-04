define(["imagesloaded.pkgd.min",
		"Step",
		"Callout",
		"make-callout",
		"auto-size-text",
		"Helpers",
		"debug",
		], function (imagesLoaded, Step, Callout, makeCallout, autoSizeText, Helpers, debug) {
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
	
	FixedLayout.prototype.positionCells = function () {
		var img = this.container.find(".background");
		
		this.container.height(img.height());
		
		this.currentSize = { width: img.width(), height: img.height() };
		this.originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
		
		this.scale = this.currentSize.width / this.originalSize.width;

		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			var cell = Helpers.findByID(hint.id, this.content.cells);
			var rect = { left: hint.bounds[0] * this.scale, top: hint.bounds[1] * this.scale, width: hint.bounds[2] * this.scale, height: hint.bounds[3] * this.scale };
			
			var options = $.extend({ rect: rect }, cell, hint);
			
			if (!cell) {
				debug("Couldn't find cell for hint " + hint.id);
				break;
			}
			
			switch (cell.type) {
				case "step":
					var step = new Step(options);
			
					this.container.append(step.elem);

					step.setPosition(rect.left, rect.top);
					
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
	
	return FixedLayout;
});