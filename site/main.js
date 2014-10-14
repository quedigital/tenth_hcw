requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min",
		"Helpers": "../../common/js/Helpers",
		"waypoints": "waypoints.min",
		"waypoints-sticky": "waypoints-sticky.min",
		"jquery.columnizer": "jquery.columnizer",
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
				deps: ['jquery']
			},
			"waypoints-sticky": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.adaptive-backgrounds": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.columnizer": {
				export: "$",
				deps: ['jquery']
			},
		}
});

require(["inobounce.min", "LayoutManager", "TOC", "Helpers", "jquery", "jqueryui", "jquery.layout-latest"], function (inobounce, LayoutManager, TOC, Helpers, $) {
	var params = window.location.search.substring(1);
	if (params == "local") {
		$.getJSON("export.json", null, onData);
	} else {
		$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
	}

	var pageLayout = $("body").layout({
										applyDefaultStyles: true, resizable: false, slidable: true, closable: true,
										spacing_open: 8, spacing_closed: 8,
										west__size: "220",
										east__initHidden: true,
										south__size: "82",
									});
	
	pageLayout.panes.center.css( { border: "none", padding: 0 } );
	pageLayout.panes.west.css( { border: "none", padding: 0 } );
	
	var westLayout = $("#toc-container").layout( { applyDefaultStyles: true, resizable: false, slidable: false, closable: false,
									spacing_open: 0, spacing_close: 0, north__size: "70", south__size: "70" } );
	westLayout.panes.north.css( { border: "none", padding: 0 } );
	westLayout.panes.center.css( { border: "none", padding: 0 } );
	westLayout.panes.south.css( { border: "none", padding: 0 } );

	var centerLayout = $("#main-content").layout( { applyDefaultStyles: true, resizable: false, slidable: false, closable: false,
									spacing_open: 0, spacing_close: 0, south__size: "70",
									onresize_end: function () {
										throttledReflow();
									}
								} );
	centerLayout.panes.center.css( { border: "none", padding: 0 } );
	centerLayout.panes.south.css( { border: "none", padding: 0 } );

/*
	var bottomLayout = $("#bottom-bar").layout( { applyDefaultStyles: true, resizable: false, slidable: false, closable: false,
									spacing_open: 0, spacing_close: 0, west__size: "220" } );
	bottomLayout.panes.west.css( { border: "none", padding: 0 } );
	bottomLayout.panes.center.css( { border: "none", padding: 0 } );
*/
	
	// recalculate layout after padding changes	
//	pageLayout.resizeAll();
	
	var layoutManager = new LayoutManager("#content-holder");

	var throttledReflow = Helpers.throttle(layoutManager.reflow, 3000, layoutManager);
		
	window.layoutManager = layoutManager;
	
	function onData (data, status, jqXHR) {
		layoutManager.setData(data.layouts, data.contents);
		
		var tocContainer = $("<div>").addClass("toc-container").appendTo($("#toc"));
		var toc = new TOC(layoutManager, tocContainer, data.contents);
		
		toc.openToRandomSpread();
		
		layoutManager.dom.bind("next-spread", $.proxy(toc.onAutoLoadNextSpread, toc));
		layoutManager.dom.bind("previous-spread", $.proxy(toc.onAutoLoadPreviousSpread, toc));
		layoutManager.dom.bind("current-spread", $.proxy(toc.onCurrentSpread, toc));
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	/*
	$(window).resize(function () {
		layoutManager.reflow();
	});
	*/
});