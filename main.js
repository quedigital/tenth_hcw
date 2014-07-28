requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.custom.min"
	},
	
	shim: {
	},
});

require(["jquery"], function ($) {
	console.log("Starting!");
});