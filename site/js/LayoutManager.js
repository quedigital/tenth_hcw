define(["GridLayout", "FixedLayout", "PanZoomLayout", "SwipeLayout", "TextLayout", "Helpers", "tinycolor", "SearchManager", "waypoints", "FixedControls"], function (GridLayout, FixedLayout, PanZoomLayout, SwipeLayout, TextLayout, Helpers, tinycolor, SearchManager) {
	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
		this.currentLayout = undefined;
		
		this.showCallback = undefined;
		this.showCallbackOptions = undefined;
		
		this.currentID = undefined;
		
		this.headerIsOff = false;
		
		$("#fixed-layout-controls #previous-button").click($.proxy(this.onClickPreviousStep, this));
		$("#fixed-layout-controls #next-button").click($.proxy(this.onClickNextStep, this));
		this.dom.on("controls", $.proxy(this.onReceivedControls, this));
		
		this.dom.parent().scroll($.proxy(this.onScroll, this));
		
		this.searchManager = new SearchManager($("#results-pane"), $("#search-box"), this);
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.setData = function (layouts, contents) {
		this.layouts = layouts;
		
		this.contents = Helpers.objectToArrayWithKey(contents);
		this.contents.sort(Helpers.sortByChapterAndNumber);
		
		this.searchManager.setData(this.contents);
	}
	
	LayoutManager.prototype.clearSpreads = function () {
		$(".layout").remove();
		$.waypoints("destroy");
		this.layoutArray = [];
	}
	
	LayoutManager.prototype.showSpreadByID = function (options, callback) {
		this.showCallback = callback;
		this.showCallbackOptions = options;
		
		if (options.replace) {
			this.clearSpreads();
		}
		
		var content = Helpers.findByID(options.id, this.contents);
		var layout = this.layouts[options.id];
		
		var spreadDOM = $("<div>").addClass("layout loading").attr("id", options.id);
		this.dom.append(spreadDOM);

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
				
			case "swipe":
				layoutDOM.append("<h1>" + content.title);
	
				var swipe = new SwipeLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(swipe);
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
		if (this.showCallback) {
			this.showCallback(layout, this.showCallbackOptions);
		}
		
		$.waypoints("refresh");
		
		if (this.showCallbackOptions.replace) {
			layout.activate();
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
		var scrollTop = Math.floor($(event.target).scrollTop());
		var sh = Math.floor($(event.target)[0].scrollHeight);
		var h = Math.floor($(event.target).height());
		
		var amount_left = sh - (h + scrollTop);
		
		// if we run out of scrolling height (and we're not loading something already), load the next spread
		if (amount_left <= 0 && $(".layout.loading").length == 0) {
			var id = $("#next-ad").data("next-id");
//			this.dom.trigger("next-spread", id);
		} else if (scrollTop <= 0 && $(".layout.loading").length == 0) {
			var id = $("#prev-ad").data("prev-id");
//			this.dom.trigger("previous-spread", id);
		}
		
		this.identifyCurrentSpread();
		
		this.updateSpreadHeader();
	}
	
	LayoutManager.prototype.identifyCurrentSpread = function () {
		var t = $("#content").scrollTop();
		
		var h = this.dom.parent().height();
		
		var me = this;
		
		var headers = this.dom.find(".spread");
		$.each(headers, function (index, item) {
			var it = $(item);
			if (it.offset().top + it.height() > h * .4) {
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
	
	LayoutManager.prototype.onReceivedControls = function (event, args) {
		$("#fixed-layout-controls").fixedControls(this, args);
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
