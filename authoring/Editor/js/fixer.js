define(["imagesloaded.pkgd.min"], function (imagesLoaded) {
	var MARGIN = 10;
	
	var currentLayout;
	
	ko.bindingHandlers.fixedThing = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			currentLayout = new FixedLayout(element);
		},
		
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			$(element).trigger("update", bindingContext.$data);
		}
	}
	
	ko.bindingHandlers.boundsThing = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			if (currentLayout)
				currentLayout.addNewBoundsElement(element, valueAccessor, bindingContext);
		},
		
		update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			$(element).trigger("update", bindingContext.$data);
		}
	}
	
	/* FixedLayout */
	
	var FixedLayout = function (elem) {
		this.elem = $(elem);

		this.elem.data("layoutObject", this);
		
		this.elem.on("update", $.proxy(this.onUpdate, this));
		this.elem.on("resize_layout", $.proxy(this.onResize, this));
		
		this.backgroundSet = false;
		this.bounds = [];
		
		this.img = $("<img>");
		this.elem.prepend(this.img);
		
		imagesLoaded(this.img, $.proxy(this.onImageLoaded, this));
		
		$("#cell-property-table").hide();
	}

	FixedLayout.prototype = {};
	FixedLayout.prototype.constructor = FixedLayout;
	
	FixedLayout.prototype.onUpdate = function (event, data) {
		if (!this.backgroundSet && data.background()) {
			this.img.attr("src", data.background());
			
			this.backgroundSet = true;
		}
	}
	
	FixedLayout.prototype.onImageLoaded = function () {
		this.scaleBounds();
	}
	
	FixedLayout.prototype.getScale = function () {
		var img = this.img;
		
		this.currentSize = { width: img.width(), height: img.height() };
		this.originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
	
		return this.currentSize.width / this.originalSize.width;
	}
	
	FixedLayout.prototype.addNewBoundsElement = function (element, valueAccessor, bindingContext) {
		var b = new BoundsElement(this, element, valueAccessor, bindingContext);
		
		this.bounds.push(b);
	}
	
	FixedLayout.prototype.scaleBounds = function () {
		this.scale = this.getScale();
		
		for (var i = 0; i < this.bounds.length; i++) {
			var b = this.bounds[i];
			b.scaleTo(this.scale);
		}
	}
	
	FixedLayout.prototype.onResize = function (event) {
		this.scale = this.getScale();
		
		this.scaleBounds();
	}
	
	FixedLayout.prototype.setSelectedCell = function (id, trigger) {
		this.elem.find(".bounds.selected").removeClass("selected");
		
		var b = this.elem.find(".bounds[data-id=" + id + "]");
		b.addClass("selected");
		
		$("#cell-property-table").show();
		
		$("table.properties tbody[data-id = " + id + "]").show();
		$("table.properties tbody[data-id != " + id + "]").hide();
		
		if (trigger)
			this.elem.trigger("selectedCell", id);
	}
	
	/* BoundsElement */
	
	var BoundsElement = function (fixer, elem, valueAccessor, bindingContext) {
		this.fixer = fixer;
		
		this.elem = $(elem);
		
		this.elem.data("id", bindingContext.$data.id());
		
		this.valueAccessor = valueAccessor;
		
		this.elem.on("update", $.proxy(this.onUpdate, this));
		this.elem.click($.proxy(this.onClickBounds, this));
		
		this.elem.resizable({ stop: $.proxy(this.onResizeStop, this) });
		this.elem.draggable({ stop: $.proxy(this.onDragStop, this) });
		
		this.scale = 1;
	}

	BoundsElement.prototype = {};
	BoundsElement.prototype.constructor = BoundsElement;
	
	BoundsElement.prototype.onUpdate = function (event, data) {
		var rect = data.bounds();
		
		this.rect = { left: rect[0], top: rect[1], width: rect[2], height: rect[3] };
		
		this.scaleTo(this.scale);
		
		currentLayout.scaleBounds();
	}
	
	BoundsElement.prototype.scaleTo = function (scale) {
		this.scale = scale;
		
		var newRect = { left: this.rect.left * scale, top: this.rect.top * scale, width: this.rect.width * scale, height: this.rect.height * scale };
		
		this.elem.css(newRect);
	}
	
	BoundsElement.prototype.onDragStop = function (event) {
		var left = Math.round(parseFloat(this.elem.css("left")) / this.scale);
		var top = Math.round(parseFloat(this.elem.css("top")) / this.scale);
		
		var value = this.valueAccessor();

		var newRect = [ left, top, this.rect.width, this.rect.height ];
		
		this.rect.left = left;
		this.rect.top = top;
		
		value(newRect);
	}

	BoundsElement.prototype.onResizeStop = function (event) {
		var width = Math.round(parseFloat(this.elem.css("width")) / this.scale);
		var height = Math.round(parseFloat(this.elem.css("height")) / this.scale);
		
		var value = this.valueAccessor();

		var newRect = [ this.rect.left, this.rect.top, width, height ];
		
		this.rect.width = width;
		this.rect.height = height;
		
		value(newRect);
	}
	
	BoundsElement.prototype.onClickBounds = function (event) {
		var id = $(event.currentTarget).find(".cell-id").text();

		this.fixer.setSelectedCell(id, true);
				
		return true;
	}	
	
});