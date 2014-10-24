define(["jquery"], function ($) {
	function findByID (id, data) {
		var found = $.map(data, function (elem) {
			return (elem.id == id) ? elem : null;
		});
		
		if (found.length) return found[0];
		else return undefined;
	}

	function findByIDFunc (id, array) {
		var found = $.map(array, function (elem) {
			return (elem.id() == id) ? elem : null;
		});
		
		if (found.length) return found[0];
		else return undefined;
	}

	function reserveSpace (map, x, y, w, h, id) {
		for (var i = 0; i < w; i++) {
			map[y * 10 + x + i] = (id == undefined) ? "*" : id;
		}
	}
	
	function findSpace (map, w, h) {
		var MAX_ROWS = 25;
		
		for (var row = 0; row < MAX_ROWS; row++) {
			for (var col = 0; col <= 10 - w; col++) {
				var blocked = false;
				for (var i = 0; i < w; i++) {
					if (map[row * 10 + col + i]) {
						blocked = true;
						break;
					}
				}
				if (!blocked) {
					return { x: col, y: row };
				}
			}
		}
		
		return undefined;
	}
	
	function sortByChapterAndNumber (a, b) {
		var cha = parseInt(a.chapter), chb = parseInt(b.chapter);
		var numa = parseInt(a.number), numb = parseInt(b.number);
	
		if (cha < chb) return -1;
		else if (cha > chb) return 1;
		else {
			if (numa < numb) return -1;
			else if (numa > numb) return 1;
			else {
				if (a.number < b.number) return -1;
				else if (a.number > b.number) return 1;
			}
		}
		return 0;
	}
	
	function sortByPriority (a, b) {
		if (a[".priority"] < b[".priority"]) return -1;
		else if (a[".priority"] > b[".priority"]) return 1;
		else return 0;
	}
	
	function objectToArrayWithKey (obj) {
		return $.map(obj, function (el, key) { return $.extend(el, { id: key }) });
	}
	
	function getFirebaseKeys (firebase) {
		var keys = [];
		$.each(firebase, function (index, item) {
			keys.push(item().firebase.name());
		});
		return keys;
	}
	
	// return one higher than the highest numeric id so far, but use the firebase key not the content id (because the content id can be alpha)
	function getNextHighestKey (firebase) {
		var ids = getFirebaseKeys(firebase);
		var max = 0;
		$.each(ids, function (index, item) {
			var n = parseInt(item);
			if (n > max) {
				max = n;
			}
		});
		return max + 1;
	}
	
	function convertAlignToJQueryAlign (align) {
		var r = "";
		
		switch (align) {
			case "TL":
				r = "left top"; break;
			case "T":
				r = "center top"; break;
			case "TR":
				r = "right top"; break;
			case "R":
				r = "right center"; break;
			case "BR":
				r = "right bottom"; break;
			case "B":
				r = "center bottom"; break;
			case "BL":
				r = "left bottom"; break;
			case "L":
				r = "left center"; break;
		}
		
		return r;
	}
	
	function isVectorImage (img) {
		if (img.attr("src") && img.attr("src").indexOf(".svg") != -1) return true;
		else return false;
	}
	
	function throttle (fn, threshold, scope) {
		threshold || (threshold = 250);
		var last, deferTimer;
		return function () {
			var context = scope || this;
			var now = +new Date,
			args = arguments;
			if (last && now < last + threshold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(context, args);
				}, threshold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	}
	
	var isScrolledOff = function (elem) {
		var el = elem[0];
		var rect = el.getBoundingClientRect();
		return (Math.round(rect.bottom) <= 0);
	}
	
	function getColorForChapter (ch) {
		var colors = ["#FF3E54", "#f75", "#f94", "#fc4", "#fe4", "#df4", "#7f4", "#0f4", "#0fb"];
		
		var c = (parseInt(ch) - 1) % colors.length;
		return colors[c];		
	}
	
	var Helpers = {
		findByID: findByID,
		reserveSpace: reserveSpace,
		findSpace: findSpace,
		sortByChapterAndNumber: sortByChapterAndNumber,
		sortByPriority: sortByPriority,
		objectToArrayWithKey: objectToArrayWithKey,
		getNextHighestKey: getNextHighestKey,
		convertAlignToJQueryAlign: convertAlignToJQueryAlign,
		isVectorImage: isVectorImage,
		throttle: throttle,
		isScrolledOff: isScrolledOff,
		getColorForChapter: getColorForChapter,
	};
	
	return Helpers;
});