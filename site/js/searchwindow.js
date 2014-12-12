define(["Helpers", "jquery.ui.widget"], function (Helpers) {

	var allKeywords = [];
	
	$.widget("que.SearchWindow", {

		// Options to be used as defaults
		options: { type: "text" },

		// Set up widget (e.g. create element, apply theming,
		// bind events, etc.)
		_create: function () {
			// _create will automatically run the first time
			// this widget is called. Put the initial widget
			// set-up code here, then you can access the element
			// on which the widget was called via this.element.
			// The options defined above can be accessed via
			// this.options
			this.element.css("display", "none");
			
			this.element.find("#search-box").on("input focus click", $.proxy(this.onChangeSearch, this));
			this.element.find("#close-button").click($.proxy(this.hide, this));			
			this.element.find("#clear-search").click($.proxy(this.clearSearch, this));
			
			this.element.find("#scroll-button").click($.proxy(this.onScrollResults, this));
		},

		// Destroy an instantiated plugin and clean up modifications
		// that the widget has made to the DOM
		_destroy: function () {
			//this.element.removeStuff();
		},
		
		show: function () {
			switch (this.options.type) {
				case "text":
					this.element.find("#search-box").css("display", "inline");
					this.element.find("#search-icon").css("display", "inline");
					this.element.find("#clear-search").css("display", "inline");
					break;
				case "keyword":
					this.element.find("#search-box").css("display", "none");
					this.element.find("#search-icon").css("display", "none");
					this.element.find("#clear-search").css("display", "none");
					
					break;
			}
			
			var me = this;
			
			this.element.show("drop");
			this.sizeToFit();
			
			// only set the focus if the box is empty (so we don't refresh when coming back to the window)
			var sb = this.element.find("#search-box");
			if (sb.val() == "") {
				this.element.find("#search-box").focus();
			}
			
			$(document).keyup(function (e) {
				if (e.keyCode == 27) { me.hide(); };
			});
			
		},
		
		hide: function () {
			$(document).unbind("keyup");
			
			this.element.hide(500);
		},

		sizeToFit: function () {
			var h = this.element.find(".interior").innerHeight();
			var r = this.element.find(".spread-scroller");
			var max_height = h - r.position().top - 25;
			r.height(max_height);
		},
		
		// Respond to any changes the user makes to the option method
		_setOption: function (key, value) {
			switch (key) {
				case "type":
					if (this.options.type != value) {
						this.clearSearch();
						this.element.find("#label").text(value + " Search");
						
						if (value == "keyword") {
							this.showAllKeywords();
						}
					}
					// fall through:					
				default:
					this.options[key] = value;
					break;
			}
			this._super( "_setOption", key, value );
		},
		
		clearSearch: function () {
			$("#search-box").val("").focus();
			
			this.onChangeSearch();
		},
		
		clearResults: function () {
			this.element.find(".spread-scroller").empty();
			this.element.find("#scroll-button").css("display", "none");
		},
		
		clearKeywords: function () {
			this.element.find(".keyword-scroller").empty();
		},
		
		addResult: function (item) {
			var container = this.element.find(".spread-scroller");
			
			var s = $("<div>", { class: "spread result" } )
				.data("id", item.id)
				.css("backgroundColor", item.color)
				.append($("<span>", { text: item.title } ));
				
			container.append(s);
		},
		
		onChangeSearch: function (event) {
			var term = $("#search-box").val();
			
			if (term) {
				this.options.searchManager.doSearch(term, $.proxy(this.showSearchResults, this));
			} else {
				this.clearResults();
				this.clearKeywords();
				this.setSearchCount(undefined);
			}
		},
		
		setSearchCount: function (count) {
			if (count == undefined)
				$("#search-count").html("&nbsp;");
			else if (count != 1)
				$("#search-count").text(count + " pages found");
			else
				$("#search-count").text("1 page found");			
		},
		
		showSearchResults: function (results) {
			this.clearResults();
	
			var me = this;
			
			this.currentKeywords = [];
			
			$.each(results, function (index, item) {
				var content = me.options.searchManager.getSpread(item.ref);
				if (content) {
					me.addResult( { id: item.ref, title: content.title, color: Helpers.getColorForChapter(content.chapter) } );
					
					if (content.keywords) {
						var myKeywords = content.keywords.split(" ");
						for (var i = 0; i < myKeywords.length; i++) {
							var key = myKeywords[i];
							if (me.currentKeywords.indexOf(key) == -1) {
								me.currentKeywords.push(key);
							}
						}
					}
				}
			});
			
			this.element.find(".spread.result").click($.proxy(this.onClickResult, this));
			
			this.setSearchCount(results.length);
			
			if (this.options.type == "text") {
				this.clearKeywords();
				this.showKeywords(this.currentKeywords);
			}
			
			var container = this.element.find(".spread-scroller")[0];
			var overflows = container.scrollHeight > container.offsetHeight;
			this.element.find("#scroll-button").css("display", overflows ? "block" : "none");
		},
		
		onClickResult: function (event) {
			var r = $(event.currentTarget);
			var id = r.data("id");
			$("#toc-container").TOC("openSpread", { id: id, replace: true, active: true });
			this.hide();
		},
		
		onClickKeyword: function (event) {
			var el = $(event.currentTarget);
			
			el.toggleClass("selected");
			
			var keywordEls = this.element.find(".keyword.result.selected");
			var keywords = $.map(keywordEls, function (val, i) { return $(val).data("keyword"); });
			
			if (this.options.type == "keyword") {
				if (keywords.length > 0) {
					var results = this.options.searchManager.getSpreadsWithAllKeywords(keywords);
					this.showSearchResults(results);
				} else {
					this.clearResults();
					this.setSearchCount(undefined);
				}
			} else if (this.options.type == "text") {
				var searchTerm = this.element.find("#search-box").val();
			
				var results = this.element.find(".spread.result");
			
				if (keywords.length > 0) {			
					var me = this;
			
					$.each(results, function (index, result) {
						var id = $(result).data("id");
						var noGood = false;
						var content = me.options.searchManager.getSpread(id);
						if (content.keywords) {
							var myKeywords = content.keywords.split(" ");
							for (var i = 0; i < keywords.length; i++) {
								if (myKeywords.indexOf(keywords[i]) == -1) {
									noGood = true;
									break;
								}
							}
						} else {
							noGood = true;
						}
						$(result).css("display", noGood ? "none" : "inline-block");
					});
				} else {
					results.css("display", "inline-block");
				}
			}
		},
		
		showAllKeywords: function () {
			if (allKeywords.length == 0) {
				allKeywords = this.options.searchManager.getAllKeywords();
			}

			this.showKeywords(allKeywords);
		},
		
		showKeywords: function (keywords) {
			this.clearKeywords();
			
			var container = this.element.find(".keyword-scroller");
			
			var me = this;
			
			if (keywords) {
				$.each(keywords, function (index, keyword) {
					var d = $("<div>", { class: "keyword result", text: keyword }).data("keyword", keyword);
					d.click($.proxy(me.onClickKeyword, me));
					container.append(d);	
				});
			}
		},
		
		onScrollResults: function () {
			var container = this.element.find(".spread-scroller");
			container.animate({ scrollTop: container.scrollTop() + 225 }, 500);
		}
	});
});