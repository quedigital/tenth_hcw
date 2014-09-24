requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min",
		"Helpers": "../../common/js/Helpers",
		"waypoints": "waypoints.min"
	},
	
	shim: {
			"jquery": {
				export: "$",
			},
			"jqueryui": {
				export: "$" ,
				deps: ['jquery']
			},
			"jquery.layout-latest": {
				export: "$",
				deps: ['jquery']
			},
			"waypoints": {
				export: "$",
			}
		}
});

require(["inobounce.min", "LayoutManager", "TOC", "jquery", "jqueryui", "jquery.layout-latest"], function (inobounce, LayoutManager, TOC, $) {
	var params = window.location.search.substring(1);
	if (params == "local") {
		$.getJSON("export.json", null, onData);
	} else {
		$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
	}

	var pageLayout = $("body").layout({
										applyDefaultStyles: true, resizable: false, slidable: false, closable: false,
										spacing_open: 0, spacing_closed: 0,
										west__size: "220",
										east__initHidden: true,
										south__size: "82",
									});
	
	pageLayout.panes.center.css( { border: "none", padding: 0 } );
	pageLayout.panes.west.css( { border: "none", padding: 0 } );
	pageLayout.panes.south.css( { border: "none", padding: 0, overflow: "hidden" } );
	
	var westLayout = $("#toc-container").layout( { applyDefaultStyles: true, resizable: false, slidable: false, closable: false,
									spacing_open: 0, spacing_close: 0, north__size: "70" } );
	westLayout.panes.north.css( { border: "none", padding: 0 } );
	westLayout.panes.center.css( { border: "none", padding: 0 } );

	var bottomLayout = $("#bottom-bar").layout( { applyDefaultStyles: true, resizable: false, slidable: false, closable: false,
									spacing_open: 0, spacing_close: 0, west__size: "220" } );
	bottomLayout.panes.west.css( { border: "none", padding: 0 } );
	bottomLayout.panes.center.css( { border: "none", padding: 0 } );
	
	// recalculate layout after padding changes	
//	pageLayout.resizeAll();
	
	var layoutManager = new LayoutManager("#content-holder");
	
	function onData (data, status, jqXHR) {
		layoutManager.setData(data.layouts, data.contents);
		
		var tocContainer = $("<div>").addClass("toc-container").appendTo($("#toc"));
		var toc = new TOC(layoutManager, tocContainer, data.contents);
		
		toc.openToRandomSpread();
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	$(window).resize(function () {
		layoutManager.reflow();
	});
});