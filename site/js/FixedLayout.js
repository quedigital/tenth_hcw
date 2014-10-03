define(["Layout",
		"jqueryui",
		"imagesloaded.pkgd.min",
		"Step",
		"Sidebar",
		"auto-size-text",
		"Helpers",
		"debug",
		"tinycolor",
		], function (Layout, jqueryui, imagesLoaded, Step, Sidebar, autoSizeText, Helpers, debug, tinycolor) {
	FixedLayout = function (container, layout, content, manager) {
		Layout.call(this, container, manager);
		
		this.layout = layout;
		this.content = content;

		this.container.addClass("fixed");
		
		var image_holder = $("<div>").addClass("image_holder");
		this.image_holder = image_holder;
		
		this.container.append(image_holder);

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

		image_holder.height(h - padding);
				
		$(image_holder).append(img);
		
		$("<div>").addClass("highlight").appendTo(image_holder);		

		if (this.layout.textcolor) {
			this.container.css("color", this.layout.textcolor);

			var color = tinycolor(layout.textcolor);
			if (color.isValid()) {
				var brightness = color.getBrightness();
				if (brightness > 240) {
					this.container.parent().addClass("dark");
				}
			}
		}
		
		this.elements = [];
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.positionCells, this));
		
		this.currentStep = undefined;
		
		this.hasIntro = false;
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

			if (!cell) {
				debug.write("Couldn't find cell for hint " + hint.id);
				break;
			}
			
			switch (cell.type) {
				case "step":
					var step = new Step(cell, hint);
					
					step.elem.attr("data-id", cell.id);
					
					if (hint.anchor == "before" || hint.anchor == "after") {
						step.elem.addClass("extracted");
						if (hint.anchor == "before") {
							step.elem.insertBefore(this.image_holder);
						} else if (hint.anchor == "after") {
							var next = this.image_holder.next();
							if (!next.length) {
								step.elem.insertAfter(this.image_holder);
							} else {
								next = this.image_holder.siblings().last();
								step.elem.insertAfter(next);
							}
						}
					} else {
						step.elem.css("visibility", "hidden");
			
						this.image_holder.append(step.elem);
					
						step.elem.hover($.proxy(step.onHover, step));
						step.elem.on("touchend", $.proxy(step.onTouch, step));
						step.elem.on("expand", $.proxy(this.onExpandStep, this));
					}
										
					this.elements[i] = step;
					
					break;
				case "sidebar":
					hint.shrinkable = true;
					
					var sidebar = new Sidebar(cell, hint);
					
					sidebar.elem.css("visibility", "hidden");
												
					this.image_holder.append(sidebar.elem);
					
					this.elements[i] = sidebar;
					
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
		
		/*
		// center vertically
		var marginTop = (this.container.height() - img.height()) * .5 - (padding * .5);
		if (marginTop > 0)
			this.container.css("margin-top", marginTop);
		*/

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
					
					if (step) {
						if (step.isExtracted()) {
							step.format(hint);
						} else {
							step.setRect(rect);
							step.setupPositions();
							step.elem.css("visibility", "visible");
						}
					}

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
	
	FixedLayout.prototype.unexpandAllExcept = function  (el) {
		for (var i = 0; i < this.elements.length; i++) {
			var el2 = this.elements[i];
			if (el2) {
				if (el instanceof Step) {
					if (el2 instanceof Step && el2 != el) {
						el2.unexpand();
					}
				} else {
					if (el2 instanceof Step && el2.elem[0] != el) {
						el2.unexpand();					
					} else if (el2.elem[0] == el) {
						// quasi-kludge: this is the step we just moused over
						this.currentStep = i;
					}
				}
			}
		}
	}
	
	FixedLayout.prototype.expandFirstStep = function () {
		this.currentStep = undefined;
		
		this.expandNextStep();
	}
	
	FixedLayout.prototype.expandStepByIndex = function (n) {
		var count = 0;
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof Step && !el.isIntro) {
				if (count == n) {
					this.unexpandAllExcept(el);
					el.expand();
					this.currentStep = i;
					break;
				} else {
					count++;
				}
			}
		}
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
				this.unexpandAllExcept(el);
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
		
		for (var i = this.currentStep - 1; i >= 0; i--) {
			var el = this.elements[i];
			if (el instanceof Step) {
				this.unexpandAllExcept(el);
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
	
	FixedLayout.prototype.onExpandStep = function (event) {
		this.unexpandAllExcept(event.target);
	}
	
	FixedLayout.prototype.activate = function () {
		Layout.prototype.activate.call(this);
		
		this.expandFirstStep();
		
		// count all the non-intro elements
		var count = 0;
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el && !el.isIntro) {
				count++;
			}
		}
		
		var items = new Array(count);
			
		this.container.trigger("controls", { layout: this, items: items });
	}
	
	FixedLayout.prototype.gotoStep = function (n) {
		this.expandStepByIndex(n);
	}

	return FixedLayout;
});