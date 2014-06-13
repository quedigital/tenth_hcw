requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.custom",
	},
	
	shim: {
	},
});

require(["gridder"], function (gridder) {

$("body").layout({ applyDefaultStyles: true, livePaneResizing: true });

// create our gridder element
var grid = new gridder.Gridder($(".grid"));

ko.bindingHandlers.getVariableProperties = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
		var value = valueAccessor();
		var valueUnwrapped = ko.unwrap(value);
		
		for (var key in valueUnwrapped) {
			if (key != "firebase") {
				var value = valueUnwrapped[key];
				var a = $("<input>").attr("value", key);
				var b = $("<input>").attr("value", value);
				var c = $("<td>").append(a);
				var d = $("<td>").append(b);
				$(element).append($("<tr>").append(c).append(d));
			}
		}
    }
};

ko.bindingHandlers.autosize = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		ko.applyBindingsToNode(element, { value: valueAccessor() });        

		$(element).autosize();
	}
};

function ContentModel (index) {
	var self = this;
	
	var schema = {
					"id": true,
					"chapter": true,
					"title": true,
					"type": true,
					"background": true,
					"cells": {
						"$cell": {
							id: true,
							text: true,
							type: true,
							image: true,
							number: true,
						},
					}
				};
	
	var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents/0");
	self.spread = KnockoutFire.observable(firebase, schema);
	
	self.viewSpread = function (index) {
		console.log("trying to view " + index);
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents/" + index);
		// set the spread observable to the new firebase data
		self.spread(KnockoutFire.observable(firebase, schema));
	}
}

var cm = new ContentModel(0);
ko.applyBindings(cm, $("#contentModel")[0]);

function LayoutModel (index) {
	var self = this;
	
	var schema = {
					"id": true,
					"style": true,
					"hints": {
						"$hint": {
							"id": true,
							"image": true,
							"width": true,
							"imageCSS": true
						}
					}
				};
	
	var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/0");
	self.spread = KnockoutFire.observable(firebase, schema);
	
	self.viewSpread = function (index) {
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/" + index);
		// set the spread observable to the new firebase data
		self.spread(KnockoutFire.observable(firebase, schema));
	}	
}

var lm = new LayoutModel(0);
ko.applyBindings(lm, $("#layoutModel")[0]);

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
		console.log("show spread " + index);
		cm.viewSpread(index);
		lm.viewSpread(index);
	}
}

ko.applyBindings(new SpreadListModel(), $("#spreadModel")[0]);

//var grid = new gridder.Gridder($(".grid"));
window.gridder = gridder;
    
});

// BUG: "grid / fixed" select keeps resetting, upon page reload, to the first option?! (first on the content side, now on the layout side... strange!)
// TODO: only show placement checkboxes for cells that have an associated image
// TODO: don't hard-code variable "cm"
// TODO: put "grid / fixed" field in content or layout – NOT BOTH
// TODO: view one spread at a time, selectable from list
// TODO: load published pages from json
// TODO: ability to add extra properties and cells, etc.
// TODO: button to jump from content to its relevant layout hint
// TODO: collapsible columns
// TODO: template the sections
// TODO: image placement as a 9-box selectable grid widget
// TODO: image uploading (Firebase server?)
// TODO: backup and undo capability
// TODO: handle glossary terms (ie, bold) within text

// DONE: trigger cell resize when width is updated (ala checkbox subscribe method)
// DONE: set image placement checkboxes on load
// DONE: what if content and layout indices don't line up sometimes? [switched to id's]
// DONE: getVariableProperties doesn't work when updating values (yes, I think it does)
// DONE: steps nicely set off in panels or wells
// DONE: textarea sized to fit
// DONE: custom fields for grid or fixed layouts (using knockout if binding)
// DONE: variable properties nicely formatted in a grid or table
// DONE: navbar for spread and layout info
