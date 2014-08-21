define([], function () {

	TOC = function (manager, container, contents) {
		this.manager = manager;
		this.contents = contents;
		
		var me = this;
		
		var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
		var color = 0;
		
		var toc = $("<div>").addClass("toc").appendTo(container);
		
		var lastChapter = undefined;
		
		$.each(this.contents, function (index, content) {
			var entry = $("<div>").addClass("entry").appendTo(toc);
			
			if (content.chapter != lastChapter && lastChapter != undefined) {
				color = (color + 1) % colors.length;
			}
			entry.css("backgroundColor", colors[color]);
			
			entry.data("id", content.id);
			
			var thumbnail = $("<div>").addClass("thumbnail").appendTo(entry);
			
			$("<p>").addClass("number").text(content.chapter + "." + content.number).appendTo(entry);
			
			$("<p>").addClass("title").text(content.title).appendTo(entry);
			
			lastChapter = content.chapter;
			
			for (var each in content.cells) {
				var cell = content.cells[each];
				if (cell.image) {
					thumbnail.css("background-image", "url(" + cell.image + ")");
					break;
				}
			}
			
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
			this.manager.showSpreadByID(id);
		}
	}

	return TOC;
});	
	
	
