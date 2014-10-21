define(["jquery", "jquery.colorbox"], function ($) {
	function showImageInLightbox ($img, text, identifier, background) {
		var img = $("<img>").attr("src", $img.attr("src")).css("width", "100%");
		
		var w = $img[0].naturalWidth;
		var h = $img[0].naturalHeight;
		
		var ww, hh;
		var w_w = $(window).width();
		var w_h = $(window).height();
		
		if (w/h > w_w/w_h) {
			var scale = (w_w * .8) / w;
			ww = "80%";
			hh = Math.ceil(((h * scale) / w_h) * 100) + "%";
		} else {
			var scale = (w_h * .8) / h;
			hh = "80%";
			ww = Math.floor(((w * scale) / w_w) * 100) + "%";
		}
		
		var s = $("<p>").html(text);
		if (identifier) {
			var id = $("<span class='id'>").text("(" + identifier + ")");
			s.append(id);
		}

		var cb = $.colorbox({ inline: true, href: img, innerHeight: hh, innerWidth: ww, title: s, className: "colorBox" });
		$("#cboxLoadedContent").css("background", background);
		$(".colorBox").click(function () { $.colorbox.close(); });
	}

	var SiteHelpers = {
		showImageInLightbox: showImageInLightbox,
	};
	
	return SiteHelpers;	
});