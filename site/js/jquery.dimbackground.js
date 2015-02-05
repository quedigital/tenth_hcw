define(["jquery"], function () {

	var dimmedElements = [];
	
	$.fn.dimBackground = function () {
		var rect = this[0].getBoundingClientRect();
		
		var w = $(window).width();
		var h = $(window).height();
		
		// top
		addDimmer(this, 0, 0, w, rect.top);
		
		// mid-left
		addDimmer(this, 0, rect.top, rect.left, rect.height);
		
		// mid-right
		addDimmer(this, rect.right, rect.top, w - rect.right, rect.height);
		
		// bottom
		addDimmer(this, 0, rect.bottom, w, h - rect.bottom);
		
		return this;
	}
	
	$.fn.undim = function () {
		var n = 0;

		console.log("trying to undim");

		while (n < dimmedElements.length) {
			var d = dimmedElements[n];
			if (d.element.is(this)) {
				console.log("undimming");
				d.dimmer.css("opacity", 0);
				
				var func = $.proxy(d.dimmer.remove, d.dimmer);
				setTimeout(func, 500);
				
				dimmedElements.splice(n, 1);
			} else {
				n++;
				console.log(d.element);
			}
		}

		console.log("left = " + dimmedElements.length);
	}
	
	$.undim = function () {
		$(".dimmer").remove();
	}
	
	function addDimmer (elem, x, y, w, h) {
		var d = $("<div>", { class: "dimmer" } );
		d.css( { width: w, height: h, left: x, top: y } );
		
		$("body").append(d);
		
		setTimeout(function () {
			d.css("opacity", .75);
		}, 0);
		
		dimmedElements.push( { element: elem, dimmer: d } );
	}
});