define([], function () {
	var MARGIN = 10;
	
	ko.bindingHandlers.gridThing = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var g = new Gridder(element);
		},
		
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		}
	}
	
	ko.bindingHandlers.cellThing = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var cell = new GridCell(element, valueAccessor);
			
			valueAccessor().subscribe(function (newValue) {
				var grid = $(element).parent(".grid");
				grid.trigger("reformat");
			});
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var grid = $(element).parent(".grid");
			grid.trigger("reformat");
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
	
	var GridCell = function (elem, valueAccessor) {
		this.el = $(elem);
		
		cell = $(elem);
		var me = this;

		var ROW_WIDTH = cell.parent().width();
		
		this.valueAccessor = valueAccessor;
		
		var inset = $("<div>").addClass("inset");
		inset.attr("data-id", cell.data("id"));
		$("<span>").addClass("id-label").text(cell.data("id")).appendTo(inset);
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
		var cell = ui.element.parent(".cell");
		cell.data("width", percent);

		var value = this.valueAccessor();
		value(percent);
		
		cell.parent(".grid").trigger("reformat");
	}
	
	function setSelected (event) {
		var id = $(event.currentTarget).data("id");
		
		$(".cell.selected").removeClass("selected");
		
		$(event.currentTarget).addClass("selected");
		
		$("table.properties").show();
		
		$("table.properties tbody[data-id = " + id + "]").show();
		$("table.properties tbody[data-id != " + id + "]").hide();
		
		return true;
	}
	
	var Gridder = function (elem) {		
		this.elem = $(elem);

		this.elem.on("reformat", $.proxy(this.reformat, this));		
		
		$("table.properties").hide();
	}

	Gridder.prototype = {};
	Gridder.prototype.constructor = Gridder;
	
	Gridder.prototype.reformat = function (event, element) {
		var x = 0;
		var y = 0;
		
		var ROW_WIDTH = this.elem.parent().width();
		this.ROW_HEIGHT = 75;
		
		var me = this;
		
		this.elem.find("div.cell").each(function (index) {
			var cell = $(this);
			
			var inset = cell.find(".inset");
			if (inset) {
				inset.resizable( { maxWidth: ROW_WIDTH } );
			}
			
//			var width = cell.data("width");
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
		});
		
		this.elem.height(y * me.ROW_HEIGHT).width(ROW_WIDTH);
	}
	
	return {
		Gridder: Gridder
	}
});