define(["Layout",
		"jqueryui",
		"imagesloaded.pkgd.min",
		"Step",
		"FixedStep",
		"Sidebar",
		"CellImage",
		"Helpers",
		"SiteHelpers",
		"debug",
		"tinycolor",
		"jquery.columnizer",
		], function (Layout, jqueryui, imagesLoaded, Step, FixedStep, Sidebar, CellImage, Helpers, SiteHelpers, debug, tinycolor) {
	FixedLayout = function (container, layout, content, manager) {
		Layout.call(this, container, manager, content);
		
		this.layout = layout;
		this.content = content;

		this.container.addClass("fixed");
		
		var image_holder = $("<div>").addClass("image_holder");
		this.image_holder = image_holder;
		
		var nextButton = $("<div>").addClass("nav-button next").html("&#xf054;");
		nextButton.click($.proxy(this.gotoNext, this));
		image_holder.append(nextButton);

		var prevButton = $("<div>").addClass("nav-button prev").html("&#xf053;");
		prevButton.click($.proxy(this.gotoPrevious, this));
		image_holder.append(prevButton);
		
		this.container.append(image_holder);

		var img = $("<img>").addClass("background").attr("src", layout.background);
		img.click($.proxy(SiteHelpers.showImageInLightbox, SiteHelpers, img, content.title, undefined));
		this.img = img;
		
		$(image_holder).append(img);
		
		$("<div>").addClass("highlight").appendTo(image_holder);		

		if (this.layout.textcolor) {
			this.container.css("color", this.layout.textcolor);
		}
		
		// theory: for fixed layouts, "dark" only applies if the background color is dark
		if (this.layout.bgcolor) {
			this.container.css("background", this.layout.bgcolor);
			
			var color = tinycolor(layout.bgcolor);
			if (color.isValid()) {
				var brightness = color.getBrightness();
				if (brightness < 15) {
					this.container.parent().addClass("dark");
				}
			}
		}
		
		this.elements = [];
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.onImagesLoaded, this));
		
		this.currentStep = undefined;
	}
	
	FixedLayout.prototype = Object.create(Layout.prototype);
	FixedLayout.prototype.constructor = FixedLayout;
	
	FixedLayout.prototype.sizeToFitContainingPane = function () {
		// size to fit containing pane (not window)
		var image_w = this.img[0].naturalWidth;
		var image_h = this.img[0].naturalHeight;
		
		var pane = $(this.container).parents(".ui-layout-pane");
		var h = pane.height();
		var w = pane.width();
		
		var ch = $("#content-holder");
		var padding = ch.outerWidth() - ch.width();
		
		if (image_w / image_h < w / h) {
			this.img.height(h - padding);
		} else {
			this.img.width(w - padding);
		}

		this.image_holder.height(h - padding);
	}
	
	FixedLayout.prototype.onImagesLoaded = function () {
		this.sizeToFitContainingPane();
				
		this.positionCells();		
		this.layoutComplete();	
	}
	
	FixedLayout.prototype.reflow = function () {
		console.log("reflowing fixed");
		this.sizeToFitContainingPane();
		this.positionCells();
		this.expandCurrentStep();
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
		var cells = $.map(this.content.cells, function (el) { return el });
		
		cells.sort(Helpers.sortByPriority);
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var hint = Helpers.findByID(cell.id, this.layout.hints);
			
			if (!cell) {
				debug.write("Couldn't find cell for hint " + hint.id);
				break;
			}
			
			var elem;
			
			switch (cell.type) {
				case "step":
					if (hint.anchor == "before" || hint.anchor == "after") {
						var step = new Step(cell, hint);
					} else {
						var step = new FixedStep(cell, hint);
					
						step.elem.css("visibility", "hidden");
			
						this.image_holder.append(step.elem);
					
						step.elem.click($.proxy(this.onClickStep, this, step));
						step.elem.on("touchend", $.proxy(step.onTouch, step));
						step.elem.on("expand", $.proxy(this.onExpandStep, this));
					}
										
					step.elem.attr("data-id", cell.id);
					
					this.elements[i] = step;
					
					elem = step.elem;
					
					break;
				case "sidebar":
					hint.shrinkable = (hint.anchor != "before" && hint.anchor != "after");
					
					var sidebar = new Sidebar(cell, hint);

					if (hint.anchor == "before" || hint.anchor == "after") {
						// nothing to do here
					} else {					
						sidebar.elem.css("visibility", "hidden");
												
						this.image_holder.append(sidebar.elem);
					}
					
					this.elements[i] = sidebar;
					
					elem = sidebar.elem;
					
					break;		
				case "image":
					var image = new CellImage(cell, hint);
					
					this.elements[i] = image;
					
					elem = image.elem;
					
					break;
			}
			
			if (hint.anchor == "before" || hint.anchor == "after") {
				elem.addClass("extracted");
				if (hint.anchor == "before") {
					elem.insertBefore(this.image_holder);
				} else if (hint.anchor == "after") {
					var next = this.image_holder.next();
					if (!next.length) {
						elem.insertAfter(this.image_holder);
					} else {
						next = this.image_holder.siblings().last();
						elem.insertAfter(next);
					}
				}
			}
		}
		
//		autoSizeText({ minSize: 12 });
	}
	
	FixedLayout.prototype.positionCells = function () {
		this.clearRects();
		
		var img = this.container.find(".background");
		
		this.container.width(img.width());
		
		var ch = $("#content-holder");
		var padding = ch.outerWidth() - ch.width();
		
		var currentSize = { width: img.width(), height: img.height() };
		var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
		
		this.scale = this.getImageScale(img);
		
		var cells = $.map(this.content.cells, function (el) { return el });
		
		cells.sort(Helpers.sortByPriority);
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var hint = Helpers.findByID(cell.id, this.layout.hints);

			var rect = { left: Math.round(hint.bounds[0] * this.scale), top: Math.round(hint.bounds[1] * this.scale), width: Math.round(hint.bounds[2] * this.scale), height: Math.round(hint.bounds[3] * this.scale) };

			if (debug.isDebugMode()) {
				this.drawRect(rect);
			}
			
			switch (cell.type) {
				case "step":
					var step = this.elements[i];
					
					if (step) {
						if (step instanceof Step) {
							step.format(hint);
						} else if (step instanceof FixedStep) {
							step.elem.css("visibility", "hidden");
							step.setRect(rect);
							step.setupPositions();
							step.elem.css("visibility", "visible");
							//step.returnToCurrentPosition();
						}
					}

					break;
				case "sidebar":
					var sidebar = this.elements[i];
					
					if (!sidebar.isExtracted()) {												
						sidebar.setSize(rect.width, rect.height);					
						sidebar.setPosition(hint.anchor, rect);

						sidebar.elem.css("visibility", "visible");
					}
					
					break;
			}
		}
		
		this.removeAllCallouts();
		this.addLineCallouts({ fromSelector: ".fixed_step" });		
	}

	FixedLayout.prototype.clearRects = function () {
		this.container.find(".testrect").remove();
	}
	
	FixedLayout.prototype.drawRect = function (rect) {
		var r = $("<div>").addClass("testrect");
		r.css({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
		
		this.image_holder.append(r);
	}
	
	FixedLayout.prototype.unexpandAllExcept = function  (el) {
		for (var i = 0; i < this.elements.length; i++) {
			var el2 = this.elements[i];
			if (el2) {
				if (el instanceof FixedStep) {
					if (el2 instanceof FixedStep && el2 != el) {
						el2.unexpand();
					}
				} else {
					if (el2 instanceof FixedStep && el2.elem[0] != el) {
						el2.unexpand();					
					} else if (el2.elem[0] == el) {
						// quasi-kludge: this is the step we just moused over
						this.currentStep = i;
					}
				}
			}
		}
	}
	
	FixedLayout.prototype.expandCurrentStep = function () {
		if (this.currentStep == undefined)
			return;
		
		var count = 0;
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedStep) {
				if (count == this.currentStep)
					el.expand();
				else
					el.unexpand();
				count++;
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
			if (el instanceof FixedStep) {
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
	
	FixedLayout.prototype.getStepIndex = function (step) {
		var count = 0;
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedStep) {
				if (el == step) return count;
				else count++;
			}
		}
		
		return undefined;
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
			if (el instanceof FixedStep) {
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
			if (el instanceof FixedStep) {
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
	
	FixedLayout.prototype.firstElementIsFixedStep = function () {
		return (this.elements.length > 0 && this.elements[0] instanceof FixedStep);
	}
	
	FixedLayout.prototype.activate = function () {
		Layout.prototype.activate.call(this);
		
		if (this.firstElementIsFixedStep())
			this.expandFirstStep();
		else
			this.unexpandAllExcept();
		
		var items = [];
		
		// count all the non-extracted elements
		var count = 0;
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el && el instanceof FixedStep) {
				if (el.options.title) {
					items.push(el.options.title);
				} else {
					items.push(el.options.number);
				}
			}
		}
			
		this.container.trigger("controls", { layout: this, items: items });
	}
	
	FixedLayout.prototype.gotoStep = function (n) {
		this.expandStepByIndex(n);
	}
	
	FixedLayout.prototype.onClickStep = function (step) {
		if (step.isExpanded) {
			step.gotoNextPage();
		} else {
			this.currentStep = this.getStepIndex(step);
			step.expand();
			this.unexpandAllExcept(step);
		}
	}

	return FixedLayout;
});