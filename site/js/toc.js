define(["Helpers", "tinycolor", "SearchManager", "jquery.ui.widget", "NewsItems", "NewsAlert", "HelpSystem", "banner"], function (Helpers, tinycolor, SearchManager) {

    $.widget("que.TOC", {

        options: {
        	leaveOpen: false,
        },

        _create: function () {			
            this.tocInterior = this.element.find("#toc");
            
			this.layoutManager = this.options.layoutManager;
		
			this.contents = Helpers.objectToArrayWithKey(this.options.contents);
			this.layouts = this.options.layouts;
			this.contents.sort(Helpers.sortByChapterAndNumber);
		
			this.lastID = undefined;
		
			var me = this;
		
			var toc = $("<div>").addClass("toc").appendTo(this.tocInterior);
		
			var lastChapter = undefined;
			
			$.each(this.contents, function (index, content) {
				var color = Helpers.getColorForChapter(content.chapter);
			
				if (content.number == -1) color = "wheat";
			
				if (content.chapter != lastChapter) {				
					if (content.chapter > 0 && content.number > 0) {
						var ch = $("<div>").addClass("entry chapter").text("Chapter " + content.chapter).css("backgroundColor", color);
						ch.appendTo(toc);
					}
				}
			
				var entry = $("<div>").addClass("entry spread").appendTo(toc);
				entry.hover(function () { var tc = tinycolor(color); $(this).css("backgroundColor", tc.darken(20).toString()); },
							function () { $(this).css("backgroundColor", color); } );
			
				entry.css("backgroundColor", color);
			
				entry.data("id", content.id).attr("data-id", content.id);
			
				$("<p>").addClass("number").text(content.chapter + "." + content.number).appendTo(entry);

				var t = $("<p>").addClass("title").text(content.title);
			
				if (content.number == -1) {
					entry.addClass("toc-part");
					var ch = $("<p>").addClass("chapter").text("Part " + content.part);
					t.prepend(ch);
				} else if (content.number == 0) {
					entry.addClass("toc-chapter");
					var ch = $("<p>").addClass("chapter").text("Chapter " + content.chapter);
					t.prepend(ch);
				}
			
				t.appendTo(entry);
			
				lastChapter = content.chapter;
			
				entry.click($.proxy(me.onClickEntry, me));
			});

			this.searchManager = new SearchManager($("#results-pane"), $("#search-box"), this);		

			$("#news-widget").NewsItems();
			$("#news-widget").on("newsitemsbegin", $.proxy(this.onBeginNewsItem, this));
			$("#news-widget").on("newsitemsend", $.proxy(this.onEndNewsItem, this));
		
			$("#news-alert").NewsAlert();
		
			$("#help-system").HelpSystem( { layoutManager: this.options.layoutManager.dom, manualLink: "#how-to-use", tourLink: "#take-the-tour" } );
		
			$("#toggler").click($.proxy(this.onClickToggler, this));
			this.element.hover($.proxy(this.openToggler, this), $.proxy(this.closeToggler, this));
		
			$("#menu-button").click($.proxy(this.onClickMenuButton, this));
			$(".menuCloser").click($.proxy(this.onCloseMenu, this));
		
			$("#help-button").click($.proxy(this.openHelpMenu, this));
		
			$("#news-alert").click($.proxy(this.onClickNewsButton, this));

			$(window).resize($.proxy(this.sizeToFitWindow, this));
		
			this.sizeToFitWindow();			
        },

        _destroy: function () {
        },

        _setOption: function (key, value) {
			switch (key) {
				case "someValue":
					//this.options.someValue = doSomethingWith( value );
					break;
				default:
					this.options[key] = value;
					break;
			}

			this._super( "_setOption", key, value );
        },

		setData: function (contents) {
			console.log("got data!");
			
			var contentsArray = Helpers.objectToArrayWithKey(contents);
			this.searchManager.setData(contentsArray);
		},
		
		sizeToFitWindow: function () {
			var h1 = $("#toc-header").height();
			var h2 = $("#toc-footer").height();
			var h = $(window).height();
		
			this.tocInterior.height(h - h1 - h2);
		
			this.element.css("visibility", "visible");
		
			if (this.element.offset().left < 0) {
				this.element.css("left", -this.element.width());
			}
			
			this.searchManager.sizeToFit();
		},
        
		onClickEntry: function (event) {
			var id = $(event.target).data("id");
			if (!id)
				id = $(event.target).parents(".entry").data("id");
			
			if (id) {
				$("body").scrollTop(0);
				this.openSpread( { id: id, replace: true } );
			
				this.closeToggler();
			}
		},
		
		openSpread: function (options) {
			options = $.extend(options, {});
			
			$("#loading-spinner").removeClass("animated fadeOutRightBig").addClass("animated bounceIn").css("display", "block");
	
			options.callback = $.proxy(this.onSpreadVisible, this, options);
			
			this.layoutManager.showSpreadByID(options);
		},

		showSpreadSelection: function (id) {
			this.lastID = id;
		
			this.scrollTOCToCurrentSpread();
		
			var c = Helpers.findByID(id, this.contents);
			$("span#chapter").text(c.chapter);
			$("span#page").text(c.number);
		},

		closeToggler: function (event) {
			if (this.options.leaveOpen) return;
		
			this.element.stop();
		
			this.element.animate( { left: -this.element.width() }, 500 );
			$("#toggler i").removeClass("fa-chevron-circle-left").addClass("fa-chevron-circle-right");
		
			this.closeMenus();
		},
	
		getCurrentSpreadID: function () {
			return this.lastID;
		},
	
		onCurrentSpread: function (id) {
			if (id && id != this.lastID) {
				this.showSpreadSelection(id);
			}
		},
	
		jumpToCurrentSpread: function () {
			this.scrollTOCToCurrentSpread(false);
		},
	
		scrollTOCToCurrentSpread: function (animate) {
			if (animate == undefined) animate = true;
		
			var entry = $("#toc .entry[data-id='" + this.lastID + "']");
		
			$("#toc .entry").removeClass("selected");
		
			entry.addClass("selected");
		
			var h = this.tocInterior.height();
			var y = entry.position().top;
			
			// NOTE: this isn't quite right:
			var st = this.tocInterior.scrollTop() + y - (h * .5) - (entry.height() * .5);

			if (animate) {
				this.tocInterior.animate({ scrollTop: st }, 500);
			} else {
				this.tocInterior.scrollTop(st);
			}
		},
	
		openToRandomSpread: function () {
			var rand = Math.floor(Math.random() * this.contents.length);
		
			this.openSpread( { id: this.contents[rand].id, replace: true } );
		},
	
		onSpreadVisible: function (options, layout) {
			$("#loading-spinner").css("display", "none");
			$(".loading-message").animate( { height: 0, opacity: 0 }, { duration: 1500, complete: function () { $(".loading-message").remove(); } });
		
			var layoutDIV = layout.container.parents(".layout");
			layoutDIV.removeClass("loading");

			if (options.replace || options.previous) {
				var prevBanner = $("<div>").Banner( { source_id: options.id, previous: true, toc: this } );
				prevBanner.insertBefore(layoutDIV);
			}
			
			if (options.replace || !options.previous) {
				var nextBanner = $("<div>").Banner( { source_id: options.id, toc: this } );
				nextBanner.insertAfter(layoutDIV);
			}

			// scroll to top of this spread
			if (options.replace) {
				$("body").scrollTop($(".layout").offset().top - 15);			
			}
		
			// scroll to where we were (to keep our place)
			if (options.scrollToElement) {
				$("body").scrollTop(options.scrollToElement.offset().top - 15);	
			}
			
			this.showSpreadSelection(options.id);
		},
	
		getSpreadContent: function (index) {
			return this.contents[index];
		},

		getSpreadLayout: function (id) {
			return this.layouts[id];
		},
		
		getSpreadContentByID: function (id) {
			return this.options.contents[id];
		},
		
		getNextSpread: function (id) {
			for (var i = 0; i < this.contents.length; i++) {
				var c = this.contents[i];
				if (c.id == id) {
					var next;
					if (i == this.contents.length - 1) {
						next = undefined;
					} else {
						next = this.contents[i + 1];
					}
					return next;
				}
			}
			return undefined;
		},

		getPreviousSpread: function (id) {
			for (var i = 0; i < this.contents.length; i++) {
				var c = this.contents[i];
				if (c.id == id) {
					return this.contents[i - 1];
				}
			}
			return undefined;
		},
	
		onAutoLoadNextSpread: function (id) {
			var next = this.getNextSpread(id);
			
			if (next) {
				this.openSpread( { id: next.id, replace: false } );
			}
		},

		onAutoLoadPreviousSpread: function (id, scrollToElement) {
			var prev = this.getPreviousSpread(id);
			
			if (prev) {			
				this.openSpread( { id: prev.id, replace: false, previous: true, scrollToElement: scrollToElement } );
			}
		},
	
		onClickNextAd: function (event) {
			var t = $(event.currentTarget);

			var id = t.data("next-id");
		
			this.openSpread( { id: id, replace: false } );
		},

		onClickPreviousAd: function (event) {
			var t = $(event.currentTarget);

			var id = t.data("next-id");
		
			this.openSpread( { id: id, replace: false, previous: true } );
		},
	
		onClickToggler: function (event) {
			if (this.element.offset().left) {
				this.openToggler();
			} else {
				this.closeToggler();
			}
		},

		openToggler: function (event) {
			this.open();
		},
		
		open: function () {
			this.element.stop();
		
			this.element.animate( { left: 0 }, 500 );
			$("#toggler i").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");		
		},
		
		openImmediate: function () {
			this.element.stop();
		
			this.element.css({ left: 0 });
			$("#toggler i").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");		
		},
	
		onClickMenuButton: function (event) {
			$("#menu").toggle("slide", { direction: "up" });
			this.element.find("#news").hide("slide", { direction: "up" });
			this.element.find("#help-menu").hide("slide", { direction: "up" });
		},
	
		onCloseMenu: function (event) {
			$(event.currentTarget).parents(".menu").hide("slide", { direction: "up" });
		},
	
		onClickNewsButton: function (event) {
			$("#news").toggle("slide", { direction: "up" });
			this.element.find("#menu").hide("slide", { direction: "up" });
			this.element.find("#help-menu").hide("slide", { direction: "up" });
		},
	
		closeMenus: function () {
			this.element.find("#menu").hide("slide", { direction: "up" });
			this.element.find("#news").hide("slide", { direction: "up" });
			this.element.find("#help-menu").hide("slide", { direction: "up" });
			this.searchManager.closePane();
		},
	
		onBeginNewsItem: function (event, data) {
			// leave TOC open while news item plays back
			this.options.leaveOpen = true;
		
			var item = data.item;
		
			if (item.spread) {
				if (item.spread != this.getCurrentSpreadID()) {
					this.openSpread( { id: item.spread, replace: true, callback: data.callback } );
				} else {
					data.callback();
				}
			}
		},
	
		onEndNewsItem: function () {
			this.options.leaveOpen = false;
		
			$("#news-alert").NewsAlert("refresh");
		},
	
		openHelpMenu: function () {
			$("#help-menu").toggle("slide", { direction: "up" });
			this.element.find("#menu").hide("slide", { direction: "up" });
			this.element.find("#news").hide("slide", { direction: "up" });
		},

		getRandomImageFromSpread: function (spread, layout) {
			var cells = Helpers.objectToArrayWithKey(spread.cells);
		
			if (layout.style == "grid") {
				while (cells.length) {
					var r = Math.floor(Math.random() * cells.length);
					var c = cells[r];
					if (c.image) return c.image;
					else cells.splice(r, 1);
				}
			} else if (layout.style == 'text') {
				// pick a random image from the HTML
				var s = $("<div>").html(spread.cells[1].text);			
				var t = s.text();
				var reg = /<img\s+[^>]*src="([^"]*)"[^>]*>/g;
				var matches = [];
				while (match = reg.exec(t)) {
					matches.push(match[1]);
				}
				var img = matches[Math.floor(Math.random() * matches.length)];
				return img;
			} else {
				return layout.background;
			}
		},
		
		getRelatedSpreads: function (id, quantity) {
			// for now, just return 3 random spreads; later, use keywords, etc.
			var n = this.contents.length;
			var choices = [];

			while (choices.length < 3) {		
				var r = Math.floor(Math.random() * n);
		
				var candidate_id = this.contents[r].id;
		
				if (candidate_id != id && choices.indexOf(r) == -1) {
					choices.push(r);
				}
			}
		
			return choices;
		}
		
    });		
});