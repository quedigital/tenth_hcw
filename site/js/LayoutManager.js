define(["GridLayout", "FixedLayout", "Helpers", "TOC"], function (GridLayout, FixedLayout, Helpers, TOC) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.setData = function (layouts, contents) {
		this.layouts = layouts;
		
		this.contents = Helpers.objectToArray(contents);

		this.contents.sort(Helpers.sortByChapterAndNumber);
		
		var tocContainer = $("<div>").addClass("toc-container").appendTo(this.dom);
		
		var toc = new TOC(this, tocContainer, this.contents);
	}
	
	LayoutManager.prototype.clearSpreads = function () {
		$(".layout").remove();
		this.layoutArray = [];
	}
	
	LayoutManager.prototype.showSpreadByID = function (id) {
		this.clearSpreads();
		
		var content = Helpers.findByID(id, this.contents);
		var layout = Helpers.findByID(id, this.layouts);
		
		var spreadDOM = $("<div>").addClass("layout").attr("id", layout.id).appendTo(this.dom);

		if (layout.background && layout.background == "#000000") {
			spreadDOM.addClass("dark");
		}
	
		var layoutDOM = $("<div>").attr("class", "spread").appendTo(spreadDOM);
	
		layoutDOM.append("<h1>" + content.title);
	
		switch (layout.style) {
			case "grid":
				var grid = new GridLayout(layoutDOM, layout, content);
				this.layoutArray.push(grid);
				break;
		
			case "fixed":
				var fixed = new FixedLayout(layoutDOM, layout, content);
				this.layoutArray.push(fixed);
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
			if (layout && layout.publish) {
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
		console.log("reflow");
		
		$.each(this.layoutArray, function (index, element) {
			this.reflow();
		});
	}

	return LayoutManager;
});
