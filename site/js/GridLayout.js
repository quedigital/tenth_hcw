define(["Layout",
		"Helpers",
		"imagesloaded.pkgd.min",
		"debug",
		"Interactive",
		"Video",
		"CalloutLine",
		"CalloutLabel",
		"waypoints"], function (Layout, Helpers, imagesLoaded, debug) {
	var MARGIN = 10;
	
	GridLayout = function (container, layout, content, manager) {
		Layout.call(this, container, manager);
		
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
		
		this.okToShowWaypoints = false;
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.positionCells, this));
	}
	
	GridLayout.prototype = Object.create(Layout.prototype);
	GridLayout.prototype.constructor = GridLayout;
	
	GridLayout.prototype.reflow = function () {
		this.positionCells();
	}
	
	// plan: if the first waypoint is above 40%, show that after a short delay on page load (what if we're infinite-scrolling?)
	//       if other waypoints are above 40%, show them after short delays
	//       show other waypoints when scrolled
	
	var lastWaypointTime;
	var calloutLineDelay = 1500;
	
	GridLayout.prototype.showNextWaypoint = function () {
		var now = +new Date;
		
		if (this.okToShowWaypoints && (lastWaypointTime == undefined || now > lastWaypointTime + calloutLineDelay) ) {
			var wp = this.queuedWaypoints.shift();
			if (wp) {
				var cell = wp.step.elem.parents(".cell");
				
				cell.find(".diamond, .block").removeClass("animated rubberBand").addClass("animated rubberBand");
				
				setTimeout(function () {
					cell.find(".callout-line").hide().css("visibility", "visible").show("blind", { direction: "left", duration: 1000 });
				}, 750);
			}
			lastWaypointTime = now;
		} else {
			var next = calloutLineDelay - (now - lastWaypointTime);
			if (this.queuedWaypoints.length)
				setTimeout($.proxy(this.showNextWaypoint, this), next);
		}
	}
	
	GridLayout.prototype.onScrolledToStep = function (step, direction) {
		if (direction == "down") {
			this.queuedWaypoints.push( { step: step, direction: direction } );
			this.showNextWaypoint();
		}
	}
	
	GridLayout.prototype.buildCells = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		
		this.queuedWaypoints = [];
		$.waypoints("destroy");
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var cellDOM = $("<div>").addClass("cell");
			this.container.append(cellDOM);
			
			cellDOM.attr("data-id", cell.id);

			switch (cell.type) {
				case "step":
					var step = new Step(cell);
					cellDOM.append(step.elem);
					
					cellDOM.waypoint($.proxy(this.onScrolledToStep, this, step), { offset: "40%", context: "#main-content" });
					
					break;
				case "image":
					if (cell.image) {
						var img = $("<img>").attr("src", cell.image);
						var div = $("<div>").addClass("image").append(img);
						cellDOM.append(div);
					}
					break;
				case "sidebar":
					var sidebar = new Sidebar(cell);
					cellDOM.append(sidebar.elem);
					break;
				case "interactive":
					var interactive = new Interactive(cell);
					cellDOM.append(interactive.elem);
					break;
				case "video":
					var video = new Video(cell);
					cellDOM.append(video.elem);
					break;
			}
		}
	}
	
	// return the bottom position, including "non-blocking" cells
	function getMaxYPosition (cell_heights, map, row, col, width) {
		var max_y = 0;
		for (var r = row; r >= 0; r--) {
			for (var c = col; c < col + width; c++) {
				var id = map[r * 10 + c];
				if (id) {
					var y = cell_heights[id].y + cell_heights[id].height;
					if (y > max_y) max_y = y;
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
				if (cellIsBelowNonBlockingCell(hints, map, hint.row, hint.col, hint.width * 10))
					return true;
				else
					last_id = id;
			}
		}
		
		return false;
	}
	
	function cellIsBelowNonBlockingCell (hints, map, row, col, width) {
		for (var r = 0; r < row; r++) {
			for (var c = col; c < col + width; c++) {
				var id = map[r * 10 + c];
				var hint = Helpers.findByID(id, hints);
				if (hint && hint.nonblocking) {
					return true;
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
						
						break;
						
					case "image":
						// centered image
						// TODO: handle narrow images differently?
						// account for the element's padding and margin
						var paddT = elem.innerWidth() - elem.width();
						var margT = elem.outerWidth(true) - elem.outerWidth();
						var w = elem.parent().width() * hint.width - paddT - margT;

						var image_w = 1.0;
						if (!isNaN(hint.imageWidth)) {
							image_w = Math.max(.1, Math.min(.9, hint.imageWidth));
						}

						elem.find(".image img").width(w * image_w);
						
						/*
						x = (elem.parent().width() - w) * .5;
						x = 0;
						elem.css({ left: x, top: y, width: "auto" });
						*/
					
						break;
						
					case "interactive":
						var rect = elem.find(".interactive .contents")[0].getBoundingClientRect();
						var h = rect.height;
						elem.height(h);
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
		
		$.waypoints("refresh");
		
		this.layoutComplete();
		
		this.okToShowWaypoints = true;
		lastWaypointTime = +new Date + calloutLineDelay * .5;
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
	
	return GridLayout;
});
