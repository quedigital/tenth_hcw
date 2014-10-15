define(["Helpers"], function (Helpers) {

	TOC = function (manager, container, contents) {
		this.layoutManager = manager;
		
		this.contents = Helpers.objectToArrayWithKey(contents);
		this.contents.sort(Helpers.sortByChapterAndNumber);
		
		this.lastID = undefined;
		
		var me = this;
		
		var toc = $("<div>").addClass("toc").appendTo(container);
		
		var lastChapter = undefined;
		
		$.each(this.contents, function (index, content) {
			var color = Helpers.getColorForChapter(content.chapter);
			
			if (content.chapter != lastChapter) {
				$("<div>").addClass("entry chapter").text("Chapter " + content.chapter).css("backgroundColor", color).appendTo(toc);
			}
			
			var entry = $("<div>").addClass("entry spread").appendTo(toc);
			
			entry.css("backgroundColor", color);
			
			entry.data("id", content.id).attr("data-id", content.id);
			
//			var thumbnail = $("<div>").addClass("thumbnail").appendTo(entry);
			
			$("<p>").addClass("number").text(content.chapter + "." + content.number).appendTo(entry);
			
			$("<p>").addClass("title").text(content.title).appendTo(entry);
			
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
	}
	
	TOC.prototype = Object.create(null);
	TOC.prototype.constructor = TOC;
	
	TOC.prototype.onClickEntry = function (event) {
		var id = $(event.target).data("id");
		if (!id)
			id = $(event.target).parents(".entry").data("id");
			
		if (id) {
			$("#next-ad").css({ display: "none" });
			$("#prev-ad").css({ display: "none" });
			
			$("#content").scrollTop(0);
			this.openSpread( { id: id, replace: true } );
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
		var entry = $("#toc .entry[data-id='" + id + "']");
		
		$("#toc .entry").removeClass("selected");
		
		entry.addClass("selected");
		
		var toc = $(".toc-container");
		var h = toc.height();
		var y = entry.position().top;
		var st = toc.scrollTop() + y - (h * .5) + (entry.height() * .5);

		toc.animate({ scrollTop: st }, 500);
		
		var c = Helpers.findByID(id, this.contents);
		$("#header #chapter").text(c.chapter);
		$("#header #page").text(c.number);
	}
	
	TOC.prototype.onCurrentSpread = function (event, id) {
		if (id && id != this.lastID) {
			this.showSpreadSelection(id);
			this.lastID = id;
		}
	}
	
	TOC.prototype.openToRandomSpread = function () {
		var rand = Math.floor(Math.random() * this.contents.length);
		
		this.openSpread( { id: this.contents[rand].id, replace: true } );
	}
	
	TOC.prototype.onSpreadVisible = function (layout, options) {
//		$("#content-holder").css("visibility", "visible");
//		$(".layout").addClass("animated zoomInDown").css("visibility", "visible");
		
		$("#loading-spinner").addClass("animated fadeOutRightBig");
		
		var layoutDIV = layout.container.parents(".layout");
		if (options.previous) {
			layoutDIV.insertAfter($("#prev-ad"));
		} else {
			layoutDIV.insertBefore($("#next-ad"));
		}
		layoutDIV.removeClass("loading");
				
		if (options.previous) {
			this.updatePreviousSpreadName(options.id);
		} else {
			this.updateNextSpreadName(options.id);
		}
		
		$("#next-ad").css({ display: "block" });
		$("#prev-ad").css({ display: "block" });
		
		if (options.replace) {
			// scroll to top of this spread
			$("#content").scrollTop($(".layout").offset().top - 15);			
		}
		
		if (options.previous) {
			// scroll to top of next spread (to keep our place)
			$("#content").scrollTop(layoutDIV.offset().top + layoutDIV.outerHeight() - $("#prev-ad").outerHeight() - 30);
		}
	}
	
	TOC.prototype.updateNextSpreadName = function (id) {
		var nextSpread = this.getNextSpread(id);
		
		if (nextSpread) {
			$("#next-ad").text("Next Up: " + nextSpread.title);
			$("#next-ad").data("next-id", nextSpread.id);
		}
	}

	TOC.prototype.updatePreviousSpreadName = function (id) {
		var prevSpread = this.getPreviousSpread(id);
		
		if (prevSpread) {
			$("#prev-ad").text("Read More: " + prevSpread.title);
			$("#prev-ad").data("prev-id", prevSpread.id);
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
				var prev;
				if (i == 0) {
					prev = this.contents[this.contents.length - 1];
				} else {
					prev = this.contents[i - 1];
				}
				return prev;
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
	
	return TOC;
});