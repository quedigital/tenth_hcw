define(["jquery.ui.widget"], function () {

	var allKeywords = [];
	
	$.widget("que.SearchWindow", {

		// Options to be used as defaults
		options: { showAllKeywords: false },

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
			
			this.element.find("#showAllKeywords").prop("checked", this.options.showAllKeywords);

			var d = $("<div>", { id: "interior" });
			this.element.append(d);
			
			this.element.find("#search-box").on("input focus click", $.proxy(this.onChangeSearch, this));
			this.element.find("#close-button").click($.proxy(this.hide, this));			
			this.element.find("#showAllKeywords").on("change", $.proxy(this.onChangeKeywordSetting, this));
		},

		// Destroy an instantiated plugin and clean up modifications
		// that the widget has made to the DOM
		_destroy: function () {
			//this.element.removeStuff();
		},
		
		show: function () {
			this.element.show("drop");
			this.sizeToFit();
			
			if (allKeywords.length == 0) {
				allKeywords = this.options.searchManager.getAllKeywords();
			}

			if (this.options.showAllKeywords) {
				this.showAllKeywords();
			}

			// only set the focus if the box is empty (so we don't refresh when coming back to the window)
			var sb = this.element.find("#search-box");
			if (sb.val() == "") {
				this.element.find("#search-box").focus();
			}
		},
		
		hide: function () {
			this.element.hide(500);
		},

		sizeToFit: function () {
			var h = this.element.find(".interior").innerHeight();
			var r = this.element.find(".spread-results");
			var max_height = h - r.position().top - 25;
			r.height(max_height);
		},
		
		// Respond to any changes the user makes to the option method
		_setOption: function ( key, value ) {
			switch (key) {
				case "someValue":
					//this.options.someValue = doSomethingWith( value );
					break;
				default:
					//this.options[ key ] = value;
					break;
			}

			// For UI 1.8, _setOption must be manually invoked from
			// the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// For UI 1.9 the _super method can be used instead
			//this._super( "_setOption", key, value );
		},
		
		clearResults: function () {
			var container = this.element.find(".spread-scroller");
			container.empty();			
		},
		
		clearKeywords: function () {
			container = this.element.find(".keyword-scroller");
			container.empty();
		},
		
		addResult: function (item) {
			var container = this.element.find(".spread-scroller");
			
			var s = $("<div>", { class: "spread result" } ).data("id", item.id).append($("<span>", { text: item.title } ));
			container.append(s);
		},
		
		onChangeSearch: function (event) {
			var term = $(event.currentTarget).val();
			
			if (term) {
				this.options.searchManager.doSearch(term, $.proxy(this.showSearchResults, this));
			} else {
				this.clearResults();
				if (!this.options.showAllKeywords) {
					this.clearKeywords();
				}
			}
		},
		
		showSearchResults: function (results) {
			this.clearResults();
	
			var me = this;
			
			this.currentKeywords = [];
			
			$.each(results, function (index, item) {
				var content = me.options.searchManager.getSpread(item.ref);
				if (content) {
					me.addResult( { id: item.ref, title: content.title } );
					
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
			
			if (!this.options.showAllKeywords) {
				this.clearKeywords();
				this.showKeywords(this.currentKeywords);
			}
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
			
			var searchTerm = this.element.find("#search-box").val();
			
			if (this.options.showAllKeywords && searchTerm == "") {
				console.log("filter all spreads for this");
			} else {
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
			this.showKeywords(allKeywords);
		},
		
		showKeywords: function (keywords) {
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
		
		onChangeKeywordSetting: function (event) {
			this.clearKeywords();
			
			var setting = $(event.currentTarget).prop("checked");
			this.options.showAllKeywords = setting;
			
			if (setting) {
				this.showAllKeywords();
			} else {
				this.showKeywords(this.currentKeywords);
			}
		}
	});
});