// stores a user's spread ratings locally (per browser in HTML5 localStorage) and updates that rating via Firebase
define(["firebase", "jquery.json"], function () {
	var _initialized = false;
	
	var ratingsRef, commentsRef, newsRef;
	
	var domain = "hcw";
	
	function initialize () {
		if (!_initialized) {
			ratingsRef = new Firebase("https://hcw10.firebaseio.com/ratings");
			commentsRef = new Firebase("https://hcw10.firebaseio.com/comments");
			newsRef = new Firebase("https://hcw10.firebaseio.com/news");
			_initialized = true;
		}
	}
	
	function getMyRating (id) {
		if (typeof(Storage) !== "undefined") {
			var ratings = getPersistentProperty("ratings");
			if (ratings) {
				var allRatings = $.evalJSON(ratings);
				if (allRatings[id]) {
					return allRatings[id].rating;
				}
			}
		}
		
		return undefined;
	}
	
	function setMyRating (id, rating) {
		initialize();
		
		if (typeof(Storage) !== "undefined") {
			var ratings = getPersistentProperty("ratings");
			var allRatings = {};
			if (ratings) {
				allRatings = $.evalJSON(ratings);
			}
			
			var ratingObj = allRatings[id];
			if (!ratingObj) {
				// Generate a reference to a new location and add some data using push()
				var pushedRatingRef = ratingsRef.child(id).push({ rating: rating });

				// Get the unique ID generated by push()
				var ratingID = pushedRatingRef.key();
				
				ratingObj = { ratingID: ratingID };
			} else {
				// store it in Firebase too
				var pushedRatingRef = ratingsRef.child(id).child(ratingObj.ratingID);
				pushedRatingRef.set( { rating: rating } );
			}
			
			ratingObj.rating = rating;
			allRatings[id] = ratingObj;
			
			setPersistentProperty("ratings", $.toJSON(allRatings));
		}
	}
	
	function getAverageRating (id, callback) {
		initialize();
		
		var allRatings = ratingsRef.child(id).once("value", $.proxy(onReceivedRatings, this, callback));
	}
	
	function onReceivedRatings (callback, dataSnapshot) {
		var vals = dataSnapshot.val();
		
		if (vals) {
			var total = 0, count = 0;
			for (var each in vals) {
				total += vals[each].rating;
				count++;
			}
			callback(total / count);
		} else
			callback(undefined);
	}
	
	function getComments (id, callback) {
		var allRatings = commentsRef.child(id).orderByKey().once("value", function (snapshot) {
			var vals = [];
			snapshot.forEach(function (child) {
				var childData = child.val();
				if (childData.moderated) {
					vals.push(childData);
				}
			});
			callback(vals);
		});
	}
	
	function addComment (id, options, callback) {
		commentsRef.child(id).push(options, callback);
	}
	
	// get the news items we haven't read yet
	function getNewsItems (callback) {
		initialize();

		var viewed = getLocalNewsItemKeys();
		
		var allNews = newsRef.orderByKey().once("value", function (snapshot) {
			var vals = [];
			snapshot.forEach(function (child) {
				var childData = child.val();
				childData.key = child.key();
				if (viewed.indexOf(childData.key) == -1) {
					vals.push(childData);
				}
			});
			callback(vals);
		});
	}
	
	function getNewNewsItemCount (callback) {
		// TODO: read all the news items, check their keys against the ones we've viewed (stored in localStorage)
		var allNews = newsRef.orderByKey().once("value", function (snapshot) {
			var viewed = getLocalNewsItemKeys();
			var count = 0;
			snapshot.forEach(function (child) {
				var key = child.key();
				if (viewed.indexOf(key) == -1) {
					count++;
				}
			});
			callback(count);
		});
	}
	
	function setNewsItemRead (key) {
		var keys = getLocalNewsItemKeys();
		if (keys.indexOf(key) == -1) {
			keys.push(key);
			var to_json = $.toJSON(keys);
			setPersistentProperty("news", to_json);
		}
	}
	
	function getLocalNewsItemKeys () {
		if (typeof(Storage) !== "undefined") {
			var keys = getPersistentProperty("news");
			if (keys) {
				keys = $.evalJSON(keys);
				return keys;
			}
		}
		
		return [];
	}
	
	function getPersistentProperty (prop) {
		return localStorage.getItem(domain + ":" + prop);
	}
	
	function setPersistentProperty (prop, val) {
		localStorage.setItem(domain + ":" + prop, val);
	}
	
	function getFavoriteSpreads () {
		var results = [];
		
		var ratings = getPersistentProperty("ratings");
		var allRatings = {};
		if (ratings) {
			allRatings = $.evalJSON(ratings);
		}
		
		for (var each in allRatings) {
			var item = allRatings[each];
			if (item.rating && item.rating == 5) {
				results.push(each);
			}
		}
			
		return results;
	}

	var Database = {
		getMyRating: getMyRating,
		setMyRating: setMyRating,
		getAverageRating: getAverageRating,
		getComments: getComments,
		addComment: addComment,
		getNewsItems: getNewsItems,
		getNewNewsItemCount: getNewNewsItemCount,
		setNewsItemRead: setNewsItemRead,
		getPersistentProperty: getPersistentProperty,
		setPersistentProperty: setPersistentProperty,
		getFavoriteSpreads: getFavoriteSpreads,
	}
	
	return Database;	
});
