requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min"
	},
	
	shim: {
			"jqueryui": {
				export: "$" ,
				deps: ['jquery']
			}
		}
});

require(["jquery", "LayoutManager", "jqueryui"], function ($, LayoutManager) {
	$.getJSON("export.json", null, onData);

	var layout = new LayoutManager("#container");
	
	function onData (data, status, jqXHR) {
		layout.process(data.layouts, data.contents);
	}
});