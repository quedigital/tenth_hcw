requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min",
		"Helpers": "../../common/js/Helpers",
		"waypoints": "waypoints.min",
		"waypoints-sticky": "waypoints-sticky.min",
		"jquery.columnizer": "jquery.columnizer",
		"jquery.colorbox": "jquery.colorbox-min",
		"jquery.qtip": "jquery.qtip.min",
		"lunr": "lunr.min",
	},
	
	shim: {
			"jquery": {
				export: "$",
			},
			"jqueryui": {
				export: "$" ,
				deps: ['jquery']
			},
			"jquery.layout": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.layout.slideOffscreen": {
				export: "$",
				deps: ['jquery.layout']
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
			"jquery.qtip": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.colorbox": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.panelSnap": {
				export: "$",
				deps: ['jquery']
			},
		}
});

require(["inobounce.min", "LayoutManager", "TOC", "Helpers", "jquery", "jqueryui"], function (inobounce, LayoutManager, TOC, Helpers, $) {
	var params = window.location.search.substring(1);
	if (params == "local") {
		$.getJSON("export.json", null, onData);
	} else {
		$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
	}
	
	var layoutManager = new LayoutManager("#content-holder");
	var toc;

	var debouncedReflow = Helpers.debounce($.proxy(layoutManager.reflow, layoutManager), 250);
		
	window.layoutManager = layoutManager;
	
	function onData (data, status, jqXHR) {
		layoutManager.setData(data.layouts, data.contents);
		
		var tocContainer = $("<div>").addClass("toc-container").appendTo($("#toc"));
		toc = new TOC($("#toc-container"), layoutManager, tocContainer, data.contents, data.layouts);
		
		toc.openToRandomSpread();
		
		layoutManager.dom.bind("next-spread", $.proxy(toc.onAutoLoadNextSpread, toc));
		layoutManager.dom.bind("previous-spread", $.proxy(toc.onAutoLoadPreviousSpread, toc));
		layoutManager.dom.bind("current-spread", $.proxy(toc.onCurrentSpread, toc));
		layoutManager.dom.bind("open-spread", function (event, options) { toc.openSpread(options); });
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	$(window).resize(debouncedReflow);	
});