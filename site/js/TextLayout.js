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
		
		var d = $("<div class='chapter'><p>Chapter</p><p>" + content.chapter + "</p></div><h1>" + content.title + "</h1>");
		
		h.append(d);
		
		this.container.append(h);
		
		this.page = $("<section>").addClass("page");
				
		this.container.append(this.page);
		
		imagesLoaded(this.container, $.proxy(this.onImagesLoaded, this));		
	}
	
	TextLayout.prototype = Object.create(Layout.prototype);
	TextLayout.prototype.constructor = TextLayout;

	TextLayout.prototype.onImagesLoaded = function () {
		this.loadPage();
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

	return TextLayout;
});