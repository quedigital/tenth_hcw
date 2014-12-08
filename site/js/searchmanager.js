define(["lunr", "jquery"], function (lunr) {
	SearchManager = function (pane, inputter) {
		this.pane = pane;
		
		this.initialized = this.initializing = false;
		
		inputter.on("input focus click", $.proxy(this.onChangeSearch, this));
		
		pane.find("#close-button").click($.proxy(this.closePane, this));
		
		var idx = lunr(function () {
			this.field('title', { boost: 10 })
			this.field('body')
		});
		
		this.idx = idx;		
	}
	
	SearchManager.prototype = Object.create({});
	SearchManager.prototype.constructor = SearchManager;

	SearchManager.prototype.setData = function (data) {
		console.log("got search content " + data.length);
		this.data = data;
		
		setTimeout($.proxy(this.initialize, this), 5000);
	}
	
	SearchManager.prototype.initialize = function () {
		if (this.initialized || this.initializing) return;
		
		// add timestamp so .js file is hopefully not cached
		this.searchWorker = new Worker("site/js/searchworker.js?q=" + new Date().getTime().toString());

		var me = this;
		
		this.searchWorker.postMessage( { type: "initialize", content: this.data } );
		
		this.time1 = new Date().getTime();

		this.searchWorker.onmessage = function (event) {
			if (event.data.type == "progress") {
				if (event.data.data == "complete") {
					var time2 = new Date().getTime();
					console.log("indexing = " + (time2 - me.time1));
					me.initialized = true;
					me.initializing = false;
				} else {
					console.log("indexing progress = " + event.data.data);
				}
			} else if (event.data.type == "results") {
				me.showSearchResults(event.data.results);
			}
		};
		
		this.initializing = true;		
	}
	
	SearchManager.prototype.onChangeSearch = function () {
		this.initialize();
		
		if (this.initialized) {
			var val = $("#search-box").val();

			this.searchWorker.postMessage( { type: "query", term: val } );		
		}
	}
	
	SearchManager.prototype.showSearchResults = function (r) {
		var me = this;
		
		var container = this.pane.find(".results");
		container.empty();
		
		$.each(r, function (index, item) {
			var title = me.getSpreadTitle(item.ref);
			
			var row = $("<div>").addClass("result").text(title).data("id", item.ref);
			
			container.append(row);
		});
		
		container.find(".result").click($.proxy(this.onClickResult, this));
		
		this.pane.find(".summary").text(r.length + (r.length == 1 ? " page" : " pages") + " found.");
		
		this.sizeToFit();
		
		this.pane.show("slide", { direction: "left" });
	}

	SearchManager.prototype.getSpreadTitle = function (id) {
		var spread = this.getSpread(id);
		if (spread) return spread.title;
	}
	
	SearchManager.prototype.getSpread = function (id) {
		var spread = $.grep(this.data, function (spread) {
			return spread.id == id;
		});
		if (spread.length)
			return spread[0];
		else
			return undefined;
	}
	
	SearchManager.prototype.onClickResult = function (event) {
		var id = $(event.target).data("id");
		
		$("#toc-container").TOC("openSpread", { id: id, replace: true });
		
		this.pane.hide(0);
	}
	
	SearchManager.prototype.closePane = function () {
		this.pane.hide("slide", { direction: "left" });
	}
	
	SearchManager.prototype.sizeToFit = function () {
		var rehide = false;
		
		// size it while it's "visible" (ie, display is set to block)
		if (!this.pane.is(":visible")) {
			this.pane.css({ visibility: "hidden", display: "block" });
			rehide = true;
		}
		
		var b = parseInt(this.pane.css("bottom"));

		var wh = window.innerHeight;
		var h1 = $("#results-header").outerHeight();
		var h2 = $("#results-summary").outerHeight();
		
		var h = wh - h1 - h2 - b;
		$("#results-scroller").css("max-height", h);
		
		if (rehide) {
			this.pane.css({ visibility: "visible", display: "none" });
		}
	}
	
	return SearchManager;
});
