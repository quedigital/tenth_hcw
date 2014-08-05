define([], function () {

	Video = function (options) {
		this.elem = $("<div>").addClass("video");
		
		var video = $("<video controls>");
		var src = $("<source>").attr( { src: options.image, type: "video/mp4" } );
		video.append(src);
		
		this.elem.append(video);
	}
	
	Video.prototype = Object.create(null);
	Video.prototype.constructor = Video;
	
	return Video;
});
