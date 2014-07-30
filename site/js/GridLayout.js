define(["jquery", "Utils", "debug"], function ($, Utils, debug) {
	GridLayout = function (container, items, hints, content) {
		var MARGIN = 10;
		
		var $container = $(container);
		var $items = $(items);
		
		var n = 0, x = 0, maxY = 0;
		
		var y = $(container).find("h1").outerHeight();
				
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			
			var id = hint.id;
			var cell = Utils.findByID(id, content.cells);
			if (cell) {
				switch (cell.type) {
					case "step":
						var elem = $items.eq(n);
						elem.css("position", "absolute");
						var w = hint.width * 100 + "%";
						elem.css({ left: x, top: y, width: w });

						var img = elem.find(".image");
						switch (hint.image) {
							case "BL":
								// try to position the image at the bottom, knowing the text will reflow and throw us off
								var h1 = elem.find(".span-text").height();
								var h2 = img.height();
								var h = h1 * .6;
								$("<div>").addClass("spacer").css({ float: "left", height: h }).prependTo(elem.find(".step"));
								img.addClass("clear-left");						
								break;
							case "TR":
								img.addClass("clear-right");
								break;
							case "L":
								var step = elem.find(".step");
								img.addClass("clear-left");
								img.insertBefore(step);
								step.css("margin-left", img.outerWidth() + MARGIN);
								break;
							case "R":
								var step = elem.find(".step");
								img.addClass("clear-right");
								img.insertBefore(step);
								step.css("margin-right", img.outerWidth() + MARGIN);
								break;
						}
					
						// allow some CSS hinting
						if (hint.marginTop) {
							img.css("marginTop", hint.marginTop + "px");
						}
			
						x += elem.outerWidth();
						if (x >= $container.width()) {
							x = 0;
							y += elem.outerHeight();
						}
						if (y + elem.outerHeight() > maxY)
							maxY = y + elem.outerHeight();
						n++;
					
						break;
				
					case "image":
						// centered image
						// TODO: handle narrow images differently
						var elem = $items.eq(n);
						elem.css("position", "absolute");
						// account for the element's padding and margin
						var paddT = elem.innerWidth() - elem.width();
						var margT = elem.outerWidth(true) - elem.outerWidth();
						var w = elem.parent().width() * hint.width - paddT - margT;
						elem.find(".image img").width(w);
						x = (elem.parent().width() - w) * .5;
						x = 0;
						elem.css({ left: x, top: y, width: "auto" });
						y += elem.outerHeight();
						x = 0;
						maxY = y;
						n++;
					
						break;
						
					case "callout":
						var elem = $items.eq(n);
						
						elem.css("position", "absolute");
						var w = hint.width * 100 + "%";
						elem.css({ left: x, top: y, width: w });

						x += elem.outerWidth();
						if (x >= $container.width()) {
							x = 0;
							console.log("outer = " + elem.outerHeight());
							y += elem.outerHeight();
						}
						if (y + elem.outerHeight() > maxY)
							maxY = y + elem.outerHeight();
						n++;
					
						break;
				}
			}
		}
		
		$container.height(maxY);
	}
	
	GridLayout.prototype = Object.create(null);
	GridLayout.prototype.constructor = GridLayout;
	
	return GridLayout;
});
