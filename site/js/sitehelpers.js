define(["jquery", "jquery.colorbox", "wheelzoom", "Hammer"], function ($) {
	function showImageInLightbox ($img, text, identifier, background) {
		var img = $("<img>").attr("src", $img.attr("src")).css("width", "100%");
		
		var w = $img[0].naturalWidth;
		var h = $img[0].naturalHeight;
		
		var ww, hh;
		var w_w = window.innerWidth;
		var w_h = window.innerHeight;
		
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

		var cb = $.colorbox({ inline: true, href: img, innerHeight: hh, innerWidth: ww, title: s, className: "ourColorBox",
				onComplete: function () { customizeBox(cb, img); }
			});
			
		$("#cboxLoadedContent").css("background", background);
//		$(".colorBox").click(function () { $.colorbox.close(); });
//		wheelzoom(img);		
	}
	
	function customizeBox (cb, img) {
		var btn = $("<button>", { id: "zoomin", class: "basic" }).append("<i class='fa fa-2x fa-search-plus'>");
		$("#cboxLoadedContent").append(btn);
		btn.click(function () { img[0].dispatchEvent(new CustomEvent("wheelzoom.zoomin")); });
		
		var btn = $("<button>", { id: "zoomout", class: "basic" }).append("<i class='fa fa-2x fa-search-minus'>");
		$("#cboxLoadedContent").append(btn);
		btn.click(function () { img[0].dispatchEvent(new CustomEvent("wheelzoom.zoomout")); });
		
		wheelzoom(img);
	}

	var SiteHelpers = {
		showImageInLightbox: showImageInLightbox,
	};
	
	return SiteHelpers;	
});