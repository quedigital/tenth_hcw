define(["GridLayout", "FixedLayout", "Helpers"], function (GridLayout, FixedLayout, Helpers) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		
		this.layoutArray = [];
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.process = function (layouts, contents) {
		var me = this;
		
		this.layouts = layouts;
		this.contents = Helpers.objectToArray(contents);

		this.contents.sort(Helpers.sortByChapterAndNumber);
		
		$.each(this.contents, function (index, content) {
			var layout = Helpers.findByID(content.id, me.layouts);
			if (layout.publish) {
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
