define(["jquery.json"], function () {
	function getMyRating (id) {
		if (typeof(Storage) !== "undefined") {
			var details = localStorage.getItem(id);
			if (details) {
				details = $.evalJSON(details);
				return details.rating;
			}
		}
		
		return undefined;
	}
	
	function setMyRating (id, rating) {
		if (typeof(Storage) !== "undefined") {
			var details = localStorage.getItem(id);
			if (!details) {
				details = { };
			}
			
			details.rating = rating;
			localStorage.setItem(id, $.toJSON(details));
		}
	}
	
	function getIndividualRating (id) {
		return 4;
	}
	
	function getAverageRating (id) {
		return 3;
	}

	var Database = {
		getMyRating: getMyRating,
		setMyRating: setMyRating,
		getIndividualRating: getIndividualRating,
		getAverageRating: getAverageRating,
	}
	
	return Database;	
});
