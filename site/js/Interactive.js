define([], function () {

	Interactive = function (options) {
		this.elem = $("<div>").addClass("interactive");
		
		var button = $("<button>Embiggen</button>").addClass("try-me");
		
		this.elem.append(button);
		
		button.click($.proxy(this.expand, this));
		
		var contents = $("<div>").addClass("contents");
		
		var iframe = $("<iframe>").attr( { src: options.image, width: 1024, height: 768, frameBorder: 0 } );
		
		contents.append(iframe);
		
		this.elem.append(contents);
	}
	
	Interactive.prototype = Object.create(null);
	Interactive.prototype.constructor = Interactive;
	
	Interactive.prototype.expand = function () {
		this.elem.find(".contents").toggleClass("expanded");
		
		var me = this;
		
		setTimeout(function () {
			var gridLayout = me.elem.parents(".grid").data("grid");
			gridLayout.positionCells();
		}, 500);		
	}
	
	return Interactive;
});
