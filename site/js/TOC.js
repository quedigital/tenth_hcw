define(["Helpers"], function (Helpers) {

	TOC = function (mainContainer, manager, container, contents, layouts) {
		this.mainContainer = mainContainer;
		this.layoutManager = manager;
		this.container = container;
		
		this.contents = Helpers.objectToArrayWithKey(contents);
		this.layouts = layouts;
		this.contents.sort(Helpers.sortByChapterAndNumber);
		
		this.lastID = undefined;
		
		var me = this;
		
		var toc = $("<div>").addClass("toc").appendTo(container);
		
		var lastChapter = undefined;
		
		$.each(this.contents, function (index, content) {
			var color = Helpers.getColorForChapter(content.chapter);
			
			if (content.chapter != lastChapter) {				
				if (content.chapter > 0 && content.number > 0) {
					var ch = $("<div>").addClass("entry chapter").text("Chapter " + content.chapter).css("backgroundColor", color);
					ch.appendTo(toc);
				}
			}
			
			var entry = $("<div>").addClass("entry spread").appendTo(toc);
			
			entry.css("backgroundColor", color);
			
			entry.data("id", content.id).attr("data-id", content.id);
			
//			var thumbnail = $("<div>").addClass("thumbnail").appendTo(entry);
			
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
			
			/*
			for (var each in content.cells) {
				var cell = content.cells[each];
				if (cell.image) {
					thumbnail.css("background-image", "url(" + cell.image + ")");
					break;
				}
			}
			*/
			
			entry.click($.proxy(me.onClickEntry, me));
		});
		
		$("#next-read .read").click($.proxy(this.onClickNextAd, this));
		$("#prev-read .read").click($.proxy(this.onClickPreviousAd, this));
		
		$("#toggler").click($.proxy(this.onClickToggler, this));
		$("#toc-container").hover($.proxy(this.openToggler, this), $.proxy(this.closeToggler, this));
		
		$(window).resize($.proxy(this.sizeToFitWindow, this));
		
		this.sizeToFitWindow();
	}
	
	TOC.prototype = Object.create(null);
	TOC.prototype.constructor = TOC;
	
	TOC.prototype.sizeToFitWindow = function () {
		var h1 = $("#toc-header").height();
		var h2 = $("#toc-footer").height();
		var h = $(window).height();
		
		this.container.height(h - h1 - h2);
		
		this.mainContainer.css("visibility", "visible");
		
		if (this.mainContainer.offset().left < 0) {
			this.mainContainer.css("left", -this.mainContainer.width());
		}
	}
	
	TOC.prototype.onClickEntry = function (event) {
		var id = $(event.target).data("id");
		if (!id)
			id = $(event.target).parents(".entry").data("id");
			
		if (id) {
			$("#next-read").css({ display: "none" });
			$("#prev-read").css({ display: "none" });
			
			$("#content").scrollTop(0);
			this.openSpread( { id: id, replace: true } );
			
			this.closeToggler();
		}
	}
	
	TOC.prototype.openSpread = function (options) {
		options = $.extend(options, {});
				
//		$("#content-holder").css("visibility", "hidden");
		$("#loading-spinner").removeClass("animated fadeOutRightBig").addClass("animated bounceIn").css("display", "block");
		
		this.layoutManager.showSpreadByID(options, $.proxy(this.onSpreadVisible, this));
		
		if (options.replace) {
			this.updatePreviousSpreadName(options.id);
		}
	}
	
	TOC.prototype.showSpreadSelection = function (id) {
		this.lastID = id;
		
		this.scrollToCurrentSpread();
		
		var c = Helpers.findByID(id, this.contents);
		$("#header #chapter").text(c.chapter);
		$("#header #page").text(c.number);
	}
	
	TOC.prototype.onCurrentSpread = function (event, id) {
		if (id && id != this.lastID) {
			this.showSpreadSelection(id);
		}
	}
	
	TOC.prototype.jumpToCurrentSpread = function () {
		this.scrollToCurrentSpread(false);
	}
	
	TOC.prototype.scrollToCurrentSpread = function (animate) {
		if (animate == undefined) animate = true;
		
		var entry = $("#toc .entry[data-id='" + this.lastID + "']");
		
		$("#toc .entry").removeClass("selected");
		
		entry.addClass("selected");
		
		var toc = $(".toc-container");
		var h = toc.height();
		var y = entry.position().top;
		var st = toc.scrollTop() + y - (h * .5) + (entry.height() * .5);

		if (animate) {
			toc.animate({ scrollTop: st }, 500);
		} else {
			toc.scrollTop(st);
		}
	}
	
	TOC.prototype.openToRandomSpread = function () {
		var rand = Math.floor(Math.random() * this.contents.length);
		
		this.openSpread( { id: this.contents[rand].id, replace: true } );
	}
	
	TOC.prototype.onSpreadVisible = function (layout, options) {
		$("#loading-spinner").addClass("animated fadeOutRightBig");
		
		var layoutDIV = layout.container.parents(".layout");
		if (options.previous) {
			layoutDIV.insertAfter($("#prev-read"));
		} else {
			layoutDIV.insertBefore($("#next-read"));
		}
		layoutDIV.removeClass("loading");
				
		if (options.previous) {
			this.updatePreviousSpreadName(options.id);
		} else {
			this.updateNextSpreadBanner(options.id);
		}
		
		if ($("#next-read .wide-read h1").text()) {
			$("#next-read").css({ display: "block" });
		} else {
			$("#next-read").css({ display: "none" });
		}
		
		if ($("#prev-read .wide-read h1").text()) {
			$("#prev-read").css({ display: "block" });
		} else {
			$("#prev-read").css({ display: "none" });
		}
		
		if (options.replace) {
			// scroll to top of this spread
			$("#content").scrollTop($(".layout").offset().top - 15);			
		}
		
		if (options.previous) {
			// scroll to top of next spread (to keep our place)
			$("#content").scrollTop(layoutDIV.offset().top);
		}
	}
	
	TOC.prototype.updateNextSpreadBanner = function (id) {
		var nextSpread = this.getNextSpread(id);
		
		if (nextSpread) {
			$("#next-read .wide-read h1").text(nextSpread.title);
			var layout = this.layouts[nextSpread.id];
			var img = getRandomImageFromSpread(nextSpread, layout);
			img = (img == undefined) ? "none" : "url(" + img + ")";
			$("#next-read .wide-read .preview-image").css("backgroundImage", img);
			$("#next-read .read").data("next-id", nextSpread.id);
		}
		
		var me = this;
		var spreads = getRelatedSpreads(this.contents, id, 3);
		$.each(spreads, function (index, item) {
			var spread = me.contents[item];
			var small = $(".read-area .small-read").eq(index);
			small.find("h1").text(spread.title);
			var layout = me.layouts[spread.id];
			var img = getRandomImageFromSpread(spread, layout);
			img = (img == undefined) ? "none" : "url(" + img + ")";
			small.find(".preview-image").css("backgroundImage", img);
			small.data("next-id", spread.id);
		});
	}

	TOC.prototype.updatePreviousSpreadName = function (id) {
		var prevSpread = this.getPreviousSpread(id);
		
		if (prevSpread) {
			$("#prev-read .wide-read h1").text(prevSpread.title);
			var layout = this.layouts[prevSpread.id];
			var img = getRandomImageFromSpread(prevSpread, layout);
			img = (img == undefined) ? "none" : "url(" + img + ")";
			$("#prev-read .wide-read .preview-image").css("backgroundImage", img);
			$("#prev-read .read").data("next-id", prevSpread.id);
		} else {
			$("#prev-read .wide-read h1").text("");
		}
	}
	
	TOC.prototype.getNextSpread = function (id) {
		for (var i = 0; i < this.contents.length; i++) {
			var c = this.contents[i];
			if (c.id == id) {
				var next;
				if (i == this.contents.length - 1) {
					next = this.contents[0];
				} else {
					next = this.contents[i + 1];
				}
				return next;
			}
		}
		return undefined;
	}

	TOC.prototype.getPreviousSpread = function (id) {
		for (var i = 0; i < this.contents.length; i++) {
			var c = this.contents[i];
			if (c.id == id) {
				return this.contents[i - 1];
			}
		}
		return undefined;
	}
	
	TOC.prototype.onAutoLoadNextSpread = function (event, id) {
		this.openSpread( { id: id, replace: false } );
	}

	TOC.prototype.onAutoLoadPreviousSpread = function (event, id) {
		this.openSpread( { id: id, replace: false, previous: true } );
	}
	
	TOC.prototype.onClickNextAd = function (event) {
		var t = $(event.currentTarget);

		var id = t.data("next-id");
		
		this.openSpread( { id: id, replace: false } );
	}

	TOC.prototype.onClickPreviousAd = function (event) {
		var t = $(event.currentTarget);

		var id = t.data("next-id");
		
		this.openSpread( { id: id, replace: false, previous: true } );
	}
	
	TOC.prototype.onClickToggler = function (event) {
		if (this.mainContainer.offset().left) {
			this.openToggler();
		} else {
			this.closeToggler();
		}
	}

	TOC.prototype.openToggler = function (event) {
		this.mainContainer.stop();
		
		this.mainContainer.animate( { left: 0 }, 500 );
		$("#toggler i").removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-left");		
	}
	
	TOC.prototype.closeToggler = function (event) {
		this.mainContainer.stop();
		
		this.mainContainer.animate( { left: -this.mainContainer.width() }, 500 );
		$("#toggler i").removeClass("fa-chevron-circle-left").addClass("fa-chevron-circle-right");
	}
	
	function getRandomImageFromSpread (spread, layout) {
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
	}
	
	function getRelatedSpreads (contents, id, quantity) {
		// for now, just return 3 random spreads; later, use keywords, etc.
		var n = contents.length;
		var choices = [];

		while (choices.length < 3) {		
			var r = Math.floor(Math.random() * n);
		
			var candidate_id = contents[r].id;
		
			if (candidate_id != id && choices.indexOf(r) == -1) {
				choices.push(r);
			}
		}
		
		return choices;
	}
	
	return TOC;
});