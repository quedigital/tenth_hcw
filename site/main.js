requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min",
		"Database": "database",
		"Helpers": "../../common/js/helpers",
		"TOC": "toc",
		"GridLayout": "gridlayout",
		"FixedLayout": "fixedlayout",
		"TextLayout": "textlayout",
		"PanZoomLayout": "panzoomlayout",
		"RatingsSystem": "ratingssystem",
		"SwipeLayout": "swipelayout",
		"FixedControls": "fixedcontrols",
		"SearchManager": "searchmanager",
		"LayoutManager": "layoutmanager",
		"NewsAlert": "newsalert",
		"NewsItems": "newsitems",
		"HelpSystem": "helpsystem",
		"Layout": "layout",
		"FixedStep": "fixedstep",
		"Sidebar": "sidebar",
		"CellImage": "cellimage",
		"SiteHelpers": "sitehelpers",
		"Step": "step",
		"Video": "video",
		"CalloutLine": "calloutline",
		"FixedRegion": "fixedregion",
		"Glossary": "glossary",
		"CalloutLabel": "calloutlabel",
		"Interactive": "interactive",
		"jquery.autosize": "jquery.autosize.min",
		"jquery.columnizer": "jquery.columnizer",
		"jquery.colorbox": "jquery.colorbox-min",
		"jquery.qtip": "jquery.qtip.min",
		"jquery.json": "jquery.json.min",
		"jquery.scrollTo": "jquery.scrollto.min",
		"jquery.dim-background": "jquery.dimbackground",
		"jquery.textfill": "jquery.textfill.min",
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
			"jquery.textfill": {
				export: "$",
				deps: ['jquery']
			},
			"firebase": {
				export: "Firebase"
			},
		}
});

require(["LayoutManager", "TOC", "Helpers", "jquery", "jqueryui"], function (LayoutManager, TOC, Helpers) {
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
		$("#toc-container").TOC("openToRandomSpread").TOC("setData", data.contents);
		
		layoutManager.dom.bind("next-spread", function (event, id, scrollto) { $("#toc-container").TOC("onAutoLoadNextSpread", id, scrollto); });
		layoutManager.dom.bind("previous-spread", function (event, options) { $("#toc-container").TOC("onAutoLoadPreviousSpread", options.id, options.scrollTo); });
		layoutManager.dom.bind("current-spread", function (event, id) { $("#toc-container").TOC("onCurrentSpread", id); });
		layoutManager.dom.bind("open-spread", function (event, options) { $("#toc-container").TOC("openSpread", options); });
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	$(window).resize(debouncedReflow);	
});