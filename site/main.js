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
	var params = window.location.search.substring(1);
	if (params == "local") {
		$.getJSON("export.json", null, onData);
	} else {
		$.getJSON("https://s3.amazonaws.com/HCW10/export.json", null, onData);
	}
	
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