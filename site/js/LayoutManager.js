define(["jquery",
		"GridLayout",
		"FixedLayout",
		"Utils"
		],
									function ($, GridLayout, FixedLayout, Utils) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		this.layout = undefined;
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.process = function (layouts, contents) {
		var scope = this;
		
		$.each(layouts, function (index, layout) {
			var content = Utils.findByID(layout.id, contents);
			if (content) {
				var spreadDOM = $("<div>").addClass("layout").attr("id", layout.id).appendTo(scope.dom);
				
				var layoutDOM = $("<div>").attr("class", "spread").appendTo(spreadDOM);
				
				layoutDOM.append("<h1>" + content.title);
				
				switch (layout.style) {
					case "grid":
						var grid = new GridLayout(layoutDOM, layout, content);
				
						break;
					
					case "fixed":
						var fixed = new FixedLayout(layoutDOM, layout, content);
				
						break;
				}
			}
		});
		
	}

	return LayoutManager;
});
