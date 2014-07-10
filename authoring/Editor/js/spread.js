define(["gridder", "fixer"], function () {
	ko.bindingHandlers.getVariableProperties = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			// This will be called when the binding is first applied to an element
			// Set up any initial state, event handlers, etc. here
			var value = valueAccessor();
			var valueUnwrapped = ko.unwrap(value);
			
			var field;
			
			for (var key in valueUnwrapped) {
				if (key != "firebase") {
					var value = valueUnwrapped[key];
					var a = $("<span>").text(key);
					var b = $("<input>").attr("value", value);
					var c = $("<td>").append(a);
					var d = $("<td>").append(b);
					$(element).append($("<tr>").append(c).append(d));
					
					// TODO: this doesn't work to make these properties updateable
					field = b;
//					ko.applyBindingsToNode(b, { value: "marginLeft" });					
				} else {
					ko.applyBindingsToNode(field, { value: valueUnwrapped[key] });
				}
			}
		},
		
		updateX: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			// This will be called once when the binding is first applied to an element,
			// and again whenever the associated observable changes value.
			// Update the DOM element based on the supplied values here.
			var value = valueAccessor();
			var valueUnwrapped = ko.unwrap(value);
			
			for (var key in valueUnwrapped) {
				if (key != "firebase") {
					var value = valueUnwrapped[key];
					var a = $("<span>").text(key);
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

	function LayoutModel (controller, index) {
		this.controller = controller;
		
		var self = this;
	
		var schema = {
						"id": true,
						"style": true,
						"background": true,
						"hints": {
							"$hint": {
								"id": true,
								"image": true,
								"width": true,
								"styling": true,
								"bounds": true,
							}
						}
					};
	
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/0");
		self.spread = KnockoutFire.observable(firebase, schema);
	
		self.viewSpread = function (index) {
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/" + index);
			// set the spread observable to the new firebase data
			// TODO: this adds an unnecessary layer of indirection to spread
			self.spread(KnockoutFire.observable(firebase, schema));
		}
		
		self.getSpreadStyle = function () {
			if (self && self.controller && self.controller.getSpreadStyle) {
				return self.controller.getSpreadStyle();
			}
			return self.controller.getSpreadStyle;
		}
	}

	var Spread = function (id) {
		// TODO: get index from id
		this.content = new ContentModel(0);

		this.layout = new LayoutModel(this, 0);
		
		window.spread = this;
	}

	Spread.prototype = {};
	Spread.prototype.constructor = Spread;
	
	Spread.prototype.resizeLayoutPane = function () {
		$(".grid").trigger("reformat");
		$(".fixer").trigger("resize_layout");
	}
	
	Spread.prototype.viewSpread = function (index) {
		this.content.viewSpread(index);
		this.layout.viewSpread(index);
	}
	
	Spread.prototype.initialize = function () {
		ko.applyBindings(this.content, $("#contentModel")[0]);
		ko.applyBindings(this.layout, $("#layoutModel")[0]);
	}

	return Spread;
});