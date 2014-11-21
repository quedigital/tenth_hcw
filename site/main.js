requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min",
		"Helpers": "../../common/js/Helpers",
		"jquery.autosize": "jquery.autosize.min",
		"jquery.columnizer": "jquery.columnizer",
		"jquery.colorbox": "jquery.colorbox-min",
		"jquery.qtip": "jquery.qtip.min",
		"jquery.json": "jquery.json.min",
		"jquery.scrollTo": "jquery.scrollTo.min",
		"jquery.dim-background": "jquery.dimBackground",
		"lunr": "lunr.min",
		"firebase": "https://cdn.firebase.com/js/client/2.0.4/firebase",		
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
			"jquery.autosize": {
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
			"jquery.json": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.scrollTo": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.dim-background": {
				export: "$",
				deps: ['jquery']
			},
			"firebase": {
				export: "Firebase"
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
		
		$("#toc-container").TOC( { layoutManager: layoutManager, contents: data.contents, layouts: data.layouts } );
		$("#toc-container").TOC("openToRandomSpread");
		
		layoutManager.dom.bind("next-spread", function (event, id) { $("#toc-container").TOC("onAutoLoadNextSpread", id); });
		layoutManager.dom.bind("previous-spread", function (event, id) { $("#toc-container").TOC("onAutoLoadPreviousSpread", id); });
		layoutManager.dom.bind("current-spread", function (event, id) { $("#toc-container").TOC("onCurrentSpread", id); });
		layoutManager.dom.bind("open-spread", function (event, options) { $("#toc-container").TOC("openSpread", options); });
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	$(window).resize(debouncedReflow);	
});