define(["gridder"], function (gridder) {
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
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents/" + index);
			// set the spread observable to the new firebase data
			self.spread(KnockoutFire.observable(firebase, schema));
		}
	}

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

	var Spread = function (id) {
		// TODO: get index from id
		this.cm = new ContentModel(0);
		ko.applyBindings(this.cm, $("#contentModel")[0]);

		this.lm = new LayoutModel(0);
		ko.applyBindings(this.lm, $("#layoutModel")[0]);
		
		// create our gridder element
		this.grid = new gridder.Gridder($(".grid"));
	}

	Spread.prototype = {};
	Spread.prototype.constructor = Spread;
	
	Spread.prototype.resizeLayoutPane = function () {
		this.grid.reformat();
	}
	
	Spread.prototype.viewSpread = function (index) {
		this.cm.viewSpread(index);
		this.lm.viewSpread(index);
	}

	return Spread;
});