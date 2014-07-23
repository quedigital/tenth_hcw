define([], function () {
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
				currentLayout.addNewGridCell(element, valueAccessor);
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
		this.cells = [];
		
		this.elem = $(elem);

		this.elem.on("reformat", $.proxy(this.reformat, this));		
		
		$("#cell-property-table").hide();
	}

	Gridder.prototype = {};
	Gridder.prototype.constructor = Gridder;
	
	Gridder.prototype.addNewGridCell = function (element, valueAccessor) {
		var cell = new GridCell(element, valueAccessor);
		
		this.cells.push(cell);
		
		var elem = this.elem;
		
		valueAccessor().subscribe(function (newValue) {
			elem.trigger("reformat");
		});		
	}
	
	Gridder.prototype.reformat = function (event, element) {
		var x = 0;
		var y = 0;
		
		var ROW_WIDTH = this.elem.parent().width();
		this.ROW_HEIGHT = 75;
		
		var me = this;
		
		for (var i = 0; i < this.cells.length; i++) {
			var cell = this.cells[i].el;
			
			var inset = cell.find(".inset");
			if (inset) {
				inset.resizable( { maxWidth: ROW_WIDTH } );
			}
			
			var width = cell.attr("data-width");
			if (width) {
				width = parseFloat(width);
				var cell_width = width * ROW_WIDTH;
				var cell_height = me.ROW_HEIGHT;
				var inset = cell.find(".inset");
				inset.width(cell_width - MARGIN).height(cell_height - MARGIN);
				if (x + width > 1) {
					x = 0;
					y += 1;
				}
				var xx = x * ROW_WIDTH;
				var yy = y * me.ROW_HEIGHT;
				x += width;
				if (x + width > 1) {
					x = 0;
					y += 1;
				}
				cell.width(cell_width).height(me.ROW_HEIGHT).css( { left: xx, top: yy } );
			}
		}
				
		this.elem.height(y * me.ROW_HEIGHT).width(ROW_WIDTH);
	}
	
	// GridCell
	
	var GridCell = function (elem, valueAccessor) {
		this.el = $(elem);
		
		cell = $(elem);
		var me = this;

		var ROW_WIDTH = cell.parent().width();
		
		this.valueAccessor = valueAccessor;
		
		var inset = $("<div>").addClass("inset");
		inset.attr("data-id", cell.data("id"));

		/*
		var ta = $("<textarea>").attr("data-bind", "autosize: styling");
		ta.appendTo(inset);
		*/
		
		$("<span>").addClass("id-label").attr("data-bind", "text: id").appendTo(inset);
		
		if (cell.data("image")) {
			$("<input type='checkbox'>").attr("name", "TL").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "TR").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "BR").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "BL").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "R").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "L").attr("data-bind", "checkbox: image").appendTo(inset);
		}
		
		cell.append(inset);		
		
		inset.resizable( { grid: 10, maxWidth: ROW_WIDTH, minWidth: 10, handles: 'e', resize: $.proxy(me.onResize, me) } );
		
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
		currentLayout.reformat();
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