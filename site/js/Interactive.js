define([], function () {
	var WIDTH = 1024, HEIGHT = 700;
	var MARGIN = 10;

	Interactive = function (options, hints) {
		this.elem = $("<div>").addClass("interactive");

		this.elem.data("interactive", this);

		var style = hints.theme || "full-screen";
		
		switch (style) {
			case "fullscreen":		
				this.pullover = $("<div>").addClass("pullover").text("Interactive");
				this.elem.append(this.pullover);
				this.pullover.click($.proxy(this.expand, this));
		
				var contents = $("<div>").addClass("interactive-contents").css("display", "none");
		
				var iframe = $("<iframe>").attr( { width: WIDTH, height: HEIGHT, frameBorder: 0 } );
				contents.append(iframe);
		
				var close = $("<button>").addClass("fa fa-times fa-2x basic").attr("id", "interactive-close");
				contents.append(close);
				close.click($.proxy(this.minimize, this));
		
				this.url = options.image;
				this.contents = contents;
				this.iframe = iframe;		
		
				$("body").append(this.contents);
				
				break;
			case "inplace":
				// THEORY: use the % width from the editor and the ratio from the editor (ie, "1024,768")
				//   and once we know the actual pixel size (during positionCells) resize the iFrame accordingly
				
				var w = hints.width * 100 + "%";
				
				var size_w = parseInt(hints.size.substr(0, hints.size.indexOf(",")));
				var size_h = parseInt(hints.size.substr(hints.size.indexOf(",") + 1));
				this.ratio = size_h / size_w;
				
				var contents = $("<div>").addClass("interactive-contents");
				contents.width(w);
				
				this.contents = contents;
				
				var iframe = $("<iframe>").attr( { src: options.image, width: 0, frameBorder: 0 } );
				contents.append(iframe);
				
				this.iframe = iframe;
				
				this.elem.append(this.contents);
			
				break;
		}
	}
	
	Interactive.prototype = Object.create(null);
	Interactive.prototype.constructor = Interactive;
	
	// resize to our desired ratio (now that we know the pixel size, during positionCells)
	Interactive.prototype.format = function () {
		var w = this.contents.width();
		var h = w * this.ratio;
		
		this.contents.height(h);
		
		this.iframe.width(w).height(h);
	}
		
	Interactive.prototype.expand = function () {
		this.contents.css("display", "block").addClass("full-screen animated bounceInUp");
		
		this.iframe.attr("src", this.url);
		
		// scale the iframe to fit in our window
		var w = $(window).width();// - MARGIN * 2;
		var h = $(window).height();// - MARGIN * 2;
		
		var scale_w = w / WIDTH;
		var scale_h = h / HEIGHT;
		var scale = Math.min(scale_w, scale_h);
		
		this.iframe.css("transform", "scale(" + scale + ")");
		
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
		this.contents.removeClass("animated bounceInUp");
		this.contents.addClass("animated bounceOutDown");
		
//		this.contents.css("display", "none").removeClass("full-screen");
		
//		this.iframe.attr("src", "");

		var me = this;
		
		setTimeout(function () {
			me.contents.css("display", "none").removeClass("full-screen animated bounceOutDown");
		}, 500);
	}
	
	return Interactive;
});
