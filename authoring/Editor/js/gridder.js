define(["Helpers"], function (Helpers) {
	var MARGIN = 10;
	
	ko.bindingHandlers.gridThing = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			$(element).data("grid", new Gridder(element));
		},
		
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		}
	}
	
	ko.bindingHandlers.cellThing = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var grid = $(element).parents(".grid").data("grid");
			if (grid) {
				grid.addNewGridCell(element, valueAccessor, bindingContext);
			}
			
			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				//$(element).slider("destroy");
				console.log("dispose");
			});
		},
		
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var grid = $(element).parents(".grid").data("grid");
			if (grid) {
				grid.reformat();
			}
		}
	};
	
	ko.bindingHandlers.checkbox = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var value = valueAccessor()();
			if (value) {
				var checkbox = $(element);
				checkbox.prop("checked", checkbox.attr("name") == value);
			}
			
			// adapted from: http://stackoverflow.com/questions/18465083/knockout-custom-binding-update-function-not-firing
			valueAccessor().subscribe(function (newValue) {
				var checkbox = $(element);
				checkbox.prop("checked", checkbox.attr("name") == newValue);
			});
			
			$(element).click(function () {
				var checkbox = $(element);
				var value = valueAccessor();
				if (checkbox.prop("checked")) {
					var name = checkbox.attr("name");
					value(name);
				} else {
					value("");
				}
			});
		}
	};
	
	// Gridder

	var Gridder = function (elem) {
		this.ROW_HEIGHT = 75;
		
		this.cells = [];
		
		this.elem = $(elem);

		this.elem.on("reformat", $.proxy(this.reformat, this));		
		
		$("#cell-property-table").hide();
	}

	Gridder.prototype = {};
	Gridder.prototype.constructor = Gridder;
	
	Gridder.prototype.addNewGridCell = function (element, valueAccessor, bindingContext) {
		var y = this.getNextOpenRow();
		
		var cell = new GridCell(this, element, valueAccessor, bindingContext);

		if (cell.y == undefined) {
			cell.setRowCol(y, 0);
		}
		
		this.cells.push(cell);
		
		var elem = this.elem;
		
//		this.reformatSubscription = valueAccessor().subscribe(function (newValue) {
//			elem.trigger("reformat");
//		});		
	}
	
	Gridder.prototype.getNextOpenRow = function () {
		var max_y = 0;
		for (var i = 0; i < this.cells.length; i++) {
			if (this.cells[i].y > max_y) {
				max_y = this.cells[i].y;
			}
		}
		return max_y + 1;
	}
	
	Gridder.prototype.reformat = function (event, element) {
		var x = 0;
		var y = 0;
		var max_y = 0;
		
		var ROW_WIDTH = this.elem.parent().width();
		
		var map = [];
		
		// first pass = position absolute positioned cells
		for (var i = 0; i < this.cells.length; i++) {
			var cell = this.cells[i];
			var cellDOM = this.cells[i].el;
			
			var inset = cellDOM.find(".inset");
			if (inset) {
				inset.resizable( { maxWidth: ROW_WIDTH } );
			}
			
			var height = 1;
			
			var width = cell.bindingContext.$data.width();
			if (width) {
				var cell_width = parseFloat(width) * ROW_WIDTH;
				
				inset.width(cell_width - MARGIN).height(this.ROW_HEIGHT - MARGIN);
				cellDOM.width(cell_width).height(this.ROW_HEIGHT)			
			}
			
			//var x = parseInt(cell.bindingContext.$data.col());
			//var y = parseInt(cell.bindingContext.$data.row());
			var x = cell.x;
			var y = cell.y;
			
			if (!isNaN(x)) {
				var cell_x = x / 10 * ROW_WIDTH;
				cellDOM.css( { left: cell_x } );
			}
			
			if (!isNaN(y)) {
				var cell_y = y * this.ROW_HEIGHT;
				cellDOM.css( { top: cell_y } );
				
				if (y > max_y) max_y = y;
			}
			
			if (!isNaN(x) && !isNaN(y)) {
				cell.col_temp = x;
				cell.row_temp = y;
				
				Helpers.reserveSpace(map, x, y, width * 10, height);
			} else {
				// find a spot for this unspecified-location cell
				var height = 1;
			
				var width = cell.bindingContext.$data.width();
			
				var spot = Helpers.findSpace(map, width * 10, height);
				
				if (spot) {
					cell.col_temp = spot.x;
					cell.row_temp = spot.y;
					
					var xx = spot.x / 10 * ROW_WIDTH;
					var yy = spot.y * this.ROW_HEIGHT;
			
					cellDOM.css( { left: xx, top: yy } );
				
					Helpers.reserveSpace(map, spot.x, spot.y, width * 10, height);
					
					if (spot.y > max_y) max_y = spot.y;
					
					// NOTE: this a kludge; otherwise, when a hint gets deleted, it gets put back because we're adding a row and column here
					//  so checking for an id is an attempt to see if this is a valid record ("dispose" might be the better path to try)
					if (cell.bindingContext.$data.id()) {
						cell.bindingContext.$data.col(spot.x);
						cell.bindingContext.$data.row(spot.y);
					}
				}
			}
		}
				
		this.elem.height((max_y + 1) * this.ROW_HEIGHT).width(ROW_WIDTH);
	}
	
	Gridder.prototype.findCellByElem = function (elem) {
		var ar = $.map(this.cells, function (obj, index) {
			if (obj.el[0] == elem[0]) return obj;
			else return null;
		});
		
		return ar;
	}
	
	Gridder.prototype.onCellStartMove = function (event, ui) {
		var ar = this.findCellByElem(ui.helper);
		if (ar.length) {
			var cell = ar[0];
			cell.old_y = cell.y;
		}		
	}
	
	Gridder.prototype.onCellMoving = function (event, ui) {
		// 1: move all cells after this one (in the revised order) down
		// 2: and pack everything back in
		
		var pos = ui.position;
		
		// convert pos to 10% increments
		var ROW_WIDTH = this.elem.parent().width();
		
		var col = ui.position.left / ROW_WIDTH;
		col = Math.round(col * 10);
		
		var row = ui.position.top / this.ROW_HEIGHT;
		row = Math.round(row);
		
		var ar = this.findCellByElem(ui.helper);
		if (ar.length) {
			var cell = ar[0];
			
			cell.x = col;
			cell.y = row;
			
			cell.moved = true;
			
			var overlap = this.isCellOverlap(cell);
			if (overlap) {
				this.pushCellsDownAfter(cell, row, col);
			}
			
			this.repackCells(cell.y);
		}
	}
	
	function doCellsOverlap (cell1, cell2, compareY) {
		if (compareY == undefined || compareY == true) {
			if (cell1.y != cell2.y) return false;
		}
		
		var x1 = cell1.x * 10, x2 = x1 + cell1.width * 100;
		var y1 = cell2.x * 10, y2 = y1 + cell2.width * 100;
		return (x1 < y2 && y1 < x2);
	}
	
	Gridder.prototype.isCellOverlap = function (cell) {
		for (var i = 0; i < this.cells.length; i++) {
			var c = this.cells[i];
			if (c != cell) {
				if (doCellsOverlap(cell, c)) return true;
			}
		}
		return false;
	}
	
	Gridder.prototype.cellOverlapsRow = function (row) {
		for (var i = 0; i < this.cells.length; i++) {
			var c = this.cells[i];
		}
	}
	
	Gridder.prototype.pushCellsDownAfter = function (cell, row, col) {
		var ROW_WIDTH = this.elem.parent().width();
		
		for (var i = 0; i < this.cells.length; i++) {
			var c = this.cells[i];
			if (c != cell && !c.moved && c.y >= row) {
				c.y++;
				
				var xx = c.x / 10 * ROW_WIDTH;
				var yy = c.y * this.ROW_HEIGHT;
				
				var cellDOM = c.el;
		
				cellDOM.css( { left: xx, top: yy } );
				
				c.moved = true;
			}
		}
	}
	
	Gridder.prototype.getCellsOnRow = function (row) {
		var els = [];
		for (var i = 0; i < this.cells.length; i++) {
			if (this.cells[i].y == row) els.push(this.cells[i]);
		}
		return els;
	}
	
	Gridder.prototype.cellCanFitOnRow = function (c, row) {
		for (var i = 0; i < this.cells.length; i++) {
			var cell = this.cells[i];
			if (cell != c && cell.y == row) {
				if (doCellsOverlap(cell, c, false)) return false;
			}
		}
		return true;
	}
	
	Gridder.prototype.rowCanMoveDown = function (els, row) {
		var newRow;
		
		for (newRow = 0; newRow < row; newRow++) {
			var canFit = true;
			for (var i = 0; i < els.length; i++) {
				var el = els[i];
				if (!this.cellCanFitOnRow(el, newRow)) {
					canFit = false;
					break;
				}
			}
			if (canFit)
				return newRow;
		}
		
		return -1;
	}
	
	Gridder.prototype.moveRowTo = function (els, newRow) {
		var yy = newRow * this.ROW_HEIGHT;
			
		for (var i = 0; i < els.length; i++) {
			els[i].y = newRow;
			
			var cellDOM = els[i].el;
	
			cellDOM.css( { top: yy } );
		}
	}
	
	// check to see if whole rows can be moved down
	Gridder.prototype.repackCells = function (notRow) {
		var ROW_WIDTH = this.elem.parent().width();
		
		// find the highest used row
		var max_row;
		for (var i = 0; i < this.cells.length; i++) {
			var c = this.cells[i];
			if (c.y > max_row || max_row == undefined) {
				max_row = c.y;
			}
		}
		
		for (var row = 0; row <= max_row; row++) {
			if (row != notRow) {
				var els = this.getCellsOnRow(row);
				if (els.length && this.rowCanMoveDown(els, row) != -1) {
					var newRow = this.rowCanMoveDown(els, row);
					this.moveRowTo(els, newRow);
				}
			}
		}
				
		// get them ready for another test
		for (var i = 0; i < this.cells.length; i++) {
			var c = this.cells[i];
			c.moved = false;
		}
	}
	
	Gridder.prototype.onCellMoved = function (event, ui) {
		var pos = ui.position;
		
		// convert pos to 10% increments
		var ROW_WIDTH = this.elem.parent().width();
		var col = ui.position.left / ROW_WIDTH;
		col = Math.round(col * 10);
		var row = ui.position.top / this.ROW_HEIGHT;
		row = Math.round(row);
		
		var ar = this.findCellByElem(ui.helper);
		if (ar.length) {
			var cell = ar[0];
			cell.setRowCol(row, col);
		}
		
		for (var i = 0; i < this.cells.length; i++) {
			var cell = this.cells[i];
			cell.setRowCol(cell.y, cell.x);
		}
		
		this.setContentOrderToLayoutOrder();
	}
	
	Gridder.prototype.setContentOrderToLayoutOrder = function () {
		var ROW_WIDTH = this.elem.parent().width();
		
		var ar = [];
		
		for (var i = 0; i < this.cells.length; i++) {
			var c = this.cells[i].el;
			var col = c.position().left / ROW_WIDTH;
			col = Math.round(col * 10);
			var row = c.position().top / this.ROW_HEIGHT;
			row = Math.round(row);
			ar.push( { id: this.cells[i].getID(), row: row, col: col } );
		}
		
		ar.sort(function (a, b) {
			if (a.row > b.row)
				return 1;
			else if (a.row == b.row && a.col > b.col) {
				return 1;
			} else {
				return -1;
			}
		});
		
		var ids = $.map(ar, function (el) { return el.id });
		
		this.elem.trigger("order_change", [ids]);
	}
	
	// GridCell
	
	var GridCell = function (grid, elem, valueAccessor, bindingContext) {
		this.grid = grid;
		this.el = $(elem);
		
		cell = $(elem);
		var me = this;
		
		var ROW_WIDTH = cell.parent().width();
		
		this.valueAccessor = valueAccessor;
		this.bindingContext = bindingContext;
		
		var inset = $("<div>").addClass("inset");
		inset.attr("data-id", cell.data("id"));

		/*
		var ta = $("<textarea>").attr("data-bind", "autosize: styling");
		ta.appendTo(inset);
		*/
		
		$("<span>").addClass("id-label").attr("data-bind", "text: id").appendTo(inset);
		
		var id = bindingContext.$data.id();
		this.id = id;
		var image = bindingContext.$root.getCellData(id, "image");
		
		this.x = parseInt(bindingContext.$data.col());
		this.y = parseInt(bindingContext.$data.row());
		
		this.x = isNaN(this.x) ? undefined : this.x;
		this.y = isNaN(this.y) ? undefined : this.y;

		this.width = bindingContext.$data.width();
		
		var type = bindingContext.$root.getCellType(id);
		
		if (type == "step" && image) {
			$("<input type='checkbox'>").attr("name", "TL").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "T").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "TR").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "BR").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "B").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "BL").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "R").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "L").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<div class='slider'></div>").attr("data-bind", "slider: imageWidth").appendTo(inset);
		}
		
		cell.append(inset);		
		
		inset.resizable( { grid: 10, maxWidth: ROW_WIDTH, minWidth: 10, handles: 'e', resize: $.proxy(me.onResize, me) } );
		
		inset.find(".slider").slider( { min: .1, max: .9, step: .1 } );
		
		cell.draggable( {
							grid: [ ROW_WIDTH * .1, this.grid.ROW_HEIGHT ],
							stack: ".cell",
							start: $.proxy(this.grid.onCellStartMove, this.grid),
							drag: $.proxy(this.grid.onCellMoving, this.grid),
							stop: $.proxy(this.grid.onCellMoved, this.grid)
						} );
		
		cell.click(setSelected);
	}
	
	GridCell.prototype = {};
	GridCell.prototype.constructor = GridCell;

	GridCell.prototype.getID = function () {
		return this.bindingContext.$data.id();
	}
	
	// reformat during cell resize
	GridCell.prototype.onResize = function (event, ui) {
		var w = ui.element.width() + MARGIN;
		var ROW_WIDTH = this.el.parent().width();
		var percent = w / ROW_WIDTH;
		// round to nearest 10%
		percent = Math.round(percent * 10) / 10;
		
		var cell = $(this.el);
		cell.data("width", percent);

		var value = this.valueAccessor();
		value(percent);
		
		this.width = percent;
		console.log("width = " + this.width);
		
		this.grid.reformat();
	}
	
	GridCell.prototype.setRowCol = function (row, col) {
		this.bindingContext.$data.row(row);
		this.bindingContext.$data.col(col);
		
		this.x = col;
		this.y = row;
	}
	
	function setSelected (event) {
//		var id = $(event.currentTarget).data("id");
		// NOTE: I switched to using a span tag to hold the id because the attribute data-id wasn't being updated by knockout		
		var id = $(event.currentTarget).find(".tag").text();
		
		$(".cell.selected").removeClass("selected");
		
		$(event.currentTarget).addClass("selected");
		
		$("#cell-property-table").show();
		
		$("table.properties tbody[data-id = " + id + "]").show();
		$("table.properties tbody[data-id != " + id + "]").hide();
		
		return true;
	}	
});