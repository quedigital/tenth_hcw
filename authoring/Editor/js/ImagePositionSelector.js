define(["imagesloaded.pkgd.min"], function (imagesLoaded) {

	ImagePositionSelector = function (url, data) {
		this.container = $("<div>").addClass("control");
		
		this.container.data("control", this);
		
		var img = $("<img>").attr({ src: url });
		
		var reticule = $("<i>").addClass("fa fa-dot-circle-o");
		reticule.css({ position: "absolute", color: "red" });
		reticule.draggable( { scroll: false, drag: $.proxy(this.getReticulePosition, this) } );
		
		this.container.append(img);
		this.container.append(reticule);
		
		this.data = data;
		this.img = img;
		this.reticule = reticule;
		
		imagesLoaded(img, $.proxy(this.onImageLoaded, this));		
	}
	
	ImagePositionSelector.prototype = Object.create(null);
	ImagePositionSelector.prototype.constructor = ImagePositionSelector;
	
	ImagePositionSelector.prototype.getContainer = function () {
		return this.container;
	}
	
	ImagePositionSelector.prototype.onImageLoaded = function () {
		var coords = this.data();
		
		this.reticule.position( { my: "center", at: coords, of: this.img, collision: "none" } );		
	}
	
	ImagePositionSelector.prototype.getReticulePosition = function () {
		var pos = this.reticule.position();
		var w = this.reticule.outerWidth();
		var h = this.reticule.outerHeight();
		
		// TODO: is this 10 due to padding:
		var x = pos.left - 10;
		var y = pos.top;
		
		var perx = Math.round(x / this.img.width() * 100);
		var pery = Math.round(y / this.img.height() * 100);
		
		var s = "left+" + perx + "% top+" + pery + "%";
		return s;
	}
	
	ImagePositionSelector.prototype.setDataToPosition = function () {
		this.data(this.getReticulePosition());
	}
	
	return ImagePositionSelector;
	
});	
