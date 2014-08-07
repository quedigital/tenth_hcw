define([], function () {
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
			else return 0;
		}
	}
	
	function objectToArray (obj) {
		return $.map(obj, function (el) { return el });
	}
	
	var Helpers = {
		findByID: findByID,
		reserveSpace: reserveSpace,
		findSpace: findSpace,
		sortByChapterAndNumber: sortByChapterAndNumber,
		objectToArray: objectToArray
	};
	
	return Helpers;
});