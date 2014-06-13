define([], function () {
	ko.bindingHandlers.gridThing = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			$(element).trigger("init", element);
			
			// when the observable changes, trigger a resize (it doesn't happen automatically when the observable isn't a custom binding)
			valueAccessor().subscribe(function (newValue) {
				var grid = $(element).parent(".grid");
				grid.trigger("reformat");
			});
			
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			// reformat the grid and save a reference to our viewModel for future updates (ie, resizing)
			$(element).trigger("reformat", [element, bindingContext]);
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
	
	function onClick (event) {
		console.log($(event.target).attr("name"));
	}
	
	var Gridder = function (elem) {		
		this.elem = elem;
		
		this.elem.on("reformat", $.proxy(this.reformat, this));
		this.elem.on("init", $.proxy(this.initializeCell, this));
		
		this.bindingContexts = {};
		
		window.test = this;
		
		this.reformat();
	}

	Gridder.prototype = {};
	Gridder.prototype.constructor = Gridder;
	
	Gridder.prototype.initializeCell = function (event, cell) {
		cell = $(cell);
		var me = this;
		
		if (!cell.find(".inset").length) {
			var inset = $("<div>").addClass("inset");
			inset.attr("data-id", cell.data("id"));
			$("<span>").addClass("id-label").text(cell.data("id")).appendTo(inset);
			$("<input type='checkbox'>").attr("name", "TL").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "TR").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "BR").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "BL").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "R").attr("data-bind", "checkbox: image").appendTo(inset);
			$("<input type='checkbox'>").attr("name", "L").attr("data-bind", "checkbox: image").appendTo(inset);
			cell.append(inset);
			inset.resizable( { grid: 10, maxWidth: 150, minWidth: 10, handles: 'e', resize: $.proxy(me.onResize, me) } );
			cell.click(setSelected);
		}
	}
	
	Gridder.prototype.reformat = function (event, element, bindingContext) {
		var x = 0;
		var y = 0;
		
		this.ROW_WIDTH = 150;
		this.ROW_HEIGHT = 75;
		this.MARGIN = 10;
		
		var me = this;
		
		if (bindingContext) {
			var id = $(element).data("id");
			me.bindingContexts[id] = bindingContext;
		}
		
		this.elem.find("div.cell").each(function (index) {
			var cell = $(this);
			
//			var width = cell.data("width");
			var width = cell.attr("data-width");
			if (width) {
				width = parseFloat(width);
				var cell_width = width * me.ROW_WIDTH;
				var cell_height = me.ROW_HEIGHT;
				var inset = cell.find(".inset");
				inset.width(cell_width - me.MARGIN).height(cell_height - me.MARGIN);
				if (x + width > 1) {
					x = 0;
					y += 1;
				}
				var xx = x * me.ROW_WIDTH;
				var yy = y * me.ROW_HEIGHT;
				x += width;
				if (x + width > 1) {
					x = 0;
					y += 1;
				}
				cell.width(cell_width).height(me.ROW_HEIGHT).css( { left: xx, top: yy } );
			}
		});
		
		this.elem.height(y * me.ROW_HEIGHT).width(me.ROW_WIDTH);
	}
	
	// TODO: save the new width to the database
	// TODO: add a handle for the resizable
	// TODO: add checkboxes for image position
	// reformat during cell resize
	Gridder.prototype.onResize = function (event, ui) {
		var w = ui.element.width() + this.MARGIN;
		var percent = w / this.ROW_WIDTH;
		// round to nearest 10%
		percent = Math.round(percent * 10) / 10;
		var cell = ui.element.parent(".cell");
		cell.data("width", percent);

		// using the Knockout bindingContext (previously stored in reformat) to update the width
		var id = cell.data("id");
		var bindingContext = this.bindingContexts[id];
		if (bindingContext) {
			bindingContext.$data.width(percent);
		}
		
		this.reformat();
	}
	
	function setSelected (event) {
		var id = $(event.currentTarget).data("id");
		
		$(".cell.selected").removeClass("selected");
		
		$(event.currentTarget).addClass("selected");
		
		$("table.properties tbody[data-id = " + id + "]").show();
		$("table.properties tbody[data-id != " + id + "]").hide();
		
		return true;
	}
	
	return {
		Gridder: Gridder
	}
});