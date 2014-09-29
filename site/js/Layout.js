define(["Helpers", "CalloutLine"], function (Helpers, CalloutLine) {
	Layout = function (container, manager) {
		this.container = container;
		this.manager = manager;
		
		this.container.data("layout", this);
		
		this.calloutLines = [];
		
		window.layout = this;
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
				
				var sourceDOM = this.container.find(options.fromSelector + "[data-id=" + id + "]").find(".block, .diamond, .textblock");
				
				var sourceCell = this.getCellDOM(id);
				
//				var line = new CalloutLine(this.container, sourceDOM, targetDOM, hint.callout_target_pos);
				var line = new CalloutLine(sourceCell, sourceDOM, targetDOM, hint.callout_target_pos);
				// lines will be displayed during scrolling
				line.elem.css("visibility", "hidden");
				this.calloutLines.push(line);
			}
		}	
	}

	Layout.prototype.getCellDOM = function (id) {
		return this.container.find(".cell[data-id=" + id + "]");
	}
	
	Layout.prototype.layoutComplete = function () {
		if (this.manager) {
			this.manager.onLayoutComplete(this);
		}
	}
	
	Layout.prototype.gotoPrevious = function () {
	}

	Layout.prototype.gotoNext = function () {
	}

	return Layout;
});