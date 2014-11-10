define(["jquery"], function () {

	$.fn.fixedControls = function (manager, options) {
		this.removeClass("animated bounceOutDown");
		this.addClass("animated bounceOutDown");
		
		var settings = $.extend({
		}, options);
        
        var me = this;
        
        setTimeout(function () {	
			me.find("button.direct").remove();
		
			for (var i = 0; i < options.items.length; i++) {
				var lbl = options.items[i];
				if (!lbl) {
					lbl = "&nbsp;";
				}
				var b = $("<button>").addClass("btn direct");
				$("<span>").html(lbl).appendTo(b);
			
				me.find("#direct-buttons").append(b);
				var func = function (n) { options.layout.gotoStep(n); }.bind(manager, i);
				b.click(func);
			}
		
			if (options.items.length > 0) {				
				me.css("left", ($(window).width() - me.width()) * .5);
				me.removeClass("animated bounceOutDown");
				me.addClass("animated bounceInUp");
			}
		}, 600);

		return this;
	}
	
	$.fn.swipeControls = function (command, arg) {
		if (command == "current") {
			var b = this.find(".btn.direct").eq(arg);
			
			this.find(".selected").removeClass("selected");
			b.addClass("selected");
			
			// scroll so it's in the middle
			var mw = this.find(".main-buttons").width();
			var nw = this.find(".nav-buttons").width();
			var w = b.width();
			var l = b.position().left;
			var c = this.find(".container");
			var sl = c.scrollLeft();
			var off = (l + w > mw + nw) || (l < nw);
			if (off) {
				var middle = (l + sl) - (mw * .5) - (w * .5);
				c.animate({ scrollLeft: middle }, 500);
			}
		} else {
			var options = $.extend({}, command);
		
			var b;
		
			this.addClass("fixed-controls").empty();
		
			var n = $("<div>").addClass("nav-buttons").appendTo(this);
			b = $("<button>").addClass("btn symbol");
			$("<span>").addClass("up").html("<i class='fa fa-chevron-left'></i>").appendTo(b);
			if (options.onClickPrevious) {
				b.click(options.onClickPrevious);
			}
			n.append(b);
			b = $("<button>").addClass("btn symbol");
			$("<span>").addClass("up").html("<i class='fa fa-chevron-right'></i>").appendTo(b);
			if (options.onClickNext) {
				b.click(options.onClickNext);
			}
			n.append(b);
		
			var m = $("<div>").addClass("main-buttons").appendTo(this);

			var c = $("<div>").addClass("container").appendTo(m);
			
			var func;
			if (options.onClickStep) {
				func = function (n) {
					options.onClickStep(n);
				};
			}
	
			// full-image button
			b = $("<button>").addClass("btn direct symbol");
			if (options.selectFirstItem) b.addClass("selected");
			$("<span>").addClass("up").html("<i class='fa fa-arrows-alt'></i>").appendTo(b);
			if (func) {
				var newfunc = func.bind(this, 0);
				b.click(newfunc);
			}
			n.append(b);
		
			for (var i = 0; i < options.items.length; i++) {
				var lbl = options.items[i];
				if (!lbl) {
					lbl = "&nbsp;";
				}
				b = $("<button>").addClass("btn direct");
				var buttonClass = "wordlabel";
				if (lbl == parseInt(lbl).toString())
					buttonClass = "numeric";
				b.addClass(buttonClass);
				$("<span>").html(lbl).appendTo(b);
		
				c.append(b);
				// NOTE: the Javascript bind function is new; not available in IE<9
				if (func) {
					var newfunc = func.bind(this, i + 1);
					b.click(newfunc);
				}
			}	
		}
	}
});