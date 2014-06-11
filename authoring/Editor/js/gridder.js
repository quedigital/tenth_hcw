define([], function () {
	function format (elem) {
		var x = 0;
		var y = 0;
		
		var w = 150;
		var h = 50;
		var MARGIN = 5;
		
		elem.find("div").each(function (index) {
			var cell = $(this);
			var width = parseInt(cell.data("width")) / 100;
			var xx = x * w;
			var yy = y * h;
			var cell_width = width * w;
			var cell_height = h;
			var inset = $("<div>").addClass("inset").width(cell_width - MARGIN).height(cell_height - MARGIN);
			inset.data("id", cell.data("id"));
			inset.append("<span>").text(cell.data("id"));
			cell.append(inset);
			cell.width(cell_width).height(h).css( { left: xx, top: yy } );
			inset.resizable( { grid: 50, maxWidth: 150, minWidth: 10, handles: 'e' } );
			x += width;
			if (x >= 1) {
				x = 0;
				y += 1;
			}
			
			cell.click(setSelected);
		});
		
		elem.height(y * h).width(w);
	}
	
	function setSelected (event) {
		var id = $(event.target).data("id");
		
		$(".inset.selected").removeClass("selected");
		
		$(event.target).addClass("selected");
		
		$("table.properties tbody[data-id = " + id + "]").show();
		$("table.properties tbody[data-id != " + id + "]").hide();
	}
	
	return {
		format: format
	}
});