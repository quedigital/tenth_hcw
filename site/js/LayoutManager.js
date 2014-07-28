define(["jquery",
		"imagesloaded.pkgd.min",
		"GridLayout",
		"FixedLayout",
		"Step",
		],
									function ($, imagesLoaded, GridLayout, FixedLayout, Step) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		this.layout = undefined;
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	function findData (id, data) {
		/*
		var found = $.grep(data, function (elem) {
			return elem.id == id;
		});
		*/

		var found = $.map(data, function (elem) {
			return (elem.id == id) ? elem : null;
		});
		
		if (found.length) return found[0];
		else return undefined;
	}

	LayoutManager.prototype.process = function (layouts, contents) {
		var scope = this;
		
		$.each(layouts, function (index, layout) {
			var spread = findData(layout.id, contents);
			if (spread) {
				var spreadDOM = $("<div>").addClass("layout").attr("id", layout.id).appendTo(scope.dom);
				
				var layoutDOM = $("<div>").attr("class", "spread").appendTo(spreadDOM);
				
				layoutDOM.append("<h1>" + spread.title);
				
				switch (layout.style) {
					case "grid":
						layoutDOM.addClass("grid");
						
						for (var i = 0; i < spread.cells.length; i++) {
							var cellDOM = $("<div>").addClass("cell");
							layoutDOM.append(cellDOM);
							
							var cell = spread.cells[i];
							switch (cell.type) {
								case "step":
									var step = new Step( { number: cell.number, text: cell.text, image: cell.image } );
									cellDOM.append(step.elem);
									
									break;
								case "image":
									if (cell.image) {
										var img = $("<img>").attr("src", cell.image);
										var div = $("<div>").addClass("image").append(img);
//										div.css("background-image", "url(" + cell.image + ")");
//										div.css("background-size", "contain");
										cellDOM.append(div);
									}
									break;
							}
						}
						
						imagesLoaded(spreadDOM, function () {
							var grid = new GridLayout(layoutDOM, ".cell", layout.hints, spread);
						});
				
						break;
					
					case "fixed":
						layoutDOM.addClass("fixed");
					
						imagesLoaded(spreadDOM, function () {
							var fixed = new FixedLayout(layoutDOM, layout, spread);
						});
				
						break;
				}
			}
		});
		
	}

	return LayoutManager;
});
