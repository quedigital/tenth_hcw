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
	
	$.fn.panzoomControls = function (command, arg) {
		if (command == "current") {
			var b = this.find(".btn.direct").eq(arg);
			
			this.find(".selected").removeClass("selected");
			b.addClass("selected");
			
			// scroll so it's in the middle
			var w = b.width();
			var p = b.position().left;
			var c = this.find(".container");
			var sl = c.scrollLeft();
			var off = (p + w > c.width()) || (p < 40);
			if (off) {
				var mb = $(".main-buttons").width();
				var middle = (mb * .5) - (w * .5);
				var offset = p - middle;
				var g = sl + offset;
				// NOTE: not sure why I'm adding 10 but oh well
				c.animate({ scrollLeft: g + 10 }, 500);
			}
		} else if (command == "refresh") {
			var c = this.find(".container");
			
			c.css("margin", 0);
			this.find(".scroller").css("display", "none");
			
			if (c[0].offsetWidth < c[0].scrollWidth) {
				// need scrolling
				c.css("margin", "0 40px");
				this.find(".scroller").css("display", "block");
				this.data("scrollAmount", c[0].offsetWidth * .3);
			} else {
				// don't need scrolling
			}			
		} else {
			var options = $.extend({}, command);
		
			var b;
		
			this.addClass("fixed-controls").empty();
		
			// nav buttons
			
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
		
			// main buttons
			var m = $("<div>").addClass("main-buttons").appendTo(this);
			
			var c = $("<div>").addClass("container").appendTo(m);
			
			// (optional) scrolling buttons
			b = $("<button>").addClass("btn symbol scroller").attr("id", "scrollLeft");
			$("<span>").addClass("up").html("<i class='fa fa-caret-left'></i>").appendTo(b);
			b.click($.proxy(scrollLeft, this, c));
			m.append(b);
			
			b = $("<button>").addClass("btn symbol scroller").text("R").attr("id", "scrollRight");
			$("<span>").addClass("up").html("<i class='fa fa-caret-right'></i>").appendTo(b);			
			b.click($.proxy(scrollRight, this, c));
			m.append(b);
			
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
	
	function scrollLeft (elem) {
		var amt = this.data("scrollAmount");
		
		elem.stop();
		elem.animate( { scrollLeft: elem.scrollLeft() - amt }, 250);
	}
	
	function scrollRight (elem) {
		var amt = this.data("scrollAmount");
		
		elem.stop();
		elem.animate( { scrollLeft: elem.scrollLeft() + amt }, 250);
	}
});