define([], function () {
	var MARGIN = 10;

	Interactive = function (options, hints) {
		this.elem = $("<div>").addClass("interactive");

		this.elem.data("interactive", this);

		var style = hints.theme || "full-screen";

		this.size_w = parseInt(hints.size.substr(0, hints.size.indexOf(",")));
		this.size_h = parseInt(hints.size.substr(hints.size.indexOf(",") + 1));	

		this.url = options.image;
		
		switch (style) {
			case "fullscreen":		
				this.pullover = $("<div>").addClass("pullover").text("Interactive");
				this.elem.append(this.pullover);
				this.pullover.click($.proxy(this.expand, this));
		
				var contents = $("<div>").addClass("interactive-contents").css("display", "none");
		
				var iframe = $("<iframe>").attr( { width: this.size_w, height: this.size_h, frameBorder: 0 } );
				contents.append(iframe);
		
				var close = $("<button>").addClass("fa fa-times fa-2x basic").attr("id", "interactive-close");
				contents.append(close);
				close.click($.proxy(this.minimize, this));
		
				this.contents = contents;
				this.iframe = iframe;		
		
				$("body").append(this.contents);
				
				break;
			case "inplace":
				// THEORY: use the % width from the editor and the ratio from the editor (ie, "1024,768")
				//   and once we know the actual pixel size (during positionCells) resize the iFrame accordingly
				
				var w = hints.width * 100 + "%";
				
				this.ratio = this.size_h / this.size_w;
				
				var contents = $("<div>").addClass("interactive-contents");
				contents.width(w);
				
				this.contents = contents;
				
				var iframe = $("<iframe>").attr( { src: this.url, width: this.size_w, height: this.size_h, frameBorder: 0 } );
				contents.append(iframe);
				
				this.iframe = iframe;
				
				this.elem.append(this.contents);
			
				break;
		}
	}
	
	Interactive.prototype = Object.create(null);
	Interactive.prototype.constructor = Interactive;
	
	// resize to our desired ratio (now that we know the pixel size, during positionCells)
	Interactive.prototype.format = function (pane) {
		var w, h;

		// NOTE: not sure where interactive-contents is being resized (so we have to use its parent)		
//		var cw = this.contents.width();
		this.contents.parent().css( { width: "auto", height: "auto" } );
		
		var cw = this.contents.parent().innerWidth();
		var ph = pane.innerHeight() - 20;
		
		// NOTE: we don't want the scale to be greater than 1, so fit either the width or the height
		
		// NEW THEORY: use all available width (works for Ducks 1_1), unless that makes the height larger then the pane height
		
		w = cw - 20;
		h = w * this.ratio;
		
		if (h > ph) {
			h = ph;
			w = h / this.ratio;
		}
		
		scale = w / this.size_w;
		
		this.contents.parent().width(w).height(h);
		this.contents.width("100%").height("100%");
		
		this.iframe.css( { transformOrigin: "0 0", transform: "scale(" + scale + ")" } );
	}
		
	Interactive.prototype.expand = function () {
		this.contents.css("display", "block").addClass("full-screen animated bounceInUp");
		
		this.iframe.attr("src", this.url);
		
		// scale the iframe to fit in our window
		var w = window.innerWidth - 20;
		var h = window.innerHeight - 20;
		
		var scale_w = w / this.size_w;
		var scale_h = h / this.size_h;
		var scale = Math.min(scale_w, scale_h);
		
		var marginLeft = (w - (this.size_w * scale)) * .5;
		var marginTop = (h - (this.size_h * scale)) * .5;
		
		this.iframe.css( { transform: "scale(" + scale + ")", marginLeft: marginLeft + "px", marginTop: marginTop + "px" } );
	}
	
	Interactive.prototype.minimize = function () {
		this.contents.removeClass("animated bounceInUp");
		this.contents.addClass("animated bounceOutDown");
		
		var me = this;
		
		setTimeout(function () {
			me.contents.css("display", "none").removeClass("full-screen animated bounceOutDown");
		}, 500);
	}
	
	Interactive.prototype.unload = function () {
		this.contents.remove();
	}
	
	return Interactive;
});
