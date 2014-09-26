define(["Helpers"], function (Helpers) {

	TOC = function (manager, container, contents) {
		this.layoutManager = manager;
		
		this.contents = Helpers.objectToArrayWithKey(contents);
		this.contents.sort(Helpers.sortByChapterAndNumber);
		
		this.currentID = undefined;

		var me = this;
		
		var colors = ["#FF3E54", "#f75", "#f94", "#fc4", "#fe4", "#df4", "#7f4", "#0f4", "#0fb"];
		var color = 0;
		
		var toc = $("<div>").addClass("toc").appendTo(container);
		
		var lastChapter = undefined;
		
		$.each(this.contents, function (index, content) {
			if (content.chapter != lastChapter) {
				if (lastChapter != undefined) {
					color = (color + 1) % colors.length;
				}
				
				$("<div>").addClass("entry chapter").text("Chapter " + content.chapter).css("backgroundColor", colors[color]).appendTo(toc);
			}
			
			var entry = $("<div>").addClass("entry spread").appendTo(toc);
			
			entry.css("backgroundColor", colors[color]);
			
			entry.data("id", content.id);
			
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
		
		$("#nav-controls #next-spread").click($.proxy(this.onClickLoadNextSpread, this));		
	}
	
	TOC.prototype = Object.create(null);
	TOC.prototype.constructor = TOC;
	
	TOC.prototype.onClickEntry = function (event) {
		var id = $(event.target).data("id");
		if (!id)
			id = $(event.target).parents(".entry").data("id");
			
		if (id) {
			$("#content").scrollTop(0);		
			this.openSpread(id, true);			
		}
	}
	
	TOC.prototype.openSpread = function (id, replace) {
		this.currentID = id;
		
//		$("#content-holder").css("visibility", "hidden");
		$("#loading-spinner").removeClass("animated fadeOutRightBig").addClass("animated bounceIn").css("display", "block");
		
		var c = Helpers.findByID(id, this.contents);
		$("#header #chapter").text(c.chapter);
		$("#header #page").text(c.number);
		
		this.layoutManager.showSpreadByID(id, replace, onSpreadVisible);
	}
	
	TOC.prototype.openToRandomSpread = function () {
		var rand = Math.floor(Math.random() * this.contents.length);
		
		this.openSpread(this.contents[rand].id);
	}
	
	function onSpreadVisible () {
//		$("#content-holder").css("visibility", "visible");
//		$(".layout").addClass("animated zoomInDown").css("visibility", "visible");
		
		$("#loading-spinner").addClass("animated fadeOutRightBig");
	}
	
	TOC.prototype.onClickLoadNextSpread = function () {
		for (var i = 0; i < this.contents.length; i++) {
			var c = this.contents[i];
			if (c.id == this.currentID) {
				var nextID;
				if (i == this.contents.length - 1) {
					nextID = this.contents[0].id;
				} else {
					nextID = this.contents[i + 1].id;
				}
				
				this.openSpread(nextID, false);
				break;
			}
		}
	}
	
	return TOC;
});	
	
	
