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
		"jquery.panelSnap",
		"FixedControls"
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

		this.controls = $("<div>").addClass("controls");
		this.container.append(this.controls);
				
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
		
//		this.currentStep = this.getStepByIndex(0);
		this.zoomToStep(this.getStepByIndex(0), false);
	}
	
	SwipeLayout.prototype = Object.create(Layout.prototype);
	SwipeLayout.prototype.constructor = SwipeLayout;
	
	SwipeLayout.prototype.sizeToFitContainingPane = function () {
		var pane = $(this.container).parents(".ui-layout-pane");
		var h = pane.height();
		var w = pane.width();
		
		var ch = $("#content-holder");
		var padding = ch.outerWidth() - ch.width();
		
		var desired_h = Math.min(600, h - padding);
		var desired_w = Math.min(1080, w - padding);
		
		this.widget.width(desired_w);
		this.widget.height(desired_h);
	}
	
	SwipeLayout.prototype.onImagesLoaded = function () {
		this.sizeToFitContainingPane();
		
		this.positionCells();
		
		var options = { slideSpeed: 500, onSnapStart: $.proxy(this.makeSureWidgetIsOnScreen, this), onSnapFinish: $.proxy(this.onSnapFinish, this) };
		var snapper = this.image_holder.panelSnap(options);
		// kludgy way to get panelSnap instance
		this.panelSnapInstance = snapper.data("plugin_panelSnap");

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
		var full_image = new SwipeRegion(this.content, this.layout, undefined, undefined, this.img);
		this.image_holder.append(full_image.elem);
		this.elements["0"] = full_image;
		
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
						var step = new SwipeRegion(this.content, this.layout, cell, hint, this.img);
					
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
		
		var items = this.getItemNames();
		$(this.controls).swipeControls( { 	items: items,
											selectFirstItem: true,
											onClickStep: $.proxy(this.gotoStep, this),
											onClickPrevious: $.proxy(this.gotoPrevious, this),
											onClickNext: $.proxy(this.gotoNext, this),
										 } );
	}

	SwipeLayout.prototype.positionCells = function () {
		this.clearRects();
		
//		var img = this.container.find(".background");
		
//		this.container.width(img.width());
		
//		var ch = $("#content-holder");
//		var padding = ch.outerWidth() - ch.width();
		/*
		var currentSize = { width: img.width(), height: img.height() };
		var originalSize = { width: img[0].naturalWidth, height: img[0].naturalHeight };
		*/
		
		// format the first full image element
		this.elements["0"].format();
		
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
	
	SwipeLayout.prototype.getItemNames = function () {
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
		
		return items;
	}
	
	SwipeLayout.prototype.activate = function () {
		Layout.prototype.activate.call(this);
		
//		var items = this.getItemNames();
		
//		this.container.trigger("controls", { layout: this, items: items });

		this.container.trigger("controls", { layout: this, items: [] });
	}
	
	SwipeLayout.prototype.gotoStep = function (n) {
		var step = this.getStepByIndex(n);
		if (step != this.currentStep)
			this.zoomToStep(step);
	}
	
	SwipeLayout.prototype.onSnapFinish = function (target) {
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {				
				if (el.elem[0] == target[0]) {
					this.zoomToStep(el, false);
					el.showLabel();
				} else {
					el.hideLabel();
				}
			}
		}
	}
	
	SwipeLayout.prototype.makeSureWidgetIsOnScreen = function () {
		var wt = this.widget.offset().top;
		
		if (wt < 0) {
			var cst = $("#content").scrollTop();
			$("#content").animate({ scrollTop: cst + wt }, 500);
		} else {
			var h = this.widget.height() + this.controls.height();
			var ch = $("#content").height();
			var off = wt + h - ch;
			if (off > 0) {
				var cst = $("#content").scrollTop();
				$("#content").animate({ scrollTop: cst + off }, 500);
			}
		}
	}
		
	SwipeLayout.prototype.zoomToStep = function (step, scroll) {
		
		if (scroll != false) {
			this.panelSnapInstance.snapToPanel(step.elem);
			this.makeSureWidgetIsOnScreen();
		}
		
		if (step.options) {
			if (scroll == false) {
				var label = step.getLabelAsDOM();
				var text = $("<p>").html(step.options.text);
				this.text_holder.hide(0).empty().removeClass("animated fadeOut").addClass("animated fadeInLeft").append(label).append(text).show(0);
			}
		} else {
			if (scroll == false) {
				this.text_holder.hide(0).removeClass("animated fadeInLeft").addClass("animated fadeInLeft");
				// show instructions?
				var labels = this.getAllLabels();
				labels.addClass("index");
				this.text_holder.empty().append("<h1>Slideshow:</h1>").append(labels).show(0);
			}
		}
	
		this.currentStep = step;
	
		var n = this.getStepIndex(this.currentStep);
		$(this.controls).swipeControls("current", n);
	}

	SwipeLayout.prototype.getAllLabels = function () {
		var elements = $("<div>");
		
		for (var each in this.elements) {
			var el = this.elements[each];
			if (el instanceof SwipeRegion) {
				var dom = el.getLabelAsDOM();
				if (dom) {
					dom.click($.proxy(this.zoomToStep, this, el));
					elements.append(dom);
				}
			}
		}
		
		return elements;
	}
	
	SwipeLayout.prototype.zoomOut = function () {
		if (this.currentStep) {
			this.currentStep = undefined;
		}
		
		this.image_wrapper.css( { transform: "", "transform-origin": "0 0" } ).removeClass("zoomedIn");
		
		this.text_holder.css("display", "none");
	}

	return SwipeLayout;
});