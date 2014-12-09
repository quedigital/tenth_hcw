define(["Layout",
		"jqueryui",
		"imagesloaded.pkgd.min",
		"Step",
		"FixedRegion",
		"Sidebar",
		"CellImage",
		"Helpers",
		"debug",
		"tinycolor",
		"FixedControls",
		], function (Layout, jqueryui, imagesLoaded, Step, FixedRegion, Sidebar, CellImage, Helpers, debug, tinycolor) {
		
	PanZoomLayout = function (container, layout, content, manager) {	
		Layout.call(this, container, manager, content);
		
		this.layout = layout;
		this.content = content;

		this.container.addClass("panzoom");
		
		var image_holder = $("<div>").addClass("image_holder");
		this.image_holder = image_holder;

		this.preamble = $("<div>").addClass("preamble");
		var preamble_text = $("<div>").addClass("preamble-text").appendTo(this.preamble);
		this.preamble_main = $("<div>").addClass("preamble-main").appendTo(preamble_text);
		var preamble_footer = $("<div>").addClass("preamble-footer").html("Show me <span class='red'>how</span>…").appendTo(preamble_text);
		this.preamble.appendTo(this.container);
		
		preamble_footer.click($.proxy(this.gotoStep, this, 1));
		
		this.container.append(image_holder);

		this.controls = $("<div>").addClass("controls");
		this.container.append(this.controls);

		var viewport = $("<div>").addClass("viewport");
		this.viewport = viewport;
		image_holder.append(viewport);
		
		var image_wrapper = $("<div>").addClass("image_wrapper");
		this.image_wrapper = image_wrapper;
		viewport.append(image_wrapper);
		
		var img = $("<img>").addClass("background").attr("src", layout.background);
		this.img = img;
		
		image_wrapper.append(img);

		var text_holder = $("<div>").addClass("text_holder animated flipInY").css("display", "none");
		this.text_holder = text_holder;
		viewport.append(text_holder);
				
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
		
		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.onImagesLoaded, this));
		
		this.currentStep = undefined;
	}
	
	PanZoomLayout.prototype = Object.create(Layout.prototype);
	PanZoomLayout.prototype.constructor = PanZoomLayout;
	
	PanZoomLayout.prototype.sizeToFitContainingPane = function () {
		// size to fit containing pane (not window)
		var image_w = this.img[0].naturalWidth;
		var image_h = this.img[0].naturalHeight;
		
		var pane = $(this.container).parent();
		var h = window.innerHeight - this.controls.height();
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
	
	PanZoomLayout.prototype.onImagesLoaded = function () {
		this.sizeToFitContainingPane();
				
		this.positionCells();		
		this.layoutComplete();	
	}
	
	PanZoomLayout.prototype.reflow = function () {
		console.log("reflowing panzoom");
		this.sizeToFitContainingPane();
		this.positionCells();
	}
	
	PanZoomLayout.prototype.getImageScale = function (img) {
		if (Helpers.isVectorImage(img)) {
			var currentSize = { width: img.width(), height: img.height() };
			return currentSize.width / 1000;
		} else {
			var currentSize = { width: img.width(), height: img.height() };
			var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
	
			return currentSize.width / originalSize.width;
		}
	}
	
	PanZoomLayout.prototype.buildCells = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		
		cells.sort(Helpers.sortByPriority);
		
		var styledFirstStep = false;
		
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
						if (hint.anchor == "before" && !styledFirstStep) {
							step.styleFirstWords();
							styledFirstStep = true;
						}
					} else {
						var step = new FixedRegion(cell, hint);
					
						step.elem.css("visibility", "hidden");
			
						this.image_holder.append(step.elem);
					
						if (step.label)
							step.label.click($.proxy(this.onClickStep, this, step));
							
						step.elem.on("touchend", $.proxy(step.onTouch, step));
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
					
				case "interactive":
					var interactive = new Interactive(cell, hint);
					this.elements[i] = interactive;
					elem = interactive.elem;
					
					break;
			}
			
			if (hint.anchor == "before" || hint.anchor == "after") {
				elem.addClass("extracted");
				if (hint.anchor == "before") {
//					elem.insertBefore(this.image_holder);
					elem.appendTo(this.preamble_main);
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
		
		var items = this.getItemNames();
		this.controls.panzoomControls( { 	items: items,
												selectFirstItem: true,
												onClickStep: $.proxy(this.gotoStep, this),
												onClickPrevious: $.proxy(this.gotoPrevious, this),
												onClickNext: $.proxy(this.gotoNext, this),
										 } );
	}

	PanZoomLayout.prototype.getItemNames = function () {
		var items = [];
		
		// count all the non-extracted elements
		var count = 0;
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el && el instanceof FixedRegion) {
				if (el.options && el.options.title) {
					var t = $("<div>").html(el.options.title).text();
					items.push(t);
				} else if (el.options && el.options.number) {
					items.push(el.options.number);
				}
			}
		}
		
		return items;
	}
	
	PanZoomLayout.prototype.positionCells = function () {
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
						} else if (step instanceof FixedRegion) {
							step.elem.css("visibility", "hidden");
							step.setRect(rect);
							step.format();
							step.elem.css("visibility", "visible");
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
		
		// position preamble so it slightly overlaps image
//		this.preamble.height(this.preamble.find(".preamble-text").height() - 50);
		
		this.controls.panzoomControls("refresh");
	}

	PanZoomLayout.prototype.clearRects = function () {
		this.container.find(".testrect").remove();
	}
	
	PanZoomLayout.prototype.drawRect = function (rect) {
		var r = $("<div>").addClass("testrect");
		r.css({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
		
		this.viewport.append(r);
	}
	
	PanZoomLayout.prototype.getNumSteps = function () {
		var count = 0;
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				count++;
			}
		}
		
		return count;
	}
	
	PanZoomLayout.prototype.getStepIndex = function (step) {
		var count = 0;
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				if (el == step) return count;
				else count++;
			}
		}
		
		return undefined;
	}

	PanZoomLayout.prototype.getStepByIndex = function (index) {
		var count = 0;
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				if (count == index) return el;
				else count++;
			}
		}
		
		return undefined;
	}
	
	PanZoomLayout.prototype.zoomNextStep = function () {
		var next = undefined;
		
		if (this.currentStep == undefined) {
			next = this.getStepByIndex(0);
		} else {
			var n = this.getStepIndex(this.currentStep);
			if (n >= this.getNumSteps() - 1) {
				next = this.getStepByIndex(0);
			} else {
				next = this.getStepByIndex(n + 1);
			}
		}
		
		this.zoomToStep(next);
	}

	PanZoomLayout.prototype.zoomPreviousStep = function () {
		var prev = undefined;
		
		if (this.currentStep == undefined) {
			prev = this.getStepByIndex(0);
		} else {
			var n = this.getStepIndex(this.currentStep);
			if (n <= 0) {
				var num = this.getNumSteps();
				prev = this.getStepByIndex(num - 1);
			} else {
				prev = this.getStepByIndex(n - 1);
			}
		}
		
		this.zoomToStep(prev);
	}
	
	PanZoomLayout.prototype.gotoNext = function () {
		this.zoomNextStep();
	}

	PanZoomLayout.prototype.gotoPrevious = function () {
		this.zoomPreviousStep();
	}
	
	PanZoomLayout.prototype.onClickStep = function (step) {
		if (this.currentStep == step) {
			this.zoomToStep(undefined);
		} else {
			this.zoomToStep(step);
		}
		
		return false;
	}
	
	PanZoomLayout.prototype.gotoStep = function (n) {
		var step = this.getStepByIndex(n - 1);
		if (this.currentStep != step) {
			this.zoomToStep(step);
		}
	}
	
	PanZoomLayout.prototype.addClassOnlyTo = function (step, klass) {
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				if (el != step) {
					el.label.removeClass(klass);
				} else {
					el.label.addClass(klass);
				}
			}
		}
	}
	
	PanZoomLayout.prototype.unzoomAllExcept = function (step) {
		this.addClassOnlyTo(step, "zoomed");
		
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				if (el != step) {
					el.unzoom();
				}
			}
		}
		
		this.hideAllLabelsExcept(step);
	}
		
	PanZoomLayout.prototype.zoomToStep = function (step) {
		if (step == undefined) {
			this.zoomOut();
			this.controls.panzoomControls("current", 0);			
			return;
		}
		
		this.showPreamble(false);
		
		this.unzoomAllExcept(step);

		var container = this.image_holder;
		
		this.makeSureElementIsOnScreen(this.image_holder, $("body"), this.controls);
		
		// find scale to have the step's region fill the container
		//  except for the space required by the text_holder
		
		var tw = this.text_holder.width();
		
		var x1 = step.rect.left, y1 = step.rect.top;
		
		var sw = step.rect.width, sh = step.rect.height;
		var cw = container.width() - tw, ch = container.height();
		
		var scalex = cw / sw, scaley = ch / sh;
		
		var scale = Math.min(scalex, scaley);
		
		var scaled_width = sw * scale, scaled_height = sh * scale;
		var centering_x = (cw - scaled_width) * .5;
		var centering_y = (ch - scaled_height) * .5;
		
		var scaler = "scale(" + scale + ")"
		// move top-left to center:
		var xx = (-x1 / scale) + (centering_x / scale) + (tw / scale);
		var yy = (-y1 / scale) + (centering_y / scale);
		var translater = "translate(" + xx + "px," + yy + "px)";
		this.image_wrapper.css( { transform: scaler + " " + translater, "transform-origin": x1 + "px " + y1 + "px" } )
			.addClass("zoomedIn")
			.one("click", $.proxy(this.zoomOut, this));
			
		step.zoom(scale);
		
		this.text_holder.scrollTop(0);
		
		this.text_holder.hide(0).html(step.options.text).delay(500).show(0);
		
		this.currentStep = step;
		
		var n = this.getStepIndex(this.currentStep);
		$(this.controls).panzoomControls("current", n + 1);			
	}
	
	PanZoomLayout.prototype.hideAllLabelsExcept = function (step) {
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				if (el != step) {
					el.label.css("display", "none");
				} else {
					el.label.css("display", "block");
				}
			}
		}
	}
	
	PanZoomLayout.prototype.showAllLabels = function () {
		for (var i = 0; i < this.elements.length; i++) {
			var el = this.elements[i];
			if (el instanceof FixedRegion) {
				el.label.css("display", "block");
			}
		}
	}
	
	PanZoomLayout.prototype.zoomOut = function () {
		this.addClassOnlyTo(null, "zoomed");
		
		if (this.currentStep) {
			this.currentStep.unzoom();
			this.currentStep = undefined;
		}
		
		this.image_wrapper.css( { transform: "", "transform-origin": "0 0" } ).removeClass("zoomedIn");
		
		this.text_holder.css("display", "none");
		
		this.showAllLabels();
		
		this.showPreamble(true);
	}
	
	PanZoomLayout.prototype.showPreamble = function (val) {
//		this.preamble.css("visibility", val ? "visible" : "hidden");
		this.preamble.removeClass("zoomedIn");
		if (!val) this.preamble.addClass("zoomedIn");
	}

	return PanZoomLayout;
});