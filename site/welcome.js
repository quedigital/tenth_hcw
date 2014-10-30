requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0",
		"jquery.ui": "jquery-ui-1.10.4.custom.min",
		"Helpers": "../../common/js/Helpers",
	},
	
	shim: {
			"jquery": {
				export: "$",
			},
			"jquery.ui": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.panelSnap": {
				export: "$",
				deps: ['jquery']
			},
	}
});

require(["jquery", "jquery.ui", "jquery.panelSnap"], function ($) {
	var params = window.location.search.substring(1);
	
	$(function () {
		$('body').panelSnap();
		
		var s = $(".menu_demo .panels").panelSnap();
	});
});