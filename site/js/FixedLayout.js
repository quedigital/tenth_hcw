define(["jquery",
		"imagesloaded.pkgd.min",
		"Step",
		"Callout",
		"make-callout",
		"auto-size-text",
		"Utils",
		"debug",
		], function ($, imagesLoaded, Step, Callout, makeCallout, autoSizeText, Utils, debug) {
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
			var cell = Utils.findByID(hint.id, this.content.cells);
			
			if (!cell) {
				debug("Couldn't find cell for hint " + hint.id);
				break;
			}
			
			switch (cell.type) {
				case "step":
					var rect = { left: hint.bounds[0] * this.scale, top: hint.bounds[1] * this.scale, width: hint.bounds[2] * this.scale, height: hint.bounds[3] * this.scale };
			
					var step = new Step( { number: cell.number, text: cell.text, anchor: hint.anchor, bounds: rect } );
			
					this.container.append(step.elem);

					step.setPosition(rect.left, rect.top);
					
					step.elem.hover($.proxy(step.onHover, step));
					step.elem.on("touchend", $.proxy(step.onTouch, step));
					
					break;
				case "callout":
					var rect = { left: hint.bounds[0] * this.scale, top: hint.bounds[1] * this.scale, width: hint.bounds[2] * this.scale, height: hint.bounds[3] * this.scale };
					
					var callout = new Callout( { 	title: cell.title,
													text: cell.text,
													image: cell.image,
													backgroundColor: hint.backgroundColor,
													shrinkable: true
												} );
												
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