define(["Layout",
		"jqueryui",
		"imagesloaded.pkgd.min",
		"Helpers"
		], function (Layout, jqueryui, imagesLoaded, Helpers) {
	TextLayout = function (container, layout, content, manager) {
		Layout.call(this, container, manager, content);
		
		this.layout = layout;
		this.content = content;

		this.container.addClass("page");
		
		var h = $("<header>");
		
		// part intro
		if (content.number == -1) {
			h.addClass("part");
			var d = $("<div class='number'><p>Part</p><p>" + content.part + "</p></div><h1>" + content.title + "</h1>");
		
			h.append(d);
			
			$("<div>").addClass("chapters").text("Chapters").appendTo(h);
			
			var ch = manager.getChaptersForPart(content.part);
			$.each(ch, function (index, item) {
				var d = $("<div>").addClass("chapter-listing");
				$("<span>").addClass("number").text("Chapter " + item.chapter).appendTo(d);
				$("<span>").addClass("title").text(item.title).appendTo(d);
				d.appendTo(h);
				d.click(function () {
					manager.dom.trigger("open-spread", { id: item.id, replace: true, active: true } );
				});
			});
		} else
		// chapter intro
		if (content.number == 0) {
			h.addClass("chapter");
			var d = $("<div class='number'><p>Chapter</p><p>" + content.chapter + "</p></div><h1>" + content.title + "</h1>");
		
			h.append(d);
		}
		
		this.container.append(h);
		
		this.page = $("<section>").addClass("page");
				
		this.container.append(this.page);
		
		this.loadPage();
		
		imagesLoaded(this.page, $.proxy(this.onImagesLoaded, this));		
	}
	
	TextLayout.prototype = Object.create(Layout.prototype);
	TextLayout.prototype.constructor = TextLayout;

	TextLayout.prototype.onImagesLoaded = function () {
		this.layoutComplete();	
	}
	
	TextLayout.prototype.loadPage = function () {
		var cells = $.map(this.content.cells, function (el) { return el });
		
		cells.sort(Helpers.sortByPriority);
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];

			var s = $("<div>").html(cell.text);
			
			var t = s.text();
			
			var p = $("<div>").html(t);
			
			this.page.append(p);
		}
		
		this.container.find("a").attr("target", "_blank");
	}

	TextLayout.prototype.activate = function () {
		Layout.prototype.activate.call(this);
		
		this.container.trigger("controls", { layout: this, items: {} });
	}

	return TextLayout;
});