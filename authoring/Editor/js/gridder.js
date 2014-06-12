define([], function () {
	var Gridder = function (elem) {		
		this.elem = elem;

		var me = this;
		
		this.elem.find("div.cell").each(function (index) {
			var cell = $(this);
			var inset = $("<div>").addClass("inset");
			inset.attr("data-id", cell.data("id"));
			inset.append("<span>").text(cell.data("id"));
			cell.append(inset);
			inset.resizable( { grid: 10, maxWidth: 150, minWidth: 10, handles: 'e', resize: $.proxy(me.onResize, me) } );
			cell.click(setSelected);
		});
				
		this.reformat();
	}

	Gridder.prototype = {};
	Gridder.prototype.constructor = Gridder;
		
	Gridder.prototype.reformat = function () {
		var x = 0;
		var y = 0;
		
		this.ROW_WIDTH = 150;
		var h = 50;
		this.MARGIN = 5;
		
		var me = this;
		
		this.elem.find("div.cell").each(function (index) {
			var cell = $(this);
			var width = parseInt(cell.data("width")) / 100;
			var cell_width = width * me.ROW_WIDTH;
			var cell_height = h;
			var inset = cell.find(".inset[data-id=" + cell.data("id") + "]");
			inset.width(cell_width - me.MARGIN).height(cell_height - me.MARGIN);
			if (x + width > 1) {
				x = 0;
				y += 1;
			}
			var xx = x * me.ROW_WIDTH;
			var yy = y * h;
			x += width;
			if (x + width > 1) {
				x = 0;
				y += 1;
			}
			cell.width(cell_width).height(h).css( { left: xx, top: yy } );
		});
		
		this.elem.height(y * h).width(me.ROW_WIDTH);
	}
	
	// TODO: save the new width to the database
	// TODO: add a handle for the resizable
	// TODO: add checkboxes for image position
	// reformat during cell resize
	Gridder.prototype.onResize = function (event, ui) {
		var w = ui.element.width() + this.MARGIN;
		var percent = w / this.ROW_WIDTH * 100;
		// round to nearest 10%
		percent = Math.round(percent / 10) * 10;
		var cell = ui.element.parent(".cell");
		cell.data("width", percent);
		
		this.reformat();
	}
	
	function setSelected (event) {
		var id = $(event.target).data("id");
		
		$(".inset.selected").removeClass("selected");
		
		$(event.target).addClass("selected");
		
		$("table.properties tbody[data-id = " + id + "]").show();
		$("table.properties tbody[data-id != " + id + "]").hide();
	}
	
	return {
		Gridder: Gridder
	}
});