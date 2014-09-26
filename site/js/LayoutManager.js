define(["GridLayout", "FixedLayout", "Helpers", "tinycolor", "waypoints-sticky", ], function (GridLayout, FixedLayout, Helpers, tinycolor) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
		this.currentLayout = undefined;
		
		this.showCallback = undefined;
		
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
		this.layoutArray = [];
	}
	
	LayoutManager.prototype.showSpreadByID = function (id, replace, callback) {
		this.currentID = id;
		
		this.showCallback = callback;
		
		if (replace) {
			this.clearSpreads();
		}
		
		var content = Helpers.findByID(id, this.contents);
		var layout = this.layouts[id];
		
		var spreadDOM = $("<div>").addClass("layout").attr("id", layout.id).appendTo(this.dom);

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
				this.currentLayout = grid;
				break;
		
			case "fixed":
				var fixed = new FixedLayout(layoutDOM, layout, content, this);
				this.layoutArray.push(fixed);
				this.currentLayout = fixed;
				break;
		}
		
		var bottom = this.dom.parent().height() - $("#next-ad").height();
		$("#next-ad").waypoint("unsticky");
		$("#next-ad").waypoint('sticky', { direction: "down", context: this.dom.parent(), offset: bottom } );		
	}
	
	LayoutManager.prototype.process = function () {
		var me = this;
		
		$.each(this.contents, function (index, content) {
			var layout = Helpers.findByID(content.id, me.layouts);
			if (!layout) {
				console.log("not found: " + content.id);
			}
			console.log(content.id + " publish = " + layout.publish);
			if (layout && layout.publish == true) {
				if (content) {
					var spreadDOM = $("<div>").addClass("layout").attr("id", layout.id).appendTo(me.dom);
			
					if (layout.background && layout.background == "#000000") {
						spreadDOM.addClass("dark");
					}
				
					var layoutDOM = $("<div>").attr("class", "spread").appendTo(spreadDOM);
				
					layoutDOM.append("<h1>" + content.title);
				
					switch (layout.style) {
						case "grid":
							var grid = new GridLayout(layoutDOM, layout, content);
							me.layoutArray.push(grid);
							break;
					
						case "fixed":
							var fixed = new FixedLayout(layoutDOM, layout, content);
							me.layoutArray.push(fixed);
							break;
					}
				}
			}
		});
	}
	
	LayoutManager.prototype.reflow = function () {
		console.log("reflow " + this.layoutArray.length);
		
		$.each(this.layoutArray, function (index, element) {
			this.reflow();
		});
	}
	
	LayoutManager.prototype.onLayoutComplete = function () {
		if (this.showCallback) {
			this.showCallback();
		}
	}
	
	LayoutManager.prototype.getCurrentLayout = function () {
		return this.currentLayout;
	}
	
	LayoutManager.prototype.onClickPreviousStep = function () {
		var layout = this.getCurrentLayout();
		
		if (layout) {
			layout.gotoPrevious();
		}
	}
	
	LayoutManager.prototype.onClickNextStep = function () {
		// TODO: this needs to be the layout currently (or mostly) in the viewport
		var layout = this.getCurrentLayout();
		
		if (layout) {
			layout.gotoNext();
		}
	}
	
	LayoutManager.prototype.onScroll = function (event) {
		var amount_left = this.dom.offset().top + this.dom.outerHeight();
		
		var half = this.dom.parent().height() * .5;
		
		var percent = (amount_left - half) / half;
		var countdown = Math.ceil((percent * 10));
		
		if (countdown <= 10) {
			$("#next-ad").text("Loading: Another Spread... in " + countdown).css("background", "rgba(255, 255, 0, " + percent + ")");
		}
		
		if (amount_left <= half) {
			this.dom.trigger("next-spread");
		}
		/*
		var DEADZONE = 800;
		
		var scrollTop = Math.floor($(event.target).scrollTop());
		var sh = Math.floor($(event.target)[0].scrollHeight);
		var h = Math.floor($(event.target).height());
		
		// TODO: fix the "#next-ad" to the bottom of the scrolling area for a bit and then load the next spread
		
		if (h + scrollTop >= sh - DEADZONE) {
			console.log("scroll");
//			$("#content").scrollTop(1684);
			
			$("#content-holder").css( { position: "fixed", width: 1666, top: -500, overflow: "hidden" } );
			$("#next-ad").css( { position: "fixed", bottom: 70, left: 0, width: "100%" } );
			$("#content").css({ height: 3000, overflow: "scroll" });
//			this.dom.trigger("next-spread");
		}
		*/
	}
	
	return LayoutManager;
});
