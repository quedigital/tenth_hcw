define(["GridLayout", "FixedLayout", "Helpers", "tinycolor", "waypoints"], function (GridLayout, FixedLayout, Helpers, tinycolor) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
		this.currentLayout = undefined;
		
		this.showCallback = undefined;
		this.showCallbackOptions = undefined;
		
		this.currentID = undefined;
		
		$("#fixed-layout-controls #previous-button").click($.proxy(this.onClickPreviousStep, this));
		$("#fixed-layout-controls #next-button").click($.proxy(this.onClickNextStep, this));
		
		this.dom.parent().scroll($.proxy(this.onScroll, this));		
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
	
		layoutDOM.append("<h1>" + content.title);
	
		switch (layout.style) {
			case "grid":
				var grid = new GridLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(grid);
				break;
		
			case "fixed":
				var fixed = new FixedLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(fixed);
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
			this.dom.trigger("next-spread", id);
		} else if (scrollTop <= 0 && $(".layout.loading").length == 0) {
			var id = $("#prev-ad").data("prev-id");
			this.dom.trigger("previous-spread", id);
		}
		
		this.identifyCurrentSpread();
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
				me.currentID = layout.attr("id");
				me.dom.trigger("current-spread", layout.attr("id"));
				return false;
			}
		});
	}
	
	return LayoutManager;
});
