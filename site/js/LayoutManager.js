define(["jquery",
		"imagesloaded.pkgd.min",
		"GridLayout",
		"FixedLayout",
		"Step",
		"Callout",
		"Utils"
		],
									function ($, imagesLoaded, GridLayout, FixedLayout, Step, Callout, Utils) {

	LayoutManager = function (selector) {
		this.dom = $(selector);
		this.layout = undefined;
	}
	
	LayoutManager.prototype = Object.create({});
	LayoutManager.prototype.constructor = LayoutManager;
	
	LayoutManager.prototype.process = function (layouts, contents) {
		var scope = this;
		
		$.each(layouts, function (index, layout) {
			var spread = Utils.findByID(layout.id, contents);
			if (spread) {
				var spreadDOM = $("<div>").addClass("layout").attr("id", layout.id).appendTo(scope.dom);
				
				var layoutDOM = $("<div>").attr("class", "spread").appendTo(spreadDOM);
				
				layoutDOM.append("<h1>" + spread.title);
				
				switch (layout.style) {
					case "grid":
						layoutDOM.addClass("grid");
						
						var cells = $.map(spread.cells, function (el) { return el });
						for (var i = 0; i < cells.length; i++) {
							var cell = cells[i];
							var cellDOM = $("<div>").addClass("cell");
							layoutDOM.append(cellDOM);
							
							cellDOM.attr("data-id", cell.id);
							
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
								case "callout":
									var callout = new Callout( { title: cell.title, text: cell.text } );
									cellDOM.append(callout.elem);
									
									break;
							}
						}
						
						imagesLoaded(spreadDOM, function () {
							var hints = $.map(layout.hints, function (el) { return el });
							var grid = new GridLayout(layoutDOM, layoutDOM.find(".cell"), hints, spread);
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
