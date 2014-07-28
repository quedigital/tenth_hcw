define(["jquery"], function ($) {
	function findByID (id, data) {
		var found = $.map(data, function (elem) {
			return (elem.id == id) ? elem : null;
		});
		
		if (found.length) return found[0];
		else return undefined;
	}
	
	return { findByID: findByID };
});