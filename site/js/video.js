define([], function () {

	Video = function (options) {
		this.elem = $("<div>").addClass("video");

		this.elem.data("video", this);
		
		this.video = $("<video controls>").css("width", "100%");
		
		if (options.text) {
			this.video.attr("poster", options.text);
		}
		
		var src = $("<source>").attr( { src: options.image, type: "video/mp4" } );
		this.video.append(src);
		
		this.elem.append(this.video);
		
		this.video.on("loadeddata", $.proxy(this.onLoaded, this));
	}
	
	Video.prototype = Object.create(null);
	Video.prototype.constructor = Video;
	
	// resize and fit the video on the layout
	Video.prototype.onLoaded = function (event) {
		$(window).trigger("reflow");
	}
	
	return Video;
});
