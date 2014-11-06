define(["jquery", "Helpers", "SiteHelpers"], function ($, Helpers, SiteHelpers) {
	// number, text, image, anchor
	SwipeRegion = function (content, layout, options, hints, img) {
		this.number = options && options.number;
		this.options = options;
		this.hints = hints;		
		
		this.elem = $("<section>").addClass("swipe_region");
		
		this.elem.data("step", this);
				
		this.img = img.clone();

		this.img.click($.proxy(SiteHelpers.showImageInLightbox, SiteHelpers, this.img, content.title, undefined, layout.background));
		
		this.image_wrapper = $("<div>").addClass("image_wrapper");
		this.elem.append(this.image_wrapper);

		this.image_scaler = $("<div>").addClass("image_scaler");
		this.image_wrapper.append(this.image_scaler);
		this.image_scaler.append(this.img);

		this.label = this.getLabelAsDOM();
		if (this.label) {
			this.label.css("visibility", "hidden").hide(0).appendTo(this.image_scaler);
		}
		
		var bounds = $("<div>").addClass("bounds");
		this.elem.append(bounds);
		this.bounds = bounds;
	}
	
	SwipeRegion.prototype = Object.create(null);
	SwipeRegion.prototype.constructor = SwipeRegion;

	function rectInRect (rect1, rect2) {
		if (rect1.left >= rect2.left && rect1.right <= rect2.rect && rect1.top >= rect2.top && rect1.bottom <= rect2.bottom) {
			return true;
		} else {
			return false;
		}
	}
	
	SwipeRegion.prototype.getLabelAsDOM = function () {
		var label;
		
		if (this.options && this.options.title != undefined) {
			label = $("<p>").addClass("swipe-region label")
				.text(options.title);
		} else if (this.options && this.options.number != undefined) {
			label = $("<span>").addClass("block")
				.addClass("shape")
				.append("<span>" + this.options.number);
		}
		
		return label;
	}
	
	SwipeRegion.prototype.setRect = function (rect) {
		this.rect = rect;		
	}
	
	SwipeRegion.prototype.format = function () {
		var image_w = this.img[0].naturalWidth;
		var image_h = this.img[0].naturalHeight;
		
		var imageScale = 1;
		if (Helpers.isVectorImage(this.img)) {
			imageScale = image_w / 1000;
			/*
			image_w = 1000;
			image_h = image_h / imageScale;
			*/
		} else {
			imageScale = image_w / 1000;
		}

		// center our rect in the parent
		var view_w = this.elem.parent().width();
		var view_h = this.elem.parent().height();
		
		if (!this.hints) {
			this.rect = { left: 0, top: 0, width: image_w, height: image_h };		
		} else {
			this.rect = { left: this.hints.bounds[0] * imageScale, top: this.hints.bounds[1] * imageScale, width: this.hints.bounds[2] * imageScale, height: this.hints.bounds[3] * imageScale };
		}
		
		this.elem.css( { width: view_w, height: view_h } );
		
		var scaleX = view_w / this.rect.width;
		var scaleY = view_h / this.rect.height;
		
		var scale = Math.min(scaleX, scaleY);
		
		// we want to show rect
		// we have a viewport of size view_w by view_h
		// we scale and translate to fit it
		var x1 = this.rect.left, y1 = this.rect.top;

		var scaled_width = this.rect.width * scale, scaled_height = this.rect.height * scale;
		var centering_x = (view_w - scaled_width) * .5;
		var centering_y = (view_h - scaled_height) * .5;
		
		var xx = Math.round((-x1 / scale) + (centering_x / scale));
		var yy = Math.round((-y1 / scale) + (centering_y / scale));

		var transform_origin = x1 + "px " + y1 + "px";
		var scaler = "scale(" + scale + ")";
		var translater = "translate(" + xx + "px," + yy + "px)";
		
		this.image_scaler.css( { "transform": scaler + " " + translater, "transform-origin": transform_origin } );
		
		if (this.label && this.hints.callout_target_id === "background") {
			var reg = /(?:\d*\.)?\d+/g;
			var match = this.hints.callout_target_pos.match(reg);
			if (match.length == 2) {
				var x = match[0] / 100 * image_w;
				var y = match[1] / 100 * image_h;
				var invScale = (1 / scale) * 2;
				this.label.css({ left: x, top: y, transform: "scale(" + invScale + ")" });
			}
		}
	}
	
	SwipeRegion.prototype.showLabel = function () {
		if (this.label) {
			// NOTE: using both visibility and hide seems redundant but... I punted
			this.label.css("visibility", "hidden").hide(0).removeClass("animated fadeIn").delay(750).addClass("animated fadeIn").css("visibility", "visible").show(0);
		}
	}
	
	SwipeRegion.prototype.hideLabel = function () {
		if (this.label) {
			this.label.css("visibility", "hidden").hide(0);
		}
	}
	
	return SwipeRegion;	
});
