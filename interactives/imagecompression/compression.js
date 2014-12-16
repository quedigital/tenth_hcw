var f;

var images = new Array();
var compressionSetting;
var bird;
var pixelArray, myEncoder;
var slider;

var dragging = false;

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault() ;
}

$(document).ready(function () {
	initialize();
});

$(window).load(function () {
	begin();
});

function GetPos (e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft	+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	var pos = {x: posx, y: posy};
	return pos;
}

function loadImage (url) {
	images.push(url);
	var image = new Image();
	image.src = url;
	image.onload = function (evt) { checkForAllLoaded(url); }
	return image;
}

function checkForAllLoaded (url) {
	for (i = 0; i < images.length; i++) {
		if (images[i] == url) {
			images.splice(i, 1);
			break;
		}
	}
	
	if (images.length == 0) {
		begin();
	}
}

function initialize () {
	var id, xx, yy;
	
	$("body").bind("touchmove", BlockMove);
	
	/*
	for (var i = 0; i < 12; i++) {
		loadImage("catamaran" + i + ".jpg");
	}
	*/
	slider = loadImage("slider.png");

	$('#indicator')[0].ontouchstart = ontouchslider_move;
	$('#indicator')[0].ontouchmove = ontouchslider_move;
	
	$('#slider_arrow')[0].ontouchstart = ontouchslider_move;
	$('#slider_arrow')[0].ontouchmove = ontouchslider_move;
//	$('#slider')[0].ontouchend = ontouchslider_end;

	// mouse alternatives
	$('#slider_arrow')[0].onclick = ontouchslider_click;
	$('#indicator')[0].ondragstart = function (event) { event.preventDefault(); };
	$('#indicator')[0].onmousedown = ondragstart;
	$('#indicator')[0].onmousemove = ondragmove;
	$('#indicator')[0].onmouseup = ondragend;

	$("#dest")[0].ontouchstart = ontouchdest_start;
	$("#dest")[0].ontouchmove = ontouchdest_move;
	$("#dest")[0].ontouchend = ontouchdest_end;

	// mouse alternatives
	$('#dest')[0].ondragstart = function (event) { event.preventDefault(); };
	$("#dest")[0].onmousedown = ontouchdest_start;
	$(window)[0].onmousemove = ontouchdest_move;
	$(window)[0].onmouseup = ontouchdest_end;
	
	$("#source")[0].ontouchstart = ontouchsource_start;
	$("#source")[0].ontouchmove = ontouchsource_move;
	$("#source")[0].ontouchend = ontouchsource_end;

	// mouse alternatives
	$('#source')[0].ondragstart = function (event) { event.preventDefault(); };
	$("#source")[0].onmousedown = ontouchsource_start;
		   
//	$("#birdie").css("-webkit-transform", "scale(.25)");
}

function getCompressedFilename () {
	var filenumber = Math.floor(compressionSetting / (100 / 12));
	if (filenumber > 11) filenumber = 11;
	var src = "catamaran" + filenumber + ".jpg";
	return src;
}

function callbackFct (jpeg_version) {
	$("#dest")[0].src = getCompressedFilename();
	$("#glass_d-image").css("background-image", "url(" + getCompressedFilename() + ")");
	
	moveIndicatorTo(compressionSetting);	
}

function begin () {
	compressImage(10);	
}

function magnifySource (xx, yy) {  
	/* set variables with the width and height of the 
	   large and small versions of the picture */  
	var W = 750;  
	var H = 939;  
	var w = 435;  
	var h = 290;  
	
	var monaImage = $("#source");  
	var glassImage = $("#glass_s-image");  
	var glass = $("#glass_s");  
	
	/* position the glass div such that it is 
	   centered at the current location of the mouse */  
	glass.css("left", xx - 160 + "px").css("top", yy - 170 + "px");  
	
	/* calculate the position of the mouse on the small image */  
	var xs = xx - monaImage.offset().left;  
	var ys = yy - monaImage.offset().top - 50;  
	
	/* calculate the position of the glass "background" (magnified image) 
	   this is the distance to center minus the position on the large image */  
	var bx = glassImage.width()/2 - xs*W/w;  
	var by = glassImage.height()/2 - ys*H/h;  
	
	/* set the magnified image position */  
	glassImage.css("background-position", bx + "px " + by + "px");  
	
	// if mouse off the image far enough that big image no longer shows...
	/*
	if (bx<-W || by<-H || bx>150 || by>150) {  
		glass.fadeOut('fast');
	}
	*/
}

function magnifyDest(xx, yy) {  
	/* set variables with the width and height of the 
	   large and small versions of the picture */  
	var W = 750;  
	var H = 939;  
	var w = 435;  
	var h = 290;  
	
	/* create a few jQuery objects */  
	var monaImage = $("#dest");  
	var glassImage = $("#glass_d-image");  
	var glass = $("#glass_d");  
	
	/* position the glass div such that it is 
	   centered at the current location of the mouse */  
	glass.css("left", xx - 160 + "px").css("top", yy - 170 + "px");  
	
	/* calculate the position of the mouse on the small image */  
	var xs = xx - monaImage.offset().left;  
	var ys = yy - monaImage.offset().top - 50;  
	
	/* calculate the position of the glass "background" (magnified image) 
	   this is the distance to center minus the position on the large image */  
	var bx = glassImage.width()/2 - xs*W/w;  
	var by = glassImage.height()/2 - ys*H/h;  
	
	/* set the magnified image position */  
	glassImage.css("background-position",bx + "px " + by + "px");  
	
	// if mouse off the image far enough that big image no longer shows...
	/*
	if (bx<-W || by<-H || bx>150 || by>150) {  
		glass.fadeOut('fast');
	}
	*/
}

function ontouchslider_click (event) {
	var x = event.clientX;
	compressAtPoint(x);
	moveIndicatorTo(compressionSetting);
}

function ontouchslider_start (event) {
	var x = event.touches[0].clientX;
	compressAtPoint(x);
}

function ontouchdest_start (event) {
	$("#glass_s-image").css("background-image", "url(catamaran.png)");
	$("#glass_d-image").css("background-image", "url(" + getCompressedFilename() + ")");
	
	$("#glass_d").fadeIn('fast');
	
	if (event.touches) {
		magnifyDest(event.touches[0].pageX, event.touches[0].pageY);
	} else {
		magnifyDest(event.pageX, event.pageY);
		dragging = "dest";
	}
	
	$("#glass_s").fadeIn('fast');
	
	if (event.touches) {
		var xx = event.touches[0].pageX - $("#dest").offset().left + $("#source").offset().left;
		magnifySource(xx, event.touches[0].pageY);
	} else {
		var xx = event.pageX - $("#dest").offset().left + $("#source").offset().left;
		magnifySource(xx, event.pageY);
	}
}

function ontouchdest_move (event) {
	if (event.touches) {
		magnifyDest(event.touches[0].pageX, event.touches[0].pageY);
		var xx = event.touches[0].pageX - $("#dest").offset().left + $("#source").offset().left;
		magnifySource(xx, event.touches[0].pageY);
	} else if (dragging == "dest") {
		magnifyDest(event.pageX, event.pageY);
		var xx = event.pageX - $("#dest").offset().left + $("#source").offset().left;
		magnifySource(xx, event.pageY);
	} else if (dragging == "source") {
		magnifySource(event.pageX, event.pageY);
		var xx = event.pageX - $("#source").offset().left + $("#dest").offset().left;
		magnifyDest(xx, event.pageY);
	}
}

function ontouchdest_end (event) {
	$("#glass_d").fadeOut('fast');
	$("#glass_s").fadeOut('fast');
	dragging = false;
}

function ontouchsource_start (event) {
	$("#glass_s-image").css("background-image", "url(catamaran.png)");
	$("#glass_d-image").css("background-image", "url(" + getCompressedFilename() + ")");
	
	$("#glass_s").fadeIn('fast');
	
	if (event.touches) {
		magnifySource(event.touches[0].pageX, event.touches[0].pageY);
	} else {
		magnifySource(event.pageX, event.pageY);
		dragging = "source";
	}
	
	$("#glass_d").fadeIn('fast');
	
	if (event.touches) {
		var xx = event.touches[0].pageX - $("#source").offset().left + $("#dest").offset().left;
		magnifyDest(xx, event.touches[0].pageY);
	} else {
		var xx = event.pageX - $("#source").offset().left + $("#dest").offset().left;
		magnifyDest(xx, event.pageY);
	}
}

function ontouchsource_move (event) {
	if (event.touches) {
		magnifySource(event.touches[0].pageX, event.touches[0].pageY);
	} else if (dragging) {
		magnifySource(event.pageX, event.pageY);
	}
	
	if (event.touches) {
		var xx = event.touches[0].pageX - $("#source").offset().left + $("#dest").offset().left;
		magnifyDest(xx, event.touches[0].pageY);
	} else {
		var xx = event.pageX - $("#source").offset().left + $("#dest").offset().left;
		magnifyDest(xx, event.pageY);
	}
}

function ontouchsource_end (event) {
	$("#glass_s").fadeOut('fast');
	$("#glass_d").fadeOut('fast');
	dragging = false;
}

function compressImage (quality) {
	compressionSetting = quality;
	
	callbackFct();
	
	if (quality > 99) quality = 99;
	
	$("#info").text("Quality: " + quality + "%");
}

function moveIndicatorTo (quality) {	
	var x1 = $("#slider_arrow").offset().left;
	var w = $("#slider_arrow").width();
	
	var xx = x1 + (w * (quality / 100)) - 32;
	
	$("#indicator").css("left", xx + "px");
}

function compressAtPoint (x) {
	var x1 = $("#slider_arrow").offset().left;
	var w = $("#slider_arrow").width();
	var r = (x - x1) / w;
	if (r < .01) r = .01;
	else if (r > 1.0) r = 1.0;
	
	var quality = Math.ceil(r * 100);
	
	compressImage(quality);	
}

function ondragstart (event) {
	dragging = true;
	compressAtPoint(event.clientX);
}

function ondragmove (event) {
	if (dragging) {
		compressAtPoint(event.clientX);
	}
}

function ondragend (event) {
	dragging = false;
}

function ontouchslider_move (event) {
	var x;
	if (event.touches) {
		x = event.touches[0].clientX;
	} else if (event.button) {
		x = event.clientX;
	} else {
		return;
	}
	
	compressAtPoint(x);
	
//	console.log(event.touches);
	/*
	if (boat2.mode == "setting") {
		if (lastTouchBandwidth_x != undefined) {
			var xx = event.touches[0].clientX;
			
			var deltaX = xx - lastTouchBandwidth_x;
			var newBandwidth = boat2.bandwidth + deltaX * 400;
			boat2.bandwidth = Math.min(54000, Math.max(3000, newBandwidth));
			
			buildCargo(boat2);
		}
		
		lastTouchBandwidth_x = event.touches[0].clientX;
		
		changingSettings();
	}
	*/
}

function Zooming (params) {
}

Zooming.prototype = {
}
