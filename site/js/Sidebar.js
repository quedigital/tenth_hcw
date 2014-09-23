define([], function () {

	// title, text, image
	Sidebar = function (options) {
		this.elem = $("<div>").addClass("sidebar");
		
		if (options.theme) {
			this.elem.addClass(options.theme);
		}
		
		$("<h2>").text(options.title)
			.appendTo(this.elem);
		
		var interior = $("<div>").addClass("interior").appendTo(this.elem);
		
		if (options.backgroundColor) {
			interior.css("backgroundColor", options.backgroundColor);
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

		if (options.shrinkable) {
			this.minimize();
		}
		
		this.setShrinkable(options.shrinkable || false);		
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

	Sidebar.prototype.setPosition = function (anchor, rect) {
		this.anchor = anchor;
		this.rect = $.extend({}, rect);
		
		var x, y;
		
		this.updatePosition();
	}
	
	Sidebar.prototype.updatePosition = function () {
		switch (this.anchor) {
			case "BL":
				var x = this.rect.left;
				var h = this.getHeight();
				var y = this.rect.top + this.rect.height - h;
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