define(["jquery", "Helpers"], function ($, Helpers) {
	// number, text, image, anchor
	FixedRegion = function (options, hints) {
		this.elem = $("<div>").addClass("fixed_region");
		
		this.elem.data("step", this);
		
		if (options.title != undefined) {
			this.label = $("<p>").addClass("fixed-region label")
				.html(options.title)
				.appendTo(this.elem);
		} else if (options.number != undefined) {
			this.label = $("<span>").addClass(options.number == 1 ? "diamond" : "block")
				.addClass("shape")
				.append("<span>" + options.number)
				.appendTo(this.elem);
		} else {
			this.elem.addClass("no-number");
		}
		
		var bounds = $("<div>").addClass("bounds");
		this.elem.append(bounds);
		this.bounds = bounds;

		this.number = options.number;
		this.options = options;
		this.hints = hints;		
	}
	
	FixedRegion.prototype = Object.create(null);
	FixedRegion.prototype.constructor = FixedRegion;

	function rectInRect (rect1, rect2) {
		if (rect1.left >= rect2.left && rect1.right <= rect2.rect && rect1.top >= rect2.top && rect1.bottom <= rect2.bottom) {
			return true;
		} else {
			return false;
		}
	}
	
	FixedRegion.prototype.setRect = function (rect) {
		this.rect = rect;		
	}
	
	FixedRegion.prototype.format = function () {
		this.elem.css({ top: this.rect.top, left: this.rect.left });
		
		if (this.hints.callout_target_id === "background") {
			var image_wrapper = this.elem.parent().find(".image_wrapper");
			image_wrapper.append(this.label);
			this.label.position( { my: "center", at: this.hints.callout_target_pos, of: image_wrapper, collision: "none" } );
		}
	}
	
	FixedRegion.prototype.zoom = function (scale) {
		var inv_scale = (1 / scale);
		
		var slightly_bigger = inv_scale * 1.5;
		
		this.label.css("transform", "scale(" + slightly_bigger + ")");
	}
	
	FixedRegion.prototype.unzoom = function () {
		this.label.css("transform", "");
	}
	
	return FixedRegion;	
});
