define(["Layout",
		"Helpers",
		"imagesloaded.pkgd.min",
		"debug",
		"Step",
		"tinycolor",
		"Interactive",
		"Video",
		"CalloutLine",
		"CalloutLabel",
		], function (Layout, Helpers, imagesLoaded, debug, Step, tinycolor) {
	
	GridLayout = function (container, layout, content, manager) {
		Layout.call(this, container, manager, content);
		
		this.container.data("grid", this);
		
		this.layout = layout;
		this.content = content;
		
		this.container.addClass("grid");
		
		if (this.layout.background) {
			this.container.css("background", this.layout.background);
		}
		
		if (this.layout.textcolor) {
			this.container.css("color", this.layout.textcolor);
		}
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.positionCells, this));
	}
	
	GridLayout.prototype = Object.create(Layout.prototype);
	GridLayout.prototype.constructor = GridLayout;
	
	GridLayout.prototype.reflow = function () {
		this.positionCells();
	}
	
	GridLayout.prototype.buildCells = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		var firstStep = false;
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var hint = hints[i];
			var cellDOM = $("<div>").addClass("cell");
			this.container.append(cellDOM);
			
			cellDOM.attr("data-id", cell.id);

			switch (cell.type) {
				case "step":
					// add the background so we can use it for the lightbox
					$.extend(hint, { background: this.layout.background });
					
					var step = new Step(cell, hint);
					cellDOM.append(step.elem);
					
					if (hint.callout_target_id) {
						step.elem.addClass("with-callout");
						
						if (step.shape) {
							var indicator = $("<div class='callout-icon-container'><span class='top'></span><span class='right'></span><span class='bottom'></span><span class='left'></span></div>");
						
							/* To add an optional delay so they aren't all moving in sync
							var s = Math.floor(Math.random() * 8) + 1;
							indicator.find("span").css("-webkit-animation-delay", s + "s"); 
							*/
						
							step.shape.append(indicator);
						}
						
						/*
						var backColor = tinycolor(this.container.css("background"));
						if (!backColor.isValid()) {
							backColor = tinycolor.tinycolor("#ffffff");
						}
						backColor = backColor.brighten();
						backColor.setAlpha(.5);
						this.activeColor = backColor.toString();
						step.elem.css("background-color", this.activeColor);
						*/
						step.elem.hover($.proxy(this.onHoverStep, this, step), $.proxy(this.onHoverOutStep, this, step));
						step.elem.click($.proxy(this.showCalloutForStep, this, step));
					}
					
					if (!firstStep && !step.hasNumber()) {
						step.styleFirstWords();
						firstStep = true;
					}
					
					break;
				case "image":
					var image = new CellImage(cell, hint, this.content.title, "image " + cell.id, this.layout.background);
					cellDOM.append(image.elem);					
					break;
				case "sidebar":
					var sidebar = new Sidebar(cell, hint);
					cellDOM.append(sidebar.elem);
					break;
				case "interactive":
					var interactive = new Interactive(cell, hint);
					cellDOM.append(interactive.elem);
					break;
				case "video":
					var video = new Video(cell);
					cellDOM.append(video.elem);
					break;
			}
		}
	}
	
	
	// if 2 is non-blocking, 3 and 4 should move up:
	// 111222
	// 333
	// 444
	
	// if 2 is non-blocking, 5 and 6 should be below 2:
	// 111222
	// 333
	// 444
	// 555566

	// return the bottom position, including "non-blocking" cells
	function getMaxYPosition (cell_heights, map, row, col, width) {
		var max_y = 0;
		for (var c = col; c < col + width; c++) {
			for (var r = row; r >= 0; r--) {
				var id = map[r * 10 + c];
				if (id) {
					var y = cell_heights[id].y + cell_heights[id].height;
					if (y > max_y) max_y = y;
					break;
				}
			}
		}
		return max_y;
	}
	
	// return bottom position of the given row, not counting "non-blocking" cells
	function getLastRowPosition (cell_heights, map, row, col, width) {
		var max_y = undefined;
		
		for (var c = 0; c < 10; c++) {
			var id = map[row * 10 + c];
			if (id) {
				if (!cell_heights[id].nonblocking) {
					var y = cell_heights[id].y + cell_heights[id].height;
					if (!isNaN(y) && (max_y == undefined || y > max_y)) {
						max_y = y;
					}
				}
			}
		}
		
		return max_y == undefined ? 0 : max_y;
	}
	
	function rowIsBelowNonBlockingCell (hints, map, row, col, width) {
		var last_id;
		
		for (var i = 0; i < 10; i++) {
			var id = map[row * 10 + i];
			if (id && id != last_id) {
				var hint = Helpers.findByID(id, hints);
				if (cellIsBelowNonBlockingCell(hints, map, hint.row - 1, hint.col, hint.width * 10))
					return true;
				else
					last_id = id;
			}
		}
		
		return false;
	}
	
	function cellIsBelowNonBlockingCell (hints, map, row, col, width) {
		// check all columns first
		for (var c = col; c < col + width; c++) {
			for (var r = row; r >= 0; r--) {
				var id = map[r * 10 + c];
				var hint = Helpers.findByID(id, hints);
				if (hint) {
					if (hint.nonblocking) {
						return true;
					} else {
						break;
					}
				}
			}
		}
		
		return false;
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

		var cell_heights = {};
		var bottomY = 0;
		
		var last_id = undefined;
		
		// now go through the map and place the cells
		for (var i = 0; i < map.length; i++) {
			var id = map[i];
			if (id && id != last_id) {
				var cell_x = (i % 10) / 10 * width;
				var row = Math.floor(i / 10);
				
				var hint = Helpers.findByID(id, hints);
				var cell = Helpers.findByID(id, this.content.cells);
				
				var y;
				
				if (rowIsBelowNonBlockingCell(hints, map, hint.row, hint.col, hint.width * 10)) {
					y = getMaxYPosition(cell_heights, map, hint.row - 1, 0, 10);
				} else {
					y = getLastRowPosition(cell_heights, map, hint.row - 1, hint.col, hint.width * 10);
				}
				
				var elem = this.container.find(".cell[data-id=" + id + "]");
				elem.css("position", "absolute");
				
				var w = hint.width * 100 + "%";
				
				elem.css({ left: cell_x, top: top_y + y, width: w });
				
				// internal formatting:
				switch (cell.type) {
					case "step":
						var step = elem.find(".step").data("step");
						step.format();
						break;
						
					case "image":
						var image = elem.find(".cell-image").data("CellImage");
						image.format();					
						break;
						
					case "interactive":
						var interactive = elem.find(".interactive").data("interactive");
						var pane = $(this.container).parents(".ui-layout-pane");
						interactive.format(pane);
						break;
					
					case "video":
						break;
				}
				
				var h = elem.outerHeight();
				
				cell_heights[id] = { y: y, height: h, nonblocking: hint.nonblocking };
				
				if (y + h > bottomY) bottomY = y + h;
				
				last_id = id;
			}			
		}
				
		this.container.height(top_y + bottomY);
		
		this.removeAllCallouts();
		this.addLineCallouts({ fromSelector: ".cell" });
		this.addImageCallouts();
		
		this.layoutComplete();		
	}
	
	GridLayout.prototype.addImageCallouts = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var id = cell.id;
			var hint = Helpers.findByID(id, hints);
			if (cell.callouts && hint.callouts) {
				var callouts = $.map(cell.callouts, function (el, index) { return { id: index, text: el.text } } )
				var positions = $.map(hint.callouts, function (el, index) { return { id: index, hint: el } } )
				for (var j = 0; j < callouts.length; j++) {
					var callout = callouts[j];
					var c = new CalloutLabel(callout.text, positions[j].hint, this.container, this.getCellDOM(id), hint);
					this.calloutLines.push(c);
				}
			}
		}	
	}

	GridLayout.prototype.activate = function () {
		Layout.prototype.activate.call(this);
		
		this.container.trigger("controls", { layout: this, items: {} });
	}
	
	GridLayout.prototype.onHoverStep = function (step) {
		this.showCalloutForStep(step);
	}
	
	GridLayout.prototype.onHoverOutStep = function (step) {
		var line = step.elem.find(".callout-line");
		line.removeClass("animated").addClass("fadeOut animated").show(0);
	}
	
	GridLayout.prototype.showCalloutForStep = function (step) {
		var lineElem = step.elem.find(".callout-line");
		lineElem.removeClass("animated fadeOut").show(0);
		
		var line = step.elem.data("callout-line");
		if (line)
			line.animate();
	}
	
	return GridLayout;
});
