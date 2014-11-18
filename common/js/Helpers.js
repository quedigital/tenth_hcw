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
	
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function debounce (func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
	
	var isScrolledOff = function (elem) {
		var el = elem[0];
		var rect = el.getBoundingClientRect();
		return (Math.round(rect.bottom) <= 0);
	}
	
	function getColorForChapter (ch) {
		var colors = ["#FF3E54", "#f75", "#f94", "#fc4", "#fe4", "#df4", "#7f4", "#0f4", "#0fb"];
		
		if (ch == 0) {
			return "rgb(160, 160, 255)";
		} else {
			var c = (parseInt(ch) - 1) % colors.length;
			return colors[c];
		}
	}
	
	$.fn.wrapStart = function (numWords, klass) { 
		var node = this.contents().filter(function () { 
				return this.nodeType == 3 
			}).first();
		var text = node.text();
		var words = text.split(" ", numWords);
		for (var i = 0; i < words.length; i++) {
			if (words[i].indexOf(":") != -1) {
				words = words.slice(0, i + 1);
				break;
			}
		}
		
		var first = words.join(" ");

		if (!node.length)
			return;

		node[0].nodeValue = text.slice(first.length);
		node.before('<span class="' + klass + '">' + first + '</span>');
	};
	
	function animateCanvasPath (points, canvas) {
		var d = 0;
		
		var context = canvas.getContext("2d");
		
		clearCanvas(canvas, context);
		context.beginPath();
		
		for (var i = 1; i < points.length; i++) {
			var pt0 = points[i - 1];
			var pt1 = points[i];
			var d2 = (pt0.x - pt1.x) * (pt0.x - pt1.x) + (pt0.y - pt1.y) * (pt0.y - pt1.y);
			d += Math.sqrt(d2);
		}
		
		var speed = 30;
		var details = { context: context, points: points, speed: speed, distance: d, last: 0, current: speed };
		
		drawPath(details);
		
		return details;
	}
	
	function drawSegment (context, pt0, pt1) {
		moveTo(context, pt0.x, pt0.y);
		lineTo(context, pt1.x, pt1.y);
	}
	
	function getPointAlongSegment (pt0, pt1, d, t) {
		var dir = { x: pt1.x - pt0.x, y: pt1.y - pt0.y };
		var vx = dir.x / d;
		var vy = dir.y / d;
		var newX = pt0.x + vx * t;
		var newY = pt0.y + vy * t;
		return { x: newX, y: newY };
	}
	
	// only draw the current portion (spanning multiple segments, if necessary)
	function drawPath (details) {
		var total_d = 0;
		
		for (var i = 1; i < details.points.length; i++) {
			var pt0 = details.points[i - 1];
			var pt1 = details.points[i];
			var d2 = (pt0.x - pt1.x) * (pt0.x - pt1.x) + (pt0.y - pt1.y) * (pt0.y - pt1.y);
			var this_d = Math.sqrt(d2);
			
			if (total_d + this_d < details.last) {
				// skip, we're past this
			} else {
				// start of segment
				var startT = details.last - total_d;
				var start = pt0;
				if (startT > 0)
					start = getPointAlongSegment(pt0, pt1, this_d, startT);
				
				var endEarly = false;
				
				var end = pt1;
				if (total_d + this_d > details.current) {
					var endT = details.current - total_d;
					end = getPointAlongSegment(pt0, pt1, this_d, endT);
					
					endEarly = true;
				}
				
				drawSegment(details.context, start, end);
				
				if (endEarly) break;
			}
			
			total_d += this_d;
		}
		
		if (details.current >= details.distance) {
			// done
		} else {
			details.last = details.current;
			details.current += details.speed;
			details.interval = setTimeout($.proxy(drawPath, this, details), 50);
		}		
	}

	function clearCanvas (canvas, context) {
		context.save();

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.restore();
	}
	
	function moveTo (context, x, y) {
		context.moveTo(Math.floor(x), Math.floor(y));
	}

	function lineTo (context, x, y) {
		context.lineTo(Math.floor(x), Math.floor(y));
		context.stroke();
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
		debounce: debounce,
		isScrolledOff: isScrolledOff,
		getColorForChapter: getColorForChapter,
		animateCanvasPath: animateCanvasPath,
	};
	
	return Helpers;
});