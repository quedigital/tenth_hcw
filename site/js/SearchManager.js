define(["lunr", "jquery"], function (lunr) {
	SearchManager = function (pane, inputter, manager) {
		this.pane = pane;
		this.manager = manager;
		
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
		this.data = data;
		
		console.log("got data " + data.length);
		var s1 = new Date().getTime();
		
		for (var i = 0; i < data.length; i++) {
			var spread = data[i];
			var text = "";
			// TODO: quick way to put all cells headings and text into one field
			if (spread.cells) {
				for (var each in spread.cells) {
					var cell = spread.cells[each];
					if (cell.heading) text += cell.heading + " ";
					if (cell.text) text += cell.text;
				}
			}
			
			var doc = { title: spread.title, body: text, id: spread.id };
			
			this.idx.add(doc);
		}
		
		var s2 = new Date().getTime();
		console.log(s2 - s1);
	}
	
	SearchManager.prototype.onChangeSearch = function () {
		var val = $("#search-box").val();
		
		this.showSearchResults(val);
	}
	
	SearchManager.prototype.showSearchResults = function (term) {
		var r = this.idx.search(term);
		
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
		
		this.manager.dom.trigger("open-spread", { id: id, replace: true } );
		
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

		var wh = $(window).height()
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
