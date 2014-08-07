define(["Helpers"], function (Helpers) {
	var MARGIN = 10;
	
	var currentLayout;
	
	ko.bindingHandlers.gridThing = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			currentLayout = new Gridder(element);
		},
		
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		}
	}
	
	ko.bindingHandlers.cellThing = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			if (currentLayout)
				currentLayout.addNewGridCell(element, valueAccessor, bindingContext);
		},
		
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			if (currentLayout)
				currentLayout.reformat();
		}
	};
	
	ko.bindingHandlers.checkbox = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
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
		var cell = new GridCell(this, element, valueAccessor, bindingContext);
		
		this.cells.push(cell);
		
		var elem = this.elem;
		
		valueAccessor().subscribe(function (newValue) {
			elem.trigger("reformat");
		});		
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
			
			var x = parseInt(cell.bindingContext.$data.col());
			var y = parseInt(cell.bindingContext.$data.row());
			
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
				Helpers.reserveSpace(map, x, y, width * 10, height);
			}
		}
		
		// second pass = fit the other cells in
		for (var i = 0; i < this.cells.length; i++) {
			var cell = this.cells[i];
			var cellDOM = this.cells[i].el;
			
			var x = parseInt(cell.bindingContext.$data.col());
			var y = parseInt(cell.bindingContext.$data.row());
			
			// TODO: can you specify a row OR a col (ie, not both)?
			
			if (isNaN(x) || isNaN(y)) {
				var height = 1;
			
				var width = cell.bindingContext.$data.width();
			
				var spot = Helpers.findSpace(map, width * 10, height);
				
				if (spot) {
					var xx = spot.x / 10 * ROW_WIDTH;
					var yy = spot.y * this.ROW_HEIGHT;
			
					cellDOM.css( { left: xx, top: yy } );
				
					Helpers.reserveSpace(map, spot.x, spot.y, width * 10, height);
					
					if (spot.y > max_y) max_y = spot.y;
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
		var image = bindingContext.$root.getCellData(id, "image");
		
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
		}
		
		cell.append(inset);		
		
		inset.resizable( { grid: 10, maxWidth: ROW_WIDTH, minWidth: 10, handles: 'e', resize: $.proxy(me.onResize, me) } );
		
		cell.draggable( {
							grid: [ ROW_WIDTH * .1, this.grid.ROW_HEIGHT ],
							stack: ".cell",
							stop: $.proxy(this.grid.onCellMoved, this.grid)
						} );
		
		cell.click(setSelected);
	}
	
	GridCell.prototype = {};
	GridCell.prototype.constructor = GridCell;

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
		
		// NOTE: this is a bit of kludge, but the cell.parent(".grid").trigger("reformat") wasn't working too well
		//currentLayout.reformat();
		this.grid.reformat();
	}
	
	GridCell.prototype.setRowCol = function (row, col) {
		this.bindingContext.$data.row(row);
		this.bindingContext.$data.col(col);
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