define(["jquery", "SiteHelpers"], function ($, SiteHelpers) {

	// title, text, image
	CellImage = function (options, hints, title, identifier, background) {
		this.elem = $("<div>").addClass("cell-image");

		this.elem.data("CellImage", this);

		if (options.image) {
			var img = $("<img>").attr("src", options.image);
			this.elem.append(img);
			
			var w = hints.imageWidth || 1.0;
			
			img.css( { width: w * 100 + "%" } );

			img.click($.proxy(SiteHelpers.showImageInLightbox, SiteHelpers, img, title, identifier, background));
			
			this.img = img;
		}
		
		this.hints = hints;
		this.options = options;
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
		
//		this.img.width(w * image_w);
		this.img.width((100 * image_w) + "%");		
	}
	
	return CellImage;
});