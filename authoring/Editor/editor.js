requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.custom",
	},
	
	shim: {
	},
});

require(["Spread"], function (Spread) {

	$("body").layout({ applyDefaultStyles: true,
						livePaneResizing: true,
						east__onresize: function () { spread.resizeLayoutPane(); },
						east__size: "40%"
					});

	var spread = new Spread("10_1");
	spread.initialize();

	var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents");
	function SpreadListModel () {
		 var self = this;
		 self.spreads = KnockoutFire.observable(firebase, {
			"$spread": {
				"id": true,
				"chapter": true,
				"title": true,
			}
		})
	
		self.showSpread = function (index) {
			spread.viewSpread(index);
		}
	}

	ko.applyBindings(new SpreadListModel(), $("#spreadModel")[0]);	
});

// TODO: getVariableProperties doesn't work when updating values (yes, I think it does; well, not now it doesn't)
// TODO: load published pages from json
// TODO: "glossary" style button
// TODO: handle glossary terms (ie, bold) within text
// TODO: ability to add extra properties
// TODO: button to add step and/or layout hint
// TODO: button to jump from content to its relevant layout hint
// TODO: collapsible columns
// TODO: template the sections
// TODO: image uploading (Firebase server?)
// TODO: backup and undo capability

// DONE: add a handle for the resizable
// DONE: view one spread at a time, selectable from list
// DONE: don't hard-code variable "cm"
// DONE: only show placement checkboxes for cells that have an associated image
// DONE: save the new width to the database
// DONE: add checkboxes for image position
// DONE: trigger cell resize when width is updated (ala checkbox subscribe method)
// DONE: set image placement checkboxes on load
// DONE: what if content and layout indices don't line up sometimes? [switched to id's]
// DONE: steps nicely set off in panels or wells
// DONE: textarea sized to fit
// DONE: custom fields for grid or fixed layouts (using knockout if binding)
// DONE: variable properties nicely formatted in a grid or table
// DONE: navbar for spread and layout info
// DONE: put "grid / fixed" field in content or layout – NOT BOTH
// BUG_FIXED: "grid / fixed" select keeps resetting, upon page reload, to the first option?! (first on the content side, now on the layout side... strange!) [valueAllowUnset seemed to do the trick]
// DONE: image placement as a 9-box selectable grid widget
// TODONT: move all image references to layout (nah)
