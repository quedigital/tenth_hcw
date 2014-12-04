/*!
	Wheelzoom 3.0.0
	license: MIT
	http://www.jacklmoore.com/wheelzoom
*/
window.wheelzoom = (function(){
	var defaults = {
		zoom: 0.10
	};
	var canvas = document.createElement('canvas');

	function setSrcToBackground(img) {
		img.style.backgroundImage = "url('"+img.src+"')";
		img.style.backgroundRepeat = 'no-repeat';
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
		img.src = canvas.toDataURL();
	}

	main = function(img, options){
		if (!img || !img.nodeName || img.nodeName !== 'IMG') { return; }

		var settings = {};
		var width;
		var height;
		var bgWidth;
		var bgHeight;
		var bgPosX;
		var bgPosY;
		var previousEvent;

		function updateBgStyle() {
			img.style.backgroundSize = bgWidth+'px '+bgHeight+'px';
			img.style.backgroundPosition = bgPosX+'px '+bgPosY+'px';
		}

		function reset() {
			bgWidth = width;
			bgHeight = height;
			bgPosX = bgPosY = 0;
			updateBgStyle();
		}
		
		function zoomIn (event, dir) {
			if (dir == undefined) dir = 1;
			
			var offsetX = width * .5;
			var offsetY = height * .5;

			var bgCursorX = offsetX - bgPosX;
			var bgCursorY = offsetY - bgPosY;
		
			var bgRatioX = bgCursorX/bgWidth;
			var bgRatioY = bgCursorY/bgHeight;

			var amtX = bgWidth * settings.zoom * 3;
			var amtY = bgHeight * settings.zoom * 3;
			
			var newWidth = bgWidth + amtX * dir;
			var newHeight = bgHeight + amtY * dir;

			var adjX = offsetX - (newWidth * bgRatioX);
			var adjY = offsetY - (newHeight * bgRatioY);
			
			var zoom = (newWidth / width);

			if (newWidth <= width || newHeight <= height) {
				reset();
			} else if (zoom < 20) {
				bgPosX = adjX;
				bgPosY = adjY;
				
				bgWidth = newWidth;
				bgHeight = newHeight;
			
				updateBgStyle();
			} else {
				event.preventDefault();
			}
		}
		
		function zoomOut (event) {
			zoomIn(event, -1);
		}
		
		function onpan (e) {
			doDrag(e);
		}
		
		function onpinch (e) {
			e.pageX = (e.pointers[0].pageX + e.pointers[1].pageX) * .5;
			e.pageY = (e.pointers[0].pageY + e.pointers[1].pageY) * .5;
			e.deltaY = Math.max(e.deltaX, e.deltaY);
			
			onwheel(e);
		}

		function onwheel(e) {
			var deltaY = 0;

			e.preventDefault();

			if (e.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
				deltaY = e.deltaY;
			} else if (e.wheelDelta) {
				deltaY = -e.wheelDelta;
			}

			// As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
			// We have to calculate the target element's position relative to the document, and subtrack that from the
			// cursor's position relative to the document.
			var rect = img.getBoundingClientRect();
			var offsetX = e.pageX - rect.left - document.body.scrollLeft;
			var offsetY = e.pageY - rect.top - document.body.scrollTop;

			// Record the offset between the bg edge and cursor:
			var bgCursorX = offsetX - bgPosX;
			var bgCursorY = offsetY - bgPosY;
			
			// Use the previous offset to get the percent offset between the bg edge and cursor:
			var bgRatioX = bgCursorX/bgWidth;
			var bgRatioY = bgCursorY/bgHeight;

			// Update the bg size:
			if (deltaY < 0) {
				bgWidth += bgWidth*settings.zoom;
				bgHeight += bgHeight*settings.zoom;
			} else {
				bgWidth -= bgWidth*settings.zoom;
				bgHeight -= bgHeight*settings.zoom;
			}

			// Take the percent offset and apply it to the new size:
			bgPosX = offsetX - (bgWidth * bgRatioX);
			bgPosY = offsetY - (bgHeight * bgRatioY);

			// Prevent zooming out beyond the starting size
			if (bgWidth <= width || bgHeight <= height) {
				reset();
			} else {
				updateBgStyle();
			}
		}

		function doDrag (e) {
			e.preventDefault();
			if (e.type == "panstart") {
				firstPosX = bgPosX;
				firstPosY = bgPosY;
			}
			bgPosX = firstPosX + e.deltaX;
			bgPosY = firstPosY + e.deltaY;
			updateBgStyle();
		}
		
		function drag(e) {
			e.preventDefault();
			bgPosX += (e.pageX - previousEvent.pageX);
			bgPosY += (e.pageY - previousEvent.pageY);
			previousEvent = e;
			updateBgStyle();
		}

		function removeDrag() {
			document.removeEventListener('mouseup', removeDrag);
			document.removeEventListener('mousemove', drag);
		}

		// Make the background draggable
		function draggable(e) {
			e.preventDefault();
			previousEvent = e;
			document.addEventListener('mousemove', drag);
			document.addEventListener('mouseup', removeDrag);
		}

		function loaded() {
			var computedStyle = window.getComputedStyle(img, null);

			width = parseInt(computedStyle.width, 10);
			height = parseInt(computedStyle.height, 10);
			bgWidth = width;
			bgHeight = height;
			bgPosX = 0;
			bgPosY = 0;

			setSrcToBackground(img);

			img.style.backgroundSize =  width+'px '+height+'px';
			img.style.backgroundPosition = '0 0';
			img.addEventListener('wheelzoom.reset', reset);
			img.addEventListener('wheelzoom.zoomin', zoomIn);
			img.addEventListener('wheelzoom.zoomout', zoomOut);

			img.addEventListener('wheel', onwheel);
//			img.addEventListener('mousedown', draggable);
			
			var options = {};
			
			Hammer = require("Hammer");
			
			var hammertime = new Hammer(img, options);
			hammertime.get('pinch').set({ enable: true });
			hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
			hammertime.on('pinch pinchmove', onpinch);
			hammertime.on('pan panmove panstart', onpan);
		}

		img.addEventListener('wheelzoom.destroy', function (originalProperties) {
			console.log(originalProperties);
			img.removeEventListener('wheelzoom.destroy');
			img.removeEventListener('wheelzoom.reset', reset);
			img.removeEventListener('load', onload);
			img.removeEventListener('mouseup', removeDrag);
			img.removeEventListener('mousemove', drag);
			img.removeEventListener('mousedown', draggable);
			img.removeEventListener('wheel', onwheel);

			img.style.backgroundImage = originalProperties.backgroundImage;
			img.style.backgroundRepeat = originalProperties.backgroundRepeat;
			img.src = originalProperties.src;
		}.bind(null, {
			backgroundImage: img.style.backgroundImage,
			backgroundRepeat: img.style.backgroundRepeat,
			src: img.src
		}));

		options = options || {};

		Object.keys(defaults).forEach(function(key){
			settings[key] = options[key] !== undefined ? options[key] : defaults[key];
		});

		if (img.complete) {
			loaded();
		} else {
			function onload() {
				img.removeEventListener('load', onload);
				loaded();
			}
			img.addEventListener('load', onload);
		}
	};

	// Do nothing in IE8
	if (typeof window.getComputedStyle !== 'function') {
		return function(elements) {
			return elements;
		}
	} else {
		return function(elements, options) {
			if (elements && elements.length) {
				Array.prototype.forEach.call(elements, main, options);
			} else if (elements && elements.nodeName) {
				main(elements, options);
			}
			return elements;
		}
	}
}());