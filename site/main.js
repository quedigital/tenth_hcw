requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jqueryui": "jquery-ui-1.10.4.custom.min"
	},
	
	shim: {
	},
});

require(["jquery", "LayoutManager", "fastclick.min"], function ($, LayoutManager, FastClick) {
	$.getJSON("export.json", null, onData);

	var layout = new LayoutManager("#container");
	
	function onData (data, status, jqXHR) {
		layout.process(data.layouts, data.contents);
		
//		FastClick.attach(document.body);
	}
});