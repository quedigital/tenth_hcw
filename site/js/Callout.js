define(["jquery", "jqueryui"], function ($) {

	// title, text, image
	Callout = function (options) {
		this.elem = $("<div>").addClass("open_callout");
		
		$("<h2>").text(options.title)
			.appendTo(this.elem);
				
		$("<p>").html(options.text).appendTo(this.elem);		
	}
	
	Callout.prototype = Object.create(null);
	Callout.prototype.constructor = Callout;

	return Callout;
});