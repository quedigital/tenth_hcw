define(["Helpers", "CalloutLine"], function (Helpers, CalloutLine) {
	Layout = function (container, manager) {
		this.container = container;
		this.manager = manager;
		
		this.container.data("layout", this);
		
		this.calloutLines = [];
		
		this.isReady = false;
		this.isActive = false;
		
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
			if (id == "9") {
				var a = 5;
			}
			var hint = Helpers.findByID(id, hints);
			if (hint.callout_target_id) {
				var target_id = hint.callout_target_id;
				var targetDOM;
				if (target_id == "background") {
					targetDOM = this.container.find(".background").parent();
				} else {
					targetDOM = this.getCellDOM(target_id);
				}
				
				var el = this.container.find(options.fromSelector + "[data-id=" + id + "]");
				var sourceDOM = el.find(".block, .diamond, .bounds, .textblock");
				
				var line = new CalloutLine(sourceDOM.parent(), sourceDOM, targetDOM, hint.callout_target_pos);
				// lines will be displayed during scrolling or clicking
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
		
		this.isReady = true;
	}
	
	Layout.prototype.gotoPrevious = function () {
	}

	Layout.prototype.gotoNext = function () {
	}
	
	Layout.prototype.gotoStep = function (n) {
		console.log("got " + n);
	}
	
	Layout.prototype.activate = function () {
		this.isActive = true;
	}
	
	Layout.prototype.deactivate = function () {
		this.isActive = false;
	}

	return Layout;
});