define(["jquery",
		"imagesloaded.pkgd.min",
		"Step",
		"make-callout",
		"auto-size-text",
		"Utils",
		"debug",
		], function ($, imagesLoaded, Step, makeCallout, autoSizeText, Utils, debug) {
	FixedLayout = function (container, layout, content) {
		this.container = container;
		this.layout = layout;
		this.content = content;
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
					
//					step.mouseenter(function () { console.log("enter"); });
					step.elem.hover($.proxy(step.onHover, step));
					
					break;
				case "callout":
					var callout = makeCallout(cell.title, cell.text, cell.image, 1);//this.scale);
					
					var rect = { left: hint.bounds[0] * this.scale, top: hint.bounds[1] * this.scale, width: hint.bounds[2] * this.scale, height: hint.bounds[3] * this.scale };
					
					if (hint.backgroundColor) {
						callout.css("backgroundColor", hint.backgroundColor);
					}
			
//					callout.find(".textblock").css( { width: rect.width, height: rect.height } );
					callout.find(".textblock").css( { width: rect.width } );
					callout.find(".h2").css("width", rect.width);
			
					this.container.append(callout);
					
					// set initial position
					switch (hint.anchor) {
						case "BL":
							var h = callout.outerHeight();
							var y = rect.top + rect.height - h;
							callout.css( { left: rect.left, top: y });
							break;
					}
					
					// reveal when clicked
					callout.click($.proxy(callout.reveal, callout, hint.anchor));
					
					break;
			}
		}
		
		autoSizeText( { minSize: 12 } );
	}
	
	return FixedLayout;
});