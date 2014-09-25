define(["GridLayout", "FixedLayout", "Helpers", "tinycolor"], function (GridLayout, FixedLayout, Helpers, tinycolor) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
		this.currentLayout = undefined;
		
		this.showCallback = undefined;
		
		$("#fixed-layout-controls #previous-button").click($.proxy(this.onClickPrevious, this));
		$("#fixed-layout-controls #next-button").click($.proxy(this.onClickNext, this));		
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.setData = function (layouts, contents) {
		this.layouts = layouts;
		
		this.contents = Helpers.objectToArrayWithKey(contents);
	}
	
	LayoutManager.prototype.clearSpreads = function () {
		$(".layout").remove();
		this.layoutArray = [];
	}
	
	LayoutManager.prototype.showSpreadByID = function (id, callback) {
		this.showCallback = callback;
		
		this.clearSpreads();
		
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
	
	LayoutManager.prototype.onClickPrevious = function () {
		var layout = this.getCurrentLayout();
		
		if (layout) {
			layout.gotoPrevious();
		}
	}
	
	LayoutManager.prototype.onClickNext = function () {
		// TODO: this needs to be the layout currently (or mostly) in the viewport
		var layout = this.getCurrentLayout();
		
		if (layout) {
			layout.gotoNext();
		}
	}

	return LayoutManager;
});
