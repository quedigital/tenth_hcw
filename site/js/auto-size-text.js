// modified from https://coderwall.com/p/_8jxgw
define([], function () {
	autoSizeText = function (options) {
		var el, elements, _i, _len;
		elements = $('.resizeable');
	
		if (elements.length < 0) {
			return;
		}
		
		for (_i = 0, _len = elements.length; _i < _len; _i++) {
			el = elements[_i];
			while (el.scrollHeight > el.offsetHeight) {
				var elNewFontSize;
				elNewFontSize = (parseInt($(el).css('font-size').slice(0, -2)) - 1);
				if (options && options.minSize && elNewFontSize < options.minSize) {
					$(el).css('font-size', options.minSize + "px");
					break;
				} else {
					$(el).css('font-size', elNewFontSize + "px");
				}
			}
		}
	}
	
	return autoSizeText;
});