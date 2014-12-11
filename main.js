requirejs.config({
	baseUrl: "site/js",
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
		"Hammer": "hammer.min",
		"SearchWindow": "searchwindow"
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
			"Hammer": {
				export: "Hammer"
			},
		}
});

require(["LayoutManager", "TOC", "Helpers", "Database", "SearchManager", "jquery", "jqueryui", "SearchWindow"], function (LayoutManager, TOC, Helpers, Database, SearchManager) {
	var params = window.location.search.substring(1);
	if (params == "local") {
		$.getJSON("export.json", null, onData);
	} else {
		$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
	}
	
	var hashID = window.location.hash;
	if (hashID) {
		hashID = hashID.replace("#", "");
	}
	
	var layoutManager = new LayoutManager("#content-holder");

	var debouncedReflow = Helpers.debounce($.proxy(layoutManager.reflow, layoutManager), 250);
	
	var searchManager = new SearchManager();
	
	$("#search-window").SearchWindow( { searchManager: searchManager } );
	
	function onData (data, status, jqXHR) {
		layoutManager.setData(data.layouts, data.contents);
		
		$("#toc-container").TOC( { layoutManager: layoutManager, contents: data.contents, layouts: data.layouts } );

		var idToLoad = hashID;
		if (!idToLoad) idToLoad = Database.getPersistentProperty("lastSpread");
		if (idToLoad) {
			$("#toc-container").TOC("openSpread", { id: idToLoad, replace: true, active: true });
		} else {
			$("#toc-container").TOC("openToFirstSpread");
		}
		
		$("#toc-container").bind("open-spread", onOpenSpread);
		
		var contentsArray = Helpers.objectToArrayWithKey(data.contents);
		searchManager.setData(contentsArray);
		
		layoutManager.dom.bind("next-spread", function (event, id, scrollto) { $("#toc-container").TOC("onAutoLoadNextSpread", id, scrollto); });
		layoutManager.dom.bind("previous-spread", function (event, options) { $("#toc-container").TOC("onAutoLoadPreviousSpread", options.id, options.scrollTo); });
		layoutManager.dom.bind("current-spread", onCurrentSpread);
		layoutManager.dom.bind("open-spread", doOpenSpread);
		
		$("#opinion").bind("rating", function () {
			$("#toc-container").TOC("updateRatingMarkers");
		});
				
		window.onpopstate = onPopState;
		
		if (!Database.getPersistentProperty("seenIntro")) {
			$("#help-system").HelpSystem("beginGuidedTour");
			Database.setPersistentProperty("seenIntro", true);
		}
	}
	
	function doOpenSpread (event, options) {
		$("#toc-container").TOC("openSpread", options);
	}
	
	function onOpenSpread (event, options) {
		if (options.active) {
			var href = window.location.search + "#" + options.id;
			history.pushState( { id: options.id }, "", href );
			
			ga('send', 'pageview', { page: '/' + options.id, title: options.title });
		}
	}
	
	function onCurrentSpread (event, id) {
		$("#toc-container").TOC("onCurrentSpread", id);
		Database.setPersistentProperty("lastSpread", id);		
	}
	
	function onPopState (event) {
		if (event.state && event.state.id)
			$("#toc-container").TOC("openSpread", { id: event.state.id, replace: true });		
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	$(window).resize(debouncedReflow);	
});