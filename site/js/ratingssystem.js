define(["Database", "jquery", "jquery.qtip", "jquery.autosize"], function (Database) {
	var OFFSCREEN_X = -350;
	
	var justClickedClose = false;
	
	$.fn.ratingsSystem = function (command, options) {
		if (command == "initialize") {
			var settings = $.extend({
			}, options);
			
			this.options = options;

			$("<div>", { class: "pulltab" }).html('<p>&#xf005;<br/>&#xf005;<br/>&#xf005;<br/></p><div class="commentflag" title="This page has user comments."><i class="fa fa-comments-o"></i></div>').appendTo(this);
			
			$("<div>", { class: "mainarea" }).html('<h1>What did you think?</h1><button id="close-button"><i class="fa fa-times"></i></button><p id="ratingLabel">Your rating:</p><div class="rating"><span id="star5" class="star" data-title="Great!"></span><span id="star4" class="star" data-title="Pretty good!"></span><span id="star3" class="star" data-title="Ok"></span><span id="star2" class="star" data-title="Meh"></span><span id="star1" class="star" data-title="Nope"></span></div><a id="showComments" ref="">Show comments</a><a id="addComment" ref="">Add comment</a>').appendTo(this);
			
			$("<div>", { class: "commentEntry" }).html('<p>Your Name: <span>(optional)</span></p><input type="text" id="name"/><p>Comment:</p><textarea id="comment"></textarea><button id="send-button">Send</button><button id="cancel-button">Cancel</button>').appendTo(this);
			
			$("<div>", { class: "comments" }).html('<div class="scroller"></div>').appendTo(this);
			
			this.find(".pulltab").click($.proxy(openPanel, this, this));
			
			this.hover($.proxy(openPanel, this, this), $.proxy(possiblyClosePanel, this, this));
			
			this.find("#commentArea").autosize();
		
			var stars = this.find(".star");
		
			stars.qtip( {
							content: {
										title: function () { return this.attr("data-title"); },
										text: function () { return this.attr("data-text"); }
									},
							style: { classes: 'qtip-dark' }
						} );
		
			stars.click($.proxy(onClickStar, this, this));
		
			this.find("#addComment").click($.proxy(addComment, this, this));
			this.find("#showComments").click($.proxy(toggleComments, this, this));
			this.find("#send-button").click($.proxy(postComment, this, this));
			this.find("#cancel-button").click($.proxy(addComment, this, this));
			
			this.find("#close-button").click($.proxy(closePanel, this, this));

			this.find(".commentflag").qtip();

			this.on("openRatings", $.proxy(openPanel, this, this));
			
			initialize.call(this, this, options);
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
	
	// close the panel if we hover out and no sub-panels are open and we didn't just click the close button
	function possiblyClosePanel (elem) {
		if (!justClickedClose && (!elem.find(".commentEntry").is(":visible") && !elem.find(".comments").is(":visible"))) {
			closePanel(elem);
		}
		justClickedClose = false;
	}
	
	function postComment (elem) {
		var c = $(elem).find("#comment").val();
		
		if (c && this.options.id) {
			var options = { name: $(elem).find("#name").val(), comment: c, moderated: false };
		
			Database.addComment(this.options.id, options, $.proxy(showComments, this, elem));
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
		} else if (this.options.id) {
			var comments = Database.getComments(this.options.id, $.proxy(updateCommentsUI, this, this));		
		}
	}
	
	function showComments (elem) {
		if (this.options.id)
			Database.getComments(this.options.id, $.proxy(updateCommentsUI, this, this));		
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
		
		if (this.options.id) {
			Database.setMyRating(this.options.id, rating);
		}
		
		elem.trigger("rating");
	}
	
	function initialize (elem, options) {
		// position on-screen
//		elem.position( { my: "left top+40px", at: "right bottom", of: options.bottomOf, collision: "none" } );
		// and then eliminate left (so "right" overrides it and it's off-screen again)
		elem.css("left", "");
		
		elem.find(".comments").hide(0);
		elem.find(".commentEntry").hide(0);
		
		elem.find("h1").html("What did you think of <span>" + options.title + "</span>");
		
		elem.find("#star5").attr("data-text", "Now I know exactly <b>" + options.title + "</b>");
		elem.find("#star4").attr("data-text", "I learned a lot about <b>" + options.title + "</b>");
		elem.find("#star3").attr("data-text", "I <em>think</em> I get <b>" + options.title + "</b>");
		elem.find("#star2").attr("data-text", "I would like to know more about <b>" + options.title + "</b>");
		elem.find("#star1").attr("data-text", "I still don't understand <b>" + options.title + "</b>");
		
		var avgRating = Database.getAverageRating(options.id, $.proxy(updateAverageRatingUI, this, elem));
		
		var myRating = Database.getMyRating(options.id);
		updateMyRatingUI(elem, myRating);

		Database.getComments(options.id, $.proxy(showOrHideCommentsIndicator, this, this));
	}

	function showOrHideCommentsIndicator (elem, comments) {
		var v = comments.length > 0;
		elem.find(".commentflag").css( { display: v ? "block" : "none" } );
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
//		elem.css("display", "block");
		
		p.html(s);
		
		var ph = p.parent().height();
		var h = p.height();
		
//		elem.css("display", "none");
		
		var diff = (ph - h) * .5;
		p.css("marginTop", diff);
	}
	
});
