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
	$.getJSON("export.json", null, onData);
//	$.getJSON("https://res.cloudinary.com/hcw10/raw/upload/data_file.json", null, onData);

	var layout = new LayoutManager("#container");
	
	function onData (data, status, jqXHR) {
		layout.process(data.layouts, data.contents);
	}
	
	/*
	$(window).resize(function () {
		layout.reflow();
	});
	*/
});