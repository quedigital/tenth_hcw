define(["Helpers", "imagesloaded.pkgd.min", "debug"], function (Helpers, imagesLoaded, debug) {
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
	
	function getTotalUpTo (heights, n) {
		var total = 0;
		for (var i = 0; i < n; i++) {
			var h = isNaN(heights[i]) ? 0 : heights[i];
			total += h;
		}
		return total;
	}
	
	GridLayout.prototype.positionCells = function () {
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		var top_y = this.container.find("h1").outerHeight();
		
		var width = this.container.width();
		
		// first: map out the pre-positioned cells
		var map = [];
		
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			var col = parseInt(hint.col);
			var row = parseInt(hint.row);
			if (!isNaN(col) && !isNaN(row)) {
				Helpers.reserveSpace(map, col, row, hint.width * 10, 1, hint.id);
			}
		}
		
		// next: put the reflowable cells in
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			var col = parseInt(hint.col);
			var row = parseInt(hint.row);
			if (isNaN(col) || isNaN(row)) {
				var spot = Helpers.findSpace(map, hint.width * 10, 1);
				Helpers.reserveSpace(map, spot.x, spot.y, hint.width * 10, 1, hint.id);
			}
		}
		
		var last_row = undefined;
		var row_heights = [];
		
		var last_id = undefined;
		
		// now go through the map and place the cells
		for (var i = 0; i < map.length; i++) {
			var id = map[i];
			if (id && id != last_id) {
				var cell_x = (i % 10) / 10 * width;
				var row = Math.floor(i / 10);
				
				var y = getTotalUpTo(row_heights, row);
				
				var hint = Helpers.findByID(id, hints);
				var cell = Helpers.findByID(id, this.content.cells);

				var elem = this.container.find(".cell[data-id=" + id + "]");
				elem.css("position", "absolute");
				
				var w = hint.width * 100 + "%";
				
				elem.css({ left: cell_x, top: top_y + y, width: w });
				
				// internal formatting:
				switch (cell.type) {
					case "step":
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
						break;
						
					case "image":
						// centered image
						// TODO: handle narrow images differently?
						// account for the element's padding and margin
						var paddT = elem.innerWidth() - elem.width();
						var margT = elem.outerWidth(true) - elem.outerWidth();
						var w = elem.parent().width() * hint.width - paddT - margT;
						elem.find(".image img").width(w);
						/*
						x = (elem.parent().width() - w) * .5;
						x = 0;
						elem.css({ left: x, top: y, width: "auto" });
						*/
					
						break;
				}
				
				if (!hint.nonblocking) {
					var h = elem.outerHeight();
					if (h > row_heights[row] || row_heights[row] == undefined) {
						row_heights[row] = h;
					}
				}
				
				last_id = id;
			}
		}
		
		var totalY = getTotalUpTo(row_heights, row_heights.length);

		this.container.height(top_y + totalY);
	}
	
	return GridLayout;
});
