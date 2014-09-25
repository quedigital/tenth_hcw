define(["Layout",
		"jqueryui",
		"imagesloaded.pkgd.min",
		"Step",
		"Sidebar",
		"auto-size-text",
		"Helpers",
		"debug",
		], function (Layout, jqueryui, imagesLoaded, Step, Sidebar, autoSizeText, Helpers, debug) {
	FixedLayout = function (container, layout, content, manager) {
		Layout.call(this, container, manager);
		
		this.layout = layout;
		this.content = content;

		this.container.addClass("fixed");

//		var div = $("<div>").attr("background-url", layout.background).css({ width: 200, height: 200, backgroundSize: "cover" });
//		$(container).append(div);
		var img = $("<img>").addClass("background").attr("src", layout.background);
		
		// size to fit containing pane (not window)
		var pane = $(this.container).parents(".ui-layout-pane");
		var h = pane.height();
		var w = pane.width();
		
		var ch = $("#content-holder");
		var padding = ch.outerWidth() - ch.width();
		
		if (w / h > 4 / 3) {
			img.height(h - padding);
		} else {
			img.width(w - padding);
		}

		this.container.height(h - padding);
				
		$(container).append(img);
		
		$("<div>").addClass("highlight").appendTo(container);		

		if (this.layout.textcolor) {
			this.container.css("color", this.layout.textcolor);
		}
		
		this.elements = [];
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.positionCells, this));
		
		this.currentStep = undefined;
	}
	
	FixedLayout.prototype = Object.create(Layout.prototype);
	FixedLayout.prototype.constructor = FixedLayout;
	
	FixedLayout.prototype.reflow = function () {
		console.log("reflow");
		
		this.positionCells();
	}
	
	FixedLayout.prototype.getImageScale = function (img) {
		if (Helpers.isVectorImage(img)) {
			var currentSize = { width: img.width(), height: img.height() };
			return currentSize.width / 1000;
		} else {
			var currentSize = { width: img.width(), height: img.height() };
			var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
	
			return currentSize.width / originalSize.width;
		}
	}
	
	FixedLayout.prototype.buildCells = function () {
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			var cell = Helpers.findByID(hint.id, this.content.cells);

			var options = $.extend(cell, hint);
			
			if (!cell) {
				debug.write("Couldn't find cell for hint " + hint.id);
				break;
			}
			
			switch (cell.type) {
				case "step":
					var step = new Step(options);
					
					step.elem.attr("data-id", cell.id);
					
					step.elem.css("visibility", "hidden");
			
					this.container.append(step.elem);
					
					step.elem.hover($.proxy(step.onHover, step));
					step.elem.on("touchend", $.proxy(step.onTouch, step));
					
					this.elements.push(step);
					
					break;
				case "sidebar":
					options.shrinkable = true;
					
					var sidebar = new Sidebar(options);
					
					sidebar.elem.css("visibility", "hidden");
												
					this.container.append(sidebar.elem);
					
					this.elements.push(sidebar);
					
					break;
			}
		}
		
		autoSizeText({ minSize: 12 });
	}
	
	FixedLayout.prototype.positionCells = function () {
		this.clearRects();
		
		var img = this.container.find(".background");

		this.container.width(img.width());
		
		var ch = $("#content-holder");
		var padding = ch.outerWidth() - ch.width();
		
		// center vertically
		var marginTop = (this.container.height() - img.height()) * .5 - (padding * .5);
		if (marginTop > 0)
			this.container.css("margin-top", marginTop);

		var currentSize = { width: img.width(), height: img.height() };
		var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
		
		this.scale = this.getImageScale(img);
		
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < hints.length; i++) {
			var hint = hints[i];
			var cell = Helpers.findByID(hint.id, this.content.cells);

			var rect = { left: Math.round(hint.bounds[0] * this.scale), top: Math.round(hint.bounds[1] * this.scale), width: Math.round(hint.bounds[2] * this.scale), height: Math.round(hint.bounds[3] * this.scale) };

			if (debug.isDebugMode()) {
				this.drawRect(rect);
			}
			
			switch (cell.type) {
				case "step":
					var step = this.elements[i];
					
					step.setRect(rect);
					
					step.setupPositions();
					
					step.elem.css("visibility", "visible");

					break;
				case "sidebar":
					var sidebar = this.elements[i];
												
					sidebar.setSize(rect.width, rect.height);					
					sidebar.setPosition(hint.anchor, rect);

					sidebar.elem.css("visibility", "visible");
					
					break;
			}
		}
		
		this.removeAllCallouts();
		this.addLineCallouts({ fromSelector: ".step" });
		
		this.layoutComplete();	
	}

	FixedLayout.prototype.clearRects = function () {
		this.container.find(".testrect").remove();
	}
	
	FixedLayout.prototype.drawRect = function (rect) {
		var r = $("<div>").addClass("testrect");
		r.css({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
		
		this.container.append(r);
	}
	
	FixedLayout.prototype.layoutComplete = function () {
		Layout.prototype.layoutComplete.call(this);
		
		var me = this;
		
		setTimeout(function () { me.expandFirstStep(); }, 1500);
	}
	
	FixedLayout.prototype.expandFirstStep = function () {
		this.currentStep = undefined;
		
		this.expandNextStep();
	}
	
	FixedLayout.prototype.expandNextStep = function () {
		var tryingFromStart = false;
		
		if (this.currentStep == undefined) {
			tryingFromStart = true;
			this.currentStep = -1;
		}
		
		var found = false;
		
		for (var i = this.currentStep + 1; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof Step) {
				el.expand();
				this.currentStep = i;
				found = true;
				break;
			}
		}
		
		if (!found && !tryingFromStart) {
			// start over
			this.currentStep = undefined;
			this.expandNextStep();
		}
	}

	FixedLayout.prototype.expandPreviousStep = function () {
		var tryingFromStart = false;
		
		if (this.currentStep == undefined) {
			tryingFromStart = true;
			this.currentStep = this.elements.length;
		}
		
		var found = false;
		
		for (var i = this.currentStep - 1; i >= 0; i++) {
			var el = this.elements[i];
			if (el instanceof Step) {
				el.expand();
				this.currentStep = i;
				found = true;
				break;
			}
		}
		
		if (!found && !tryingFromStart) {
			// start over
			this.currentStep = undefined;
			this.expandPreviousStep();
		}
	}
	
	FixedLayout.prototype.gotoNext = function () {
		this.expandNextStep();
	}

	FixedLayout.prototype.gotoPrevious = function () {
		this.expandPreviousStep();
	}
	
	return FixedLayout;
});