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
		"SearchWindow": "searchwindow",
		"hcwData": "../hcwdata",
		"fastclick": "../../common/js/fastclick"
	},
	
	shim: {
			"jquery": {
				export: "$"
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
			}
		}
});

require(["LayoutManager", "TOC", "Helpers", "Database", "SearchManager", "jquery", "jqueryui", "SearchWindow", "jquery.qtip"], function (LayoutManager, TOC, Helpers, Database, SearchManager) {
	var params = window.location.search.substring(1);
	if (params == "remote") {
		$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
	} else {
		require(["hcwData"], function (hcwData) {
			onData(hcwData);
		});
	}
	
	var hashID = window.location.hash;
	if (hashID) {
		hashID = hashID.replace("#", "");
	}
	
	var pagesViewed = 0;
	
	var layoutManager = new LayoutManager("#content-holder");

	var debouncedReflow = Helpers.debounce($.proxy(layoutManager.reflow, layoutManager), 250);
	
	var searchManager = new SearchManager();
	
	$("#search-window").SearchWindow( { searchManager: searchManager } );

	$(window).on("trackedevent", onTrackedEvent);
	
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
		
		$(window).bind("rating", function () {
			$("#toc-container").TOC("updateRatingMarkers");
		});
				
		window.onpopstate = onPopState;
		
		if (!Database.getPersistentProperty("seenIntro")) {
			$("#help-system").HelpSystem("beginGuidedTour");
			Database.setPersistentProperty("seenIntro", true);
		}
		
		var n = Database.getPersistentProperty("visitsSinceSurvey");
		if (!n) n = 0;
		else n = parseInt(n);
		Database.setPersistentProperty("visitsSinceSurvey", n + 1);
		
		window.getAllGlossaryTerms = $.proxy(Helpers.getAllGlossaryTerms, this, data.contents);
	}
	
	function doOpenSpread (event, options) {
		$("#toc-container").TOC("openSpread", options);
	}
	
	function onOpenSpread (event, options) {
		pagesViewed++;
		
		if (options.active) {
			if (!Helpers.onHost("hcw10.firebaseapp.com")) {
				var href = window.location.search + "#" + options.id;
				history.pushState({id: options.id}, "", href);

				ga('send', 'pageview', {page: '/' + options.id, title: options.title});
			}
		}
		
		var survey = Database.getPersistentProperty("surveyed");
		
		if (survey != "true" && survey != "decline") {
			var n = Database.getPersistentProperty("visitsSinceSurvey");
			
			// show survey after 15 pages (first visit) or 5 pages (second visit)
			if (pagesViewed >= 15 || (n > 1 && pagesViewed >= 5) ) {
				showSurveyPrompt();
			}
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

	function onTrackedEvent (event, data) {
		ga('send', 'event', data.category, data.action, data.label);
	}
	
	window.showSurveyPrompt = showSurveyPrompt;
	
	function launchSurvey () {
		$(window).trigger("trackedevent", { category: "prompt", action: "accept", label: "survey" });
		
		Database.setPersistentProperty("surveyed", true);
		
		window.open("http://goo.gl/forms/aej4m6i10V");
	}
	
	function delaySurvey () {
		$(window).trigger("trackedevent", { category: "prompt", action: "delay", label: "survey" });
		
		pagesViewed = 0;
		Database.setPersistentProperty("visitsSinceSurvey", 0);
	}
	
	function declineSurvey () {
		$(window).trigger("trackedevent", { category: "prompt", action: "decline", label: "survey" });
		
		Database.setPersistentProperty("surveyed", "decline");
	}
	
	function showSurveyPrompt () {
		$(window).trigger("trackedevent", { category: "survey", action: "show", label: "survey" });
		
		var content = $("<p>", { text: "Would you like to help improve our product by taking a short survey?" });
		var area = $("<div>", { class: "button-area" }).appendTo(content);
		var ok = $("<button>", { class: "basic green", text: "Sure!" }).click(launchSurvey);
		var later = $("<button>", { class: "basic yellow", text: "Later" }).click(delaySurvey);
		var no = $("<button>", { class: "basic red", text: "No thanks" }).click(declineSurvey);
		area.append(ok).append(later).append(no);
		
	    $('<div />').qtip({
	        content: {
	            text: content,
	            title: "Take a Survey",
	        },
	        position: {
	            my: 'center', at: 'center',
	            target: $(window)
	        },
	        show: {
	            ready: true,
	            modal: {
	                on: true,
	                blur: true,
	            }
	        },
	        hide: false,
	        style: 'survey-prompt qtip-rounded qtip-blue',
	        events: {
	            render: function(event, api) {
	                $('button', api.elements.content).click(function(e) {
	                    api.hide(e);
	                });
	            },
	            hide: function(event, api) { api.destroy(); }
	        }
	    });
	}
	
	// reflow is currently triggered only when a video is loaded & ready
	$(window).on("reflow", function () {
		layoutManager.reflow();
	});
	
	$(window).resize(debouncedReflow);	
});