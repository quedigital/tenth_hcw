define(["GridLayout", "FixedLayout", "PanZoomLayout", "TextLayout", "Helpers", "tinycolor", "RatingsSystem"], function (GridLayout, FixedLayout, PanZoomLayout, TextLayout, Helpers, tinycolor) {
	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
		this.currentLayout = undefined;
		
		this.currentID = undefined;
		
		this.headerIsOff = false;
		
		$(window).scroll($.proxy(this.onScroll, this));
		
		$("#opinion").ratingsSystem("initialize");
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.setData = function (layouts, contents) {
		this.layouts = layouts;
		
		this.contents = Helpers.objectToArrayWithKey(contents);
		this.contents.sort(Helpers.sortByChapterAndNumber);		
	}
	
	LayoutManager.prototype.clearSpreads = function () {
		$(".layout").remove();
		$(".banner").remove();
		this.layoutArray = [];
	}
	
	LayoutManager.prototype.showSpreadByID = function (options) {
		this.showCallbackOptions = options;
		
		if (options.replace) {
			this.clearSpreads();
		}
		
		var content = Helpers.findByID(options.id, this.contents);
		var layout = this.layouts[options.id];
		
		var spreadDOM = $("<div>").addClass("layout loading").attr("id", options.id);
		
		if (options.previous) {
			this.dom.prepend(spreadDOM);
		} else {
			this.dom.append(spreadDOM);
		}

		if (layout.background) {
			var back = tinycolor(layout.background);
			if (back.isValid()) {
				var brightness = back.getBrightness();
				if (brightness < 50) {
					spreadDOM.addClass("dark");
				}
			}
		}
	
		var layoutDOM = $("<div>").attr("class", "spread").appendTo(spreadDOM);
	
		switch (layout.style) {
			case "grid":
				layoutDOM.append("<h1>" + content.title);
	
				var grid = new GridLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(grid);
				break;
		
			case "fixed":
				layoutDOM.append("<h1>" + content.title);
	
				var fixed = new FixedLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(fixed);
				break;

			case "panzoom":
				layoutDOM.append("<h1>" + content.title);
	
				var panzoom = new PanZoomLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(panzoom);
				break;
				
			case "text":
				var text = new TextLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(text);
				break;
		}		
	}

	LayoutManager.prototype.reflow = function () {
		console.log("reflow " + this.layoutArray.length);
		
		$.each(this.layoutArray, function (index, element) {
			this.reflow();
		});
	}
	
	LayoutManager.prototype.onLayoutComplete = function (layout) {
		if (this.showCallbackOptions) {
			if (this.showCallbackOptions.replace) {
				layout.activate();
			}
			
			if (this.showCallbackOptions.callback) {
				this.showCallbackOptions.callback(layout);
			}
		}
	}
	
	LayoutManager.prototype.getLayoutByID = function (id) {
		var sel = ".layout[id='" + id + "'] .spread";
		var elem = this.dom.find(sel);
		if (elem) {
			return layoutObject = elem.data("layout");
		}
		return undefined;
	}
	
	LayoutManager.prototype.getCurrentLayout = function () {
		var sel = ".layout[id='" + this.currentID + "'] .spread";
		var elem = this.dom.find(sel);
		var layoutObject = elem.data("layout");
		return layoutObject;
	}
	
	LayoutManager.prototype.onClickPreviousStep = function () {
		var layout = this.getCurrentLayout();
		
		if (layout) {
			layout.gotoPrevious();
		}
	}
	
	LayoutManager.prototype.onClickNextStep = function () {
		var layout = this.getCurrentLayout();
		
		if (layout) {
			layout.gotoNext();
		}
	}
	
	LayoutManager.prototype.onScroll = function (event) {
		var scrollTop = Math.floor($("body").scrollTop());
		var sh = Math.floor($("body").height());
		var h = Math.floor(window.innerHeight);
		
		var amount_left = sh - (h + scrollTop);
		
		// if we run out of scrolling height (and we're not loading something already), load the next spread
		if (amount_left <= 0 && $(".layout.loading").length == 0) {
			this.dom.append($("<div>", { class: "loading-message", text: "Loading Next…" }));
			this.dom.trigger("next-spread", this.currentID);
		} else if (scrollTop <= 0 && $(".layout.loading").length == 0) {
			var banner = $(".banner").first();
			var el = $("<div>", { class: "loading-message", text: "Loading Previous…" }).insertBefore(banner);
			this.dom.trigger("previous-spread", { id: this.currentID, scrollTo: el });
		}
		
		this.identifyCurrentSpread();
		
		this.updateSpreadHeader();		
	}
	
	LayoutManager.prototype.identifyCurrentSpread = function () {
		var t = $("body").scrollTop();
		
		var h = window.innerHeight;
		
		var me = this;
		
		var headers = this.dom.find(".spread");
		$.each(headers, function (index, item) {
			var it = $(item);
			if (it.offset().top + it.height() > t + h * .4) {
				var layout = it.parents(".layout");
				var id = layout.attr("id");
				if (me.currentID != id) {
					if (me.currentID) {
						var oldLayout = me.getLayoutByID(me.currentID);
						if (oldLayout)
							oldLayout.deactivate();
					}
					me.currentID = id;
					me.dom.trigger("current-spread", layout.attr("id"));
					me.onSpreadChange();
					var layoutObj = me.getCurrentLayout();
					tryToActivate(layoutObj);
				}
				return false;
			}
		});
	}
	
	function tryToActivate (layout) {
		if (!layout.isActive) {
			if (layout.isReady) {
				layout.activate();
			} else {
				setTimeout(function () { tryToActivate(layout); }, 100);
			}
		}
	}
	
	LayoutManager.prototype.onSpreadChange = function () {
		var layout = this.getCurrentLayout();
		if (layout) {
			var bottomOf = layout.container;
			$("#opinion").ratingsSystem("update", { bottomOf: bottomOf, title: layout.title, id: layout.id } );
		}
	}
	
	LayoutManager.prototype.updateSpreadHeader = function () {
		var layout = this.getCurrentLayout();
		if (!layout) return;
		
		var h1 = layout.container.find("h1");
		
		var header = $("#current-spread-name");
		
		var isOff = Helpers.isScrolledOff(h1);
		if (isOff != this.headerIsOff) {
			var h = Math.ceil(header.outerHeight());
			var t = isOff ? 0 : -h;
			if (header.top != t) {
				header.css({ top: t, display: "block" });
			}
			this.headerIsOff = isOff;
		}
		
		// only change the header when it's off-screen
		isOff = Helpers.isScrolledOff(header);
		if (isOff) {
			var h1 = header.find("h1");
			if (h1.text() != layout.content.title) {
				h1.text(layout.content.title);
			}
		}
	}
	
	LayoutManager.prototype.getChaptersForPart = function (part) {
		var ch = [];
		
		for (var i = 0; i < this.contents.length; i++) {
			var c = this.contents[i];
			if (c.part == part && c.number == 0) {
				ch.push( { id: c.id, chapter: c.chapter, title: c.title } );
			}
		}
		
		return ch;
	}
	
	return LayoutManager;
});
