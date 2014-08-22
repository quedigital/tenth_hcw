define(["Helpers", "CalloutLine"], function (Helpers, CalloutLine) {
	Layout = function () {
		this.calloutLines = [];
	}
	
	Layout.prototype = Object.create(null);
	Layout.prototype.constructor = Layout;

	function removeCalloutLines (index, element) {
		element.remove();
	}
	
	Layout.prototype.removeAllCallouts = function () {
		$.each(this.calloutLines, removeCalloutLines);
	}
	
	// add callout lines AFTER the spread is fully laid out
	Layout.prototype.addLineCallouts = function (options) {
		var cells = $.map(this.content.cells, function (el) { return el });
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var id = cell.id;
			var hint = Helpers.findByID(id, hints);
			if (hint.callout_target_id) {
				var target_id = hint.callout_target_id;
				var targetDOM;
				if (target_id == "background") {
					targetDOM = this.container.find(".background").parent();
				} else {
					targetDOM = this.getCellDOM(target_id);
				}
				
				var sourceDOM = this.container.find(options.fromSelector + "[data-id=" + id + "]").find(".block, .diamond");
				
				var line = new CalloutLine(this.container, sourceDOM, targetDOM, hint.callout_target_pos);
				this.calloutLines.push(line);
			}
		}	
	}

	Layout.prototype.getCellDOM = function (id) {
		return this.container.find(".cell[data-id=" + id + "]");
	}

	return Layout;
});