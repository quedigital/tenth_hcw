requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.custom",
	},
	
	shim: {
	},
});

require([], function () {

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
		
		var table = $("<table>").addClass("table");
		table.append($("<thead><tr><th>Property</th><th>Value</th></tr></thead>"));
		var tbody = $("<tbody>");
		
		for (var key in valueUnwrapped) {
			if (key != "firebase") {
				var value = valueUnwrapped[key];
				var a = $("<input>").addClass("form-control").attr("value", key);
				var b = $("<input>").addClass("form-control").attr("value", value);
				var c = $("<td>").append(a);
				var d = $("<td>").append(b);
				tbody.append($("<tr>").append(c).append(d));
			}
		}
		table.append(tbody);
		$(element).append(table);
    }
};

ko.bindingHandlers.autosize = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		ko.applyBindingsToNode(element, { value: valueAccessor() });        

		$(element).autosize();
	}
};

var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents/0");

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
	
	console.log(index);
	
	self.spread = KnockoutFire.observable(firebase, schema);
	
	self.viewSpread = function (index) {
		console.log("trying to view " + index);
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents/" + index);
		// set the spread observable to the new firebase data
		self.spread(KnockoutFire.observable(firebase, schema));
	}
}

/*
var contentModel = {
    "spreads": KnockoutFire.observable(firebase, {
            "$spread": {
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
            },
        }),
    "removeItem": function(item) {
//		firebase.child(item.firebase.name()).remove();
    }
};
*/
var cm = new ContentModel(0);

ko.applyBindings(cm, $("#contentModel")[0]);

var firebase2 = new Firebase("https://howcomputerswork.firebaseio.com/layouts");
var layoutModel = {
	"layouts": KnockoutFire.observable(firebase2, {
		"$layout": {
			"id": true,
			"style": true,
			"hints": {
				"$hint": {
					"image": true,
					"width": true,
					"imageCSS": true
				}
			}
		}
	})
};
ko.applyBindings(layoutModel, $("#layoutModel")[0]);

var firebase3 = new Firebase("https://howcomputerswork.firebaseio.com/contents");

function SpreadListModel () {
	 var self = this;
	 self.spreads = KnockoutFire.observable(firebase3, {
		"$spread": {
			"id": true,
			"chapter": true,
			"title": true,
		}
	})
	
	self.showSpread = function (index) {
		console.log("show spread " + index);
		cm.viewSpread(index);
	}
}

ko.applyBindings(new SpreadListModel(), $("#spreadModel")[0]);

// NOTE: contentModel.items()[1]().cells()[0]().text() = "When you click..."
// AND: contentModel.items()[1]().cells().length = 8
// ... so we should be able to use this!
});

// BUG: "grid / fixed" select keeps resetting to first option?!
// TODO: put "grid / fixed" field in content or layout – NOT BOTH
// TODO: view one spread at a time, selectable from list
// TODO: load published pages from json
// TODO: tie layout cells to content cells (rather than rely on indices)?
// TODO: ability to add extra properties and cells, etc.
// TODO: button to jump from content to its relevant layout hint
// TODO: collapsible columns
// TODO: template the sections
// TODO: image placement as a 9-box selectable grid widget
// TODO: image uploading (Firebase server?)
// TODO: backup and undo capability
// TODO: handle glossary terms (ie, bold) within text

// DONE: steps nicely set off in panels or wells
// DONE: textarea sized to fit
// DONE: custom fields for grid or fixed layouts (using knockout if binding)
// DONE: variable properties nicely formatted in a grid or table
// DONE: navbar for spread and layout info
