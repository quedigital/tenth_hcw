define(["Helpers", "tinycolor", "Database", "jquery.ui.widget", "NewsItems", "NewsAlert", "HelpSystem", "banner", "favorites"], function (Helpers, tinycolor, Database) {

	function showSearchWindow (options) {
		this.close();
		
		$("#search-window").SearchWindow("option", options);
		$("#search-window").SearchWindow("show");
	}
	
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

			$("#news-widget").NewsItems();
			$("#news-widget").on("newsitemsend", $.proxy(this.onEndNewsItem, this));
		
			$("#news-alert").NewsAlert();
		
			$("#help-system").HelpSystem( { layoutManager: this.options.layoutManager.dom, manualLink: "#how-to-use", tourLink: "#take-the-tour", newsLink: "#whats-new" } );
			
			$("#favorites-widget").Favorites( { layoutManager: this.options.layoutManager } );
		
			$("#toggler").click($.proxy(this.onClickToggler, this));
			// use click, not hover, on ipad (so it doesn't complicate the clicking of other items; ie 2 clicks for some things)
			if (!Helpers.isTouchEnabled()) {
				this.element.hover($.proxy(this.openToggler, this), $.proxy(this.closeToggler, this));
			}
		
			$("#menu-button").click($.proxy(this.onClickMenuButton, this));
			$(".menuCloser").click($.proxy(this.onCloseMenu, this));
		
			$("#help-button").click($.proxy(this.openHelpMenu, this));
		
			$("#news-alert").click($.proxy(this.onClickNewsButton, this));
			
			$("#search-button").click($.proxy(showSearchWindow, this, { type: "text" } ));
			$("#keyword-button").click($.proxy(showSearchWindow, this, { type: "keyword" } ));
			
			$('[title != ""]').qtip({ position: { viewport: $("#toc-container"), adjust: { method: "shift" } } });

			$(window).resize($.proxy(this.sizeToFitWindow, this));
		
			this.sizeToFitWindow();
			
			setTimeout($.proxy(this.updateRatingMarkers, this), 1000);
        },

        _destroy: function () {
        },

        _setOption: function (key, value) {
			switch (key) {
				case "leaveOpen":
					this.options.leaveOpen = value;
					$("#togglerButton").css("color", this.options.leaveOpen ? "rgb(229, 162, 38)" : "#fff");
					break;
				default:
					this.options[key] = value;
					break;
			}

			this._super( "_setOption", key, value );
        },

		sizeToFitWindow: function () {
			var h1 = $("#toc-header").height();
			var h2 = $("#toc-footer").height();
			var h = window.innerHeight;
			
			var interior = h - h1 - h2;
			
			this.tocInterior.height(interior);
		
			this.element.css("visibility", "visible");
		
			if (this.element.offset().left < 0) {
				this.element.css("left", -this.element.width());
			}
		},
        
		onClickEntry: function (event) {
			var id = $(event.target).data("id");
			if (!id)
				id = $(event.target).parents(".entry").data("id");
			
			if (id) {
				$(window).scrollTop(0);
				this.openSpread( { id: id, replace: true, active: true } );
			
				this.closeToggler();
			}
		},
		
		openSpread: function (options) {
			options = $.extend(options, {});
			
			$("#loading-spinner").css("display", "block");
	
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
		
		openToFirstSpread: function () {
			this.openSpread( { id: this.contents[0].id, replace: true } );
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
				$(window).scrollTop($(".layout").offset().top - 15);
			}
		
			// scroll to where we were (to keep our place)
			if (options.scrollToElement) {
				$(window).scrollTop(options.scrollToElement.offset().top - 15);
			}
			
			this.showSpreadSelection(options.id);
			
			if (options.onVisibleCallback) {
				options.onVisibleCallback();
			}
			
			// add title
			options.title = layout.title;			
			this.element.trigger("open-spread", options);
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
			for (var i = 1; i < this.contents.length; i++) {
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
				this.openSpread( { id: next.id, replace: false, active: true } );
			}
		},

		onAutoLoadPreviousSpread: function (id, scrollToElement) {
			var prev = this.getPreviousSpread(id);
			
			if (prev) {			
				this.openSpread( { id: prev.id, replace: false, previous: true, scrollToElement: scrollToElement, active: true } );
			}
		},
	
		// on touch devices, just toggle; with mouse, click = toggle pin
		onClickToggler: function (event) {
			if (Helpers.isTouchEnabled()) {
				if (this.element.offset().left) {
					this.openToggler();
				} else {
					this.closeToggler();
				}
			} else {
				if (this.options.leaveOpen) {
					this.option("leaveOpen", false);
				
					if (this.element.offset().left) {
						this.openToggler();
					} else {
						this.closeToggler();
					}
				} else {
					this.option("leaveOpen", true);
				}
			}
		},

		openToggler: function (event) {
			if (window.innerHeight != this.lastInnerHeight) {
				this.sizeToFitWindow();
				this.lastInnerHeight = window.innerHeight;
			}
			
			this.open();
		},
		
		open: function (options) {
			this.element.stop();
		
			if (options && options.instant)
				this.element.css("left", 0);
			else
				this.element.animate( { left: 0 }, 500 );
				
			$("#toggler i").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");		
		},

		close: function (options) {
			this.element.stop();
		
			if (options && options.instant)
				this.element.css("left", -this.element.width());
			else
				this.element.animate( { left: -this.element.width() }, 500 );
				
			$("#toggler i").removeClass("fa-chevron-circle-left").addClass("fa-chevron-circle-right");
		
			this.closeMenus();
		},
		
		openImmediate: function () {
			this.element.stop();
		
			this.element.css({ left: 0 });
			$("#toggler i").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");		
		},
		
		onClickMenuButton: function (event) {
			if (!$("#menu").is(":visible")) {
				$("#favorites-widget").Favorites("refresh");
			}
				
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

			this.element.trigger("trackedevent", { category: "button", action: "click", label: "news" });
		},
	
		closeMenus: function () {
			this.element.find("#menu").hide("slide", { direction: "up" });
			this.element.find("#news").hide("slide", { direction: "up" });
			this.element.find("#help-menu").hide("slide", { direction: "up" });
		},
	
		onEndNewsItem: function () {
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
		},
		
		updateRatingMarkers: function () {
			var ratings = Database.getAllSpreadRatings();
			for (var id in ratings) {
				this.updateRatingMarkerForID(id, ratings[id].rating);
			}
		},
		
		updateRatingMarkerForID: function (id, rating) {
			var entry = $(".entry[data-id='" + id + "']");
			var content = this.getSpreadContentByID(id);
			if (entry && content) {
				var color = Helpers.getColorForChapter(content.chapter);
				entry.find(".read-marker").remove();
				var marker = $("<span>", { class: "fa-stack read-marker" });
				$("<i>", { class: "fa fa-stack-1x fa-certificate" }).appendTo(marker);
				$("<i>", { class: "rating fa fa-stack-1x", text: rating }).css("color", color).appendTo(marker);
				marker.appendTo(entry);
				var tc = tinycolor(color);
				marker.css("color", tc.brighten(20).toString());
			}
		}

    });		
});