define([], function () {

	// title, text, image
	Sidebar = function (options, hints) {
		this.elem = $("<div>").addClass("sidebar");
		
		if (hints.theme) {
			this.elem.addClass(hints.theme);
		}
		
		$("<h2>").text(options.title)
			.appendTo(this.elem);
		
		var interior = $("<div>").addClass("interior").appendTo(this.elem);
		
		if (hints.backgroundColor) {
			interior.css("backgroundColor", hints.backgroundColor);
		}
		
		$("<p>").html(options.text).appendTo(interior);
		
		if (options.image) {
			var img = $("<img>").attr("src", options.image);
			var div = $("<div>").addClass("image").append(img);
			interior.append(div);
			
			img.load(function () {
				img.width(img[0].naturalWidth);
				img.height(img[0].naturalHeight);
			});
		}

		if (hints.shrinkable) {
			this.minimize();
		}
		
		this.setShrinkable(hints.shrinkable || false);		
	}
	
	Sidebar.prototype = Object.create(null);
	Sidebar.prototype.constructor = Sidebar;
	
	Sidebar.prototype.setShrinkable = function (val) {
		this.shrinkable = val;
		
		if (this.shrinkable) {
			this.elem.hover($.proxy(this.maximize, this), $.proxy(this.minimize, this));
		} else {
			this.elem.off("hover");
		}
	}
	
	Sidebar.prototype.maximize = function () {
		this.elem.find(".interior").css("display", "block");
		this.updatePosition();
	}
	
	Sidebar.prototype.minimize = function () {
		this.elem.find(".interior").css("display", "none");
		this.updatePosition();
	}
	
	Sidebar.prototype.getHeight = function () {
		return this.elem.outerHeight();
	}

	Sidebar.prototype.getWidth = function () {
		return this.elem.outerWidth();
	}

	Sidebar.prototype.setPosition = function (anchor, rect) {
		this.anchor = anchor;
		this.rect = $.extend({}, rect);
		
		var x, y;
		
		this.updatePosition();
	}
	
	Sidebar.prototype.updatePosition = function () {
		var container = this.elem.parent();
		
		var x, y;
		var w, h;
		
		switch (this.anchor) {
			case "TL":
				x = this.rect.left;
				y = this.rect.top;
				var h = this.getHeight();
				if (y + h > container.height()) {
					this.elem.find(".interior").height(this.rect.height);
					this.elem.addClass("overflowing");
				}
				w = this.getWidth();
				x = this.rect.left + this.rect.width - w;
				break;
			case "TR":
				x = this.rect.left;
				y = this.rect.top;
				var h = this.getHeight();
				if (y + h > container.height()) {
					this.elem.find(".interior").height(this.rect.height);
					this.elem.addClass("overflowing");
				}
				break;
			case "BL":
				x = this.rect.left;
				h = this.getHeight();
				y = this.rect.top + this.rect.height - h;
				break;
			case "BR":
				h = this.getHeight();
				if (h > container.height()) {
					this.elem.find(".interior").height(this.rect.height);
					h = this.getHeight();
					this.elem.addClass("overflowing");
				}
				w = this.getWidth();
				y = this.rect.top + this.rect.height - h;		
				x = this.rect.left + this.rect.width - w;
				break;
		}
		
		this.elem.css("position", "absolute");
		this.elem.css({ left: x + "px", top: y + "px" });
	}
	
	Sidebar.prototype.setSize = function (w, h) {
		if (this.open) {
			this.elem.css({ overflow: "visible", width: w + "px" });
		} else {
			this.elem.css({ overflow: "hidden", width: w + "px" });
		}
	}

	return Sidebar;
});