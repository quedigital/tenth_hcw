define([], function () {

	Interactive = function (options) {
		this.elem = $("<div>").addClass("interactive");
		
		this.pullover = $("<div>").addClass("pullover").text("Interactive");
		this.elem.append(this.pullover);
		this.pullover.click($.proxy(this.expand, this));
		
		var contents = $("<div>").addClass("interactive-contents").css("display", "none");
		
		var iframe = $("<iframe>").attr( { src: options.image, width: 1024, height: 768, frameBorder: 0 } );
		
		contents.append(iframe);
		
		this.contents = contents;
		
		this.contents.click($.proxy(this.minimize, this));
		
//		this.elem.append(contents);
		$("body").append(this.contents);
	}
	
	Interactive.prototype = Object.create(null);
	Interactive.prototype.constructor = Interactive;
	
	Interactive.prototype.expand = function () {
		this.contents.css("display", "block").addClass("full-screen");
		
		/*
		this.elem.find(".contents").css("display", "block").toggleClass("expanded");
		
		var me = this;
		
		setTimeout(function () {
			var gridLayout = me.elem.parents(".grid").data("grid");
			gridLayout.positionCells();
		}, 500);
		*/
	}
	
	Interactive.prototype.minimize = function () {
		this.contents.css("display", "none").removeClass("full-screen");
	}
	
	return Interactive;
});
