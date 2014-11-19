define(["Database", "jquery", "jquery.qtip", "jquery.autosize"], function (Database) {
	var currentID;
	
	$.fn.ratingsSystem = function (command, options) {
		if (command == "initialize") {
			var settings = $.extend({
			}, options);
		
			this.find("#commentArea").autosize();
		
			var stars = this.find(".star");
		
			stars.qtip( { content: { title: function () { return this.attr("data-title"); } }, style: { classes: 'qtip-dark' } } );
		
			stars.click($.proxy(onClickStar, this, this));
		
			this.find("#addComment").click($.proxy(addComment, this, this));
			this.find("#showComments").click($.proxy(showComments, this, this));
			this.find("#send-button").click($.proxy(postComment, this, this));
			this.find("#cancel-button").click($.proxy(addComment, this, this));
			
		} else if (command == "update") {
			var b = options.bottomOf.position().top + options.bottomOf.outerHeight();
			
			var options = { bottom: b, title: options.title, id: options.id };
			
			currentID = options.id;
			
			// using animate because it is queued
			this.fadeOut().delay(1000).animate( { top: b }, 0, $.proxy(initialize, this, this, options) ).delay(1000).fadeIn();
		}
		
		return this;
	}
	
	function postComment (elem) {
		var options = { name: $(elem).find("#name").val(), comment: $(elem).find("#comment").val() };
		
		Database.addComment(currentID, options, $.proxy(showComments, this, elem));		
	}
	
	function addComment (elem) {
		if ($(elem).find(".commentEntry").is(":visible")) {
			$(elem).find(".commentEntry").hide("fade");
		} else {
			resetForm(elem);
			$(elem).find(".commentEntry").show("fade", { direction: "down" });
			$(elem).find(".comments").hide("fade", { direction: "up" });
		}
	}
	
	function showComments (elem) {
		if ($(elem).find(".comments").is(":visible")) {
			$(elem).find(".comments").hide("fade");
		} else {
			var comments = Database.getComments(currentID, $.proxy(updateCommentsUI, this, this));		
		}
	}
	
	function updateCommentsUI (elem, comments) {
		var scroller = elem.find(".scroller").empty();
	
		for (var each in comments) {
			scroller.append("<p><span>" + comments[each].name + ": </span><span>" + comments[each].comment + "</span></p>");
		}
	
		$(elem).find(".comments").show("fade", { direction: "down" });
		$(elem).find(".commentEntry").hide("fade", { direction: "up" });
	}
	
	function resetForm (elem) {
		elem.find("#name").val("");
		elem.find("#comment").val("");
	}
	
	function onClickStar (elem, event) {
		var rating = 5 - $(event.currentTarget).index();
		
		var stars = elem.find(".star");
		
		stars.removeClass("selected animated tada").show(0).slice(5 - rating, 5).addClass("selected").addClass("animated tada");
		
		if (currentID) {
			Database.setMyRating(currentID, rating);
		}
	}
	
	function initialize (elem, options) {
		elem.css( { visibility: "hidden", display: "block" } );
		
		elem.find("h1").html("What did you think of <span>" + options.title + "</span>");
		
		var avgRating = Database.getAverageRating(options.id, $.proxy(updateAverageRatingUI, this, elem));
		
		var myRating = Database.getMyRating(options.id);
		updateMyRatingUI(elem, myRating);
				
		elem.css( { visibility: "visible", display: "none", top: options.bottom - elem.outerHeight() } );
	}
	
	function updateMyRatingUI (elem, myRating) {
		var stars = elem.find(".star");
		if (myRating) {
			stars.removeClass("selected").slice(5 - myRating, 5).addClass("selected");
		} else {
			stars.removeClass("selected");
		}
	}
	
	function updateAverageRatingUI (elem, avgRating) {
		var s = "";
		
		if (avgRating == undefined) {
			s += "&#xf006;<br/>&#xf006;<br/>&#xf006;<br/>&#xf006;<br/>&#xf006;<br/>";
		} else {		
			for (var i = 0; i < avgRating; i++) {
				s += "&#xf005;<br/>";
			}
		}
		
		var p = elem.find(".pulltab p");
		elem.css("display", "block");
		
		p.html(s);
		
		var ph = p.parent().height();
		var h = p.height();
		
		elem.css("display", "none");
		
		var diff = (ph - h) * .5;
		p.css("marginTop", diff);
	}
	
});
