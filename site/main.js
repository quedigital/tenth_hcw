requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min",
		"Helpers": "../../common/js/Helpers",
	},
	
	shim: {
			"jqueryui": {
				export: "$" ,
				deps: ['jquery']
			}
		}
});

require(["jquery", "LayoutManager"], function ($, LayoutManager) {
//	$.getJSON("export.json", null, onData);
//	$.getJSON("https://res.cloudinary.com/hcw10/raw/upload/export.json", null, onData);
//	$.getJSON("file:///users/ubarrc6/Downloads/export.json", null, onData);
<<<<<<< HEAD
	$.getJSON("file:///users/uhaweky/Downloads/export.json", null, onData);
=======
//	$.getJSON("file:///users/uhaweky/Downloads/export.json", null, onData);
	$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
>>>>>>> FETCH_HEAD

	var layout = new LayoutManager("#container");
	
	function onData (data, status, jqXHR) {
		layout.process(data.layouts, data.contents);
	}
	
	$(window).on("reflow", function () {
		layout.reflow();
	});
	
	/*
	$(window).resize(function () {
		layout.reflow();
	});
	*/
});