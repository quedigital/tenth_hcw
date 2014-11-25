define(["Database", "jquery", "jquery.qtip", "jquery.autosize"], function (Database) {
	var OFFSCREEN_X = -350;
	
	var currentID;
	
	var justClickedClose = false;
	
	$.fn.ratingsSystem = function (command, options) {
		if (command == "initialize") {
			var settings = $.extend({
			}, options);
		
			this.hover($.proxy(openPanel, this, this), $.proxy(possiblyClosePanel, this, this));
			
			this.find("#commentArea").autosize();
		
			var stars = this.find(".star");
		
			stars.qtip( { content: { title: function () { return this.attr("data-title"); } }, style: { classes: 'qtip-dark' } } );
		
			stars.click($.proxy(onClickStar, this, this));
		
			this.find("#addComment").click($.proxy(addComment, this, this));
			this.find("#showComments").click($.proxy(toggleComments, this, this));
			this.find("#send-button").click($.proxy(postComment, this, this));
			this.find("#cancel-button").click($.proxy(addComment, this, this));
			
			this.find("#close-button").click($.proxy(closePanel, this, this));
			
		} else if (command == "update") {
			var b = options.bottomOf.position().top + options.bottomOf.outerHeight();
			
			var options = { bottom: b, title: options.title, id: options.id };
			
			currentID = options.id;
			
			// using animate because it is queued
			this.fadeOut().delay(1000).animate( { top: b, right: OFFSCREEN_X }, 0, $.proxy(initialize, this, this, options) ).delay(1000).fadeIn();
		}
		
		return this;
	}
	
	function openPanel (elem) {
		elem.css("right", 0);
	}
	
	function closePanel (elem) {
		elem.css("right", OFFSCREEN_X);
		justClickedClose = true;
		
		// close the sub-panels
		setTimeout(function () {
			elem.find(".commentEntry").hide(0);
			elem.find(".comments").hide(0);
		}, 500);
	}
	
	// close the panel if we hover out and no sub-panels are open and we didn't just clicked the close button
	function possiblyClosePanel (elem) {
		if (!justClickedClose && (!elem.find(".commentEntry").is(":visible") && !elem.find(".comments").is(":visible"))) {
			closePanel(elem);
		}
		justClickedClose = false;
	}
	
	function postComment (elem) {
		var c = $(elem).find("#comment").val();
		
		if (c) {
			var options = { name: $(elem).find("#name").val(), comment: c, moderated: false };
		
			Database.addComment(currentID, options, $.proxy(showComments, this, elem));
		}
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
	
	function toggleComments (elem) {
		if ($(elem).find(".comments").is(":visible")) {
			$(elem).find(".comments").hide("fade");
		} else {
			var comments = Database.getComments(currentID, $.proxy(updateCommentsUI, this, this));		
		}
	}
	
	function showComments (elem) {
		var comments = Database.getComments(currentID, $.proxy(updateCommentsUI, this, this));		
	}
	
	function updateCommentsUI (elem, comments) {
		var scroller = elem.find(".scroller").empty();
	
		if (comments.length) {
			for (var each in comments) {
				scroller.append("<p><span>" + (comments[each].name ? comments[each].name : "Anonymous") + ": </span><span>" + comments[each].comment + "</span></p>");
			}
		} else {
			scroller.append($("<p>Questions? Comments?<br/>Tell us what you liked, what you learned, or what you'd like to know more about.</p><p><em>Add a comment!</em></p>"));
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
		elem.find(".comments").hide(0);
		elem.find(".commentEntry").hide(0);
		
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
