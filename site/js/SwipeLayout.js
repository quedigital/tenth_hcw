define(["Layout",
		"jqueryui",
		"imagesloaded.pkgd.min",
		"Step",
		"SwipeRegion",
		"Sidebar",
		"CellImage",
		"Helpers",
		"debug",
		"tinycolor",
		"jquery.panelSnap"
		], function (Layout, jqueryui, imagesLoaded, Step, SwipeRegion, Sidebar, CellImage, Helpers, debug, tinycolor) {
		
	SwipeLayout = function (container, layout, content, manager) {	
		Layout.call(this, container, manager, content);
		
		this.layout = layout;
		this.content = content;

		this.container.addClass("swipe");
		
		this.widget = $("<div>").addClass("widget");
		this.container.append(this.widget);
		
		var image_holder = $("<div>").addClass("image_holder");
		this.image_holder = image_holder;
		
		var img = $("<img>").addClass("background").attr("src", layout.background);
		this.img = img;

		var text_holder = $("<div>").addClass("text_holder");
		this.text_holder = text_holder;
		
		this.widget.append(image_holder);
		this.widget.append(text_holder);
		
//		$("<div>").addClass("highlight").appendTo(image_holder);		

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
		
		this.elements = {};

		this.buildCells();
		
		imagesLoaded(this.container, $.proxy(this.onImagesLoaded, this));
		
		this.currentStep = undefined;
	}
	
	SwipeLayout.prototype = Object.create(Layout.prototype);
	SwipeLayout.prototype.constructor = SwipeLayout;
	
	SwipeLayout.prototype.repositionTextHolder = function () {
//		this.text_holder.css("display", "block");
//		this.text_holder.position( { my: "right top", at: "left top", of: this.image_holder, collision: "none" } );
	}
	
	SwipeLayout.prototype.sizeToFitContainingPane = function () {
		var pane = $(this.container).parents(".ui-layout-pane");
		var h = pane.height();
		var w = pane.width();
		
		var ch = $("#content-holder");
		var padding = ch.outerWidth() - ch.width();
		
		var desired_h = Math.min(600, h - padding);
		
		this.widget.height(desired_h);
		
		/*
		this.image_holder.height(desired_h);
		
		this.text_holder.css("height", this.image_holder.css("height"));
		*/
	}
	
	SwipeLayout.prototype.onImagesLoaded = function () {
		this.sizeToFitContainingPane();
		
		this.positionCells();
		
		// TODO: capture snapping events and change text holder, etc. accordingly
		var options = { slideSpeed: 500, onSnapFinish: $.proxy(this.onSnapFinish, this) };
		var snapper = this.image_holder.panelSnap(options);
		// kludgy way to get panelSnap instance
		this.panelSnapInstance = snapper.data("plugin_panelSnap");

		this.repositionTextHolder();
		
		this.layoutComplete();	
	}
	
	SwipeLayout.prototype.reflow = function () {
		console.log("reflowing swipe");
		this.sizeToFitContainingPane();
		this.positionCells();		
	}
	
	SwipeLayout.prototype.getImageScale = function (img) {
		if (Helpers.isVectorImage(img)) {
			var currentSize = { width: img.width(), height: img.height() };
			return currentSize.width / 1000;
		} else {
			var currentSize = { width: img.width(), height: img.height() };
			var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
	
			return currentSize.width / originalSize.width;
		}
	}

	SwipeLayout.prototype.buildCells = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		
		cells.sort(Helpers.sortByPriority);
		
		// first, add the full image
		var full_image = new SwipeRegion(undefined, undefined, this.img);
		this.image_holder.append(full_image.elem);
		this.elements["full"] = full_image;
		
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
						var step = new SwipeRegion(cell, hint, this.img);
					
						this.image_holder.append(step.elem);					
					}
										
					step.elem.attr("data-id", cell.id);
					
					this.elements[cell.id] = step;
					
					elem = step.elem;
					
					break;
				case "sidebar":
					hint.shrinkable = (hint.anchor != "before" && hint.anchor != "after");
					
					var sidebar = new Sidebar(cell, hint);

					if (hint.anchor == "before" || hint.anchor == "after") {
						// nothing to do here
					} else {					
						sidebar.elem.css("visibility", "hidden");
												
						this.container.append(sidebar.elem);
					}
					
					this.elements[cell.id] = sidebar;
					
					elem = sidebar.elem;
					
					break;		
				case "image":
					var image = new CellImage(cell, hint);
					
					this.elements[cell.id] = image;
					
					elem = image.elem;
					
					break;
			}
			
			if (hint.anchor == "before" || hint.anchor == "after") {
				elem.addClass("extracted");
				if (hint.anchor == "before") {
					elem.insertBefore(this.widget);
				} else if (hint.anchor == "after") {
					var next = this.image_holder.next();
					if (!next.length) {
						elem.insertAfter(this.widget);
					} else {
						next = this.widget.siblings().last();
						elem.insertAfter(next);
					}
				}
			}
		}		
	}

	SwipeLayout.prototype.positionCells = function () {
		this.clearRects();
		
		var img = this.container.find(".background");
		
//		this.container.width(img.width());
		
//		var ch = $("#content-holder");
//		var padding = ch.outerWidth() - ch.width();
		/*
		var currentSize = { width: img.width(), height: img.height() };
		var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
		*/
		
		// format the first full image element
		this.elements["full"].format();
		
		var cells = $.map(this.content.cells, function (el) { return el });
		
		cells.sort(Helpers.sortByPriority);
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var hint = Helpers.findByID(cell.id, this.layout.hints);

//			var rect = { left: Math.round(hint.bounds[0] * this.scale), top: Math.round(hint.bounds[1] * this.scale), width: Math.round(hint.bounds[2] * this.scale), height: Math.round(hint.bounds[3] * this.scale) };

			if (debug.isDebugMode()) {
				this.drawRect(rect);
			}
			
			switch (cell.type) {
				case "step":
					var step = this.elements[cell.id];
					
					if (step) {
						if (step instanceof Step) {
							step.format(hint);
						} else if (step instanceof SwipeRegion) {
							step.elem.css("visibility", "hidden");
//							step.setRect(rect);
							step.format();
							step.elem.css("visibility", "visible");
						}
					}

					break;
				case "sidebar":
					var sidebar = this.elements[cell.id];
					
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
			
	SwipeLayout.prototype.clearRects = function () {
		this.container.find(".testrect").remove();
	}
	
	SwipeLayout.prototype.drawRect = function (rect) {
		var r = $("<div>").addClass("testrect");
		r.css({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
		
		this.viewport.append(r);
	}
	
	SwipeLayout.prototype.getNumSteps = function () {
		var count = 0;
		
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				count++;
			}
		}
		
		return count;
	}
	
	SwipeLayout.prototype.getStepIndex = function (step) {
		var count = 0;
		
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				if (el == step) return count;
				else count++;
			}
		}
		
		return undefined;
	}

	SwipeLayout.prototype.getStepByIndex = function (index) {
		var count = 0;
		
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				if (count == index) return el;
				else count++;
			}
		}
		
		return undefined;
	}
	
	SwipeLayout.prototype.zoomNextStep = function () {
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

	SwipeLayout.prototype.zoomPreviousStep = function () {
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
	
	SwipeLayout.prototype.gotoNext = function () {
		this.zoomNextStep();
	}

	SwipeLayout.prototype.gotoPrevious = function () {
		this.zoomPreviousStep();
	}
	
	SwipeLayout.prototype.activate = function () {
		Layout.prototype.activate.call(this);
		
		var items = [];
		
		// count all the non-extracted elements
		var count = 0;
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el && el instanceof SwipeRegion) {
				if (el.options && el.options.title) {
					items.push(el.options.title);
				} else if (el.options && el.options.number) {
					items.push(el.options.number);
				}
			}
		}
			
		this.container.trigger("controls", { layout: this, items: items });
	}
	
	SwipeLayout.prototype.onClickStep = function (step) {
		this.zoomToStep(step, false);
		return false;
	}
	
	SwipeLayout.prototype.gotoStep = function (n) {
		var step = this.getStepByIndex(n);
		if (step != this.currentStep)
			this.zoomToStep(step);
	}
	
	SwipeLayout.prototype.addClassOnlyTo = function (step, klass) {
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				if (el != step) {
//					el.label.removeClass(klass);
				} else {
//					el.label.addClass(klass);
				}
			}
		}
	}
	
	SwipeLayout.prototype.unzoomAllExcept = function (step) {
		this.addClassOnlyTo(step, "zoomed");
		
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				if (el != step) {
					el.unzoom();
				}
			}
		}
		
		this.hideAllLabelsExcept(step);
	}
	
	SwipeLayout.prototype.onSnapFinish = function (target) {
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				if (el.elem[0] == target[0]) {
					this.zoomToStep(el, false);
					break;
				}
			}
		}
	}
		
	SwipeLayout.prototype.zoomToStep = function (step, scroll) {
		this.repositionTextHolder();
		
		this.unzoomAllExcept(step);
		
		if (scroll != false)
			this.panelSnapInstance.snapToPanel(step.elem);
		
		step.zoom();
		
		if (step.options) {
			if (scroll == false) {
				this.text_holder.hide(0).removeClass("animated fadeOut").addClass("animated fadeInLeft").html(step.options.text).show(0);
			}
		} else {
//			this.text_holder.removeClass("animated fadeInLeft").addClass("animated fadeOut");
			this.text_holder.removeClass("animated fadeInLeft").html("");
		}
		
		this.currentStep = step;		
	}
	
	SwipeLayout.prototype.hideAllLabelsExcept = function (step) {
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				if (el != step) {
//					el.label.css("display", "none");
				} else {
//					el.label.css("display", "block");
				}
			}
		}
	}
	
	SwipeLayout.prototype.showAllLabels = function () {
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
//				el.label.css("display", "block");
			}
		}
	}
	
	SwipeLayout.prototype.zoomOut = function () {
		this.addClassOnlyTo(null, "zoomed");
		
		if (this.currentStep) {
			this.currentStep.unzoom();
			this.currentStep = undefined;
		}
		
		this.image_wrapper.css( { transform: "", "transform-origin": "0 0" } ).removeClass("zoomedIn");
		
		this.text_holder.css("display", "none");
		
		this.showAllLabels();
	}

	return SwipeLayout;
});