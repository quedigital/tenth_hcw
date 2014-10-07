define([], function () {

	// title, text, image
	CellImage = function (options, hints) {
		this.elem = $("<div>").addClass("cell-image");

		this.elem.data("CellImage", this);

		if (options.image) {
			var img = $("<img>").attr("src", options.image);
			this.elem.append(img);
			
			var w = hints.imageWidth || 1.0;
			
			img.css("width", w * 100 + "%");
		}
		
		this.hints = hints;
	}
	
	CellImage.prototype = Object.create(null);
	CellImage.prototype.constructor = CellImage;

	CellImage.prototype.isExtracted = function () {
		return (this.hints && (this.hints.anchor == "before" || this.hints.anchor == "after"));
	}
	
	CellImage.prototype.format = function () {
		var elem = this.elem;
		var hint = this.hints;
		
		// centered image
		// TODO: handle narrow images differently?
		// account for the element's padding and margin
		var paddT = elem.innerWidth() - elem.width();
		var margT = elem.outerWidth(true) - elem.outerWidth();
		var w = elem.parent().width() * hint.width - paddT - margT;

		var image_w = 1.0;
		if (!isNaN(hint.imageWidth)) {
			image_w = Math.max(.1, Math.min(.9, hint.imageWidth));
		}

		elem.find(".image img").width(w * image_w);
		
		/*
		x = (elem.parent().width() - w) * .5;
		x = 0;
		elem.css({ left: x, top: y, width: "auto" });
		*/
	}
	
	return CellImage;
});