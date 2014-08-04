define([], function () {
	function findByID (id, data) {
		var found = $.map(data, function (elem) {
			return (elem.id == id) ? elem : null;
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
	
	var Helpers = {
		findByID: findByID,
		reserveSpace: reserveSpace,
		findSpace: findSpace
	};
	
	return Helpers;
});