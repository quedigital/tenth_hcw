define(["lunr", "jquery"], function (lunr) {
	SearchManager = function () {
		this.initialized = this.initializing = false;
		
		var idx = lunr(function () {
			this.field('title', { boost: 10 })
			this.field('body')
		});
		
		this.idx = idx;		
	}
	
	SearchManager.prototype = Object.create({});
	SearchManager.prototype.constructor = SearchManager;

	SearchManager.prototype.setData = function (data) {
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
					me.initialized = true;
					me.initializing = false;
				} else {
				}
			} else if (event.data.type == "results") {
				if (me.resultsCallback) {
					me.resultsCallback(event.data.results, this);
				}
			}
		};
		
		this.initializing = true;		
	}
	
	SearchManager.prototype.doSearch = function (terms, callback) {
		this.resultsCallback = callback;
		
		this.initialize();
		
		if (this.initialized) {
			this.searchWorker.postMessage( { type: "query", term: terms } );
		}
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
	
	SearchManager.prototype.getAllKeywords = function () {
		var keywords = [];
		
		$.each(this.data, function (index, item) {
			if (item.keywords) {
				var keys = item.keywords.split(" ");
				for (var i = 0; i < keys.length; i++) {
					if (keywords.indexOf(keys[i]) == -1) {
						keywords.push(keys[i]);
					}
				}
			}
		});
		
		return keywords;
	}
	
	SearchManager.prototype.getSpreadsWithAllKeywords = function (keywords) {
		var spreads = [];
		
		$.each(this.data, function (index, item) {
			if (item.keywords) {
				var noGood = false;
				var keys = item.keywords.split(" ");
				for (var i = 0; i < keywords.length; i++) {
					if (keys.indexOf(keywords[i]) == -1) {
						noGood = true;
						break;
					}
				}
				if (!noGood) {
					spreads.push( { ref: item.id } );
				}
			}
		});
		
		return spreads;
	}
	
	return SearchManager;
});
