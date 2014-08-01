define(["jquery", "Utils", "imagesloaded.pkgd.min", "debug"], function ($, Utils, imagesLoaded, debug) {
	var MARGIN = 10;
	
	GridLayout = function (container, layout, content) {
		this.container = container;
		this.layout = layout;
		this.content = content;
		
		this.container.addClass("grid");
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.positionCells, this));
	}
	
	GridLayout.prototype = Object.create(null);
	GridLayout.prototype.constructor = GridLayout;
	
	GridLayout.prototype.buildCells = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var cellDOM = $("<div>").addClass("cell");
			this.container.append(cellDOM);
			
			cellDOM.attr("data-id", cell.id);
			
			switch (cell.type) {
				case "step":
					var step = new Step(cell);
					cellDOM.append(step.elem);
					
					break;
				case "image":
					if (cell.image) {
						var img = $("<img>").attr("src", cell.image);
						var div = $("<div>").addClass("image").append(img);
						cellDOM.append(div);
					}
					break;
				case "callout":
					var callout = new Callout(cell);
					cellDOM.append(callout.elem);
					
					break;
			}
		}
	}
	
	GridLayout.prototype.positionCells = function () {
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		var x = 0, maxY = 0;
		
		var y = this.container.find("h1").outerHeight();
				
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			
			var id = hint.id;
			
			var cell = Utils.findByID(id, this.content.cells);
			
			if (cell) {
				switch (cell.type) {
					case "step":
						var elem = this.container.find(".cell[data-id=" + id + "]");
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
						if (x >= this.container.width()) {
							x = 0;
							y += elem.outerHeight();
						}
						
						if (y + elem.outerHeight() > maxY)
							maxY = y + elem.outerHeight();
					
						break;
				
					case "image":
						// centered image
						// TODO: handle narrow images differently
						var elem = this.container.find(".cell[data-id=" + id + "]");
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
					
						break;
						
					case "callout":
						var elem = this.container.find(".cell[data-id=" + id + "]");
						
						elem.css("position", "absolute");
						var w = hint.width * 100 + "%";
						elem.css({ left: x, top: y, width: w });

						x += elem.outerWidth();
						if (x >= this.container.width()) {
							x = 0;
							y += elem.outerHeight();
						}
						if (y + elem.outerHeight() > maxY)
							maxY = y + elem.outerHeight();
					
						break;
				}
			}
		}
		
		this.container.height(maxY);
	}
	
	return GridLayout;
});
