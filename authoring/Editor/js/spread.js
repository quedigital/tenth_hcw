define(["gridder", "fixer"], function () {
	ko.bindingHandlers.getVariableProperties = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			// This will be called when the binding is first applied to an element
			// Set up any initial state, event handlers, etc. here
			var value = valueAccessor();
			var valueUnwrapped = ko.unwrap(value);

			for (var key in valueUnwrapped) {
				if (key != "firebase") {
					var value = valueUnwrapped[key];
					var a = $("<input>").attr("value", key);//.attr("data-bind", "value: bob");// + key);
					var b = $("<input>").attr("value", value);//.attr("data-bind", "value: bob");// + value);
					var c = $("<td>").append(a);
					var d = $("<td>").append(b);
					$(element).append($("<tr>").append(c).append(d));
				}
			}
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			// This will be called once when the binding is first applied to an element,
			// and again whenever the associated observable changes value.
			// Update the DOM element based on the supplied values here.
		}
	};

	ko.bindingHandlers.autosize = {
		init: function (element, valueAccessor, allBindingsAccessor) {
			ko.applyBindingsToNode(element, { value: valueAccessor() });        

			$(element).autosize();
		}
	};

	/* SpreadListModel */
	
	function SpreadListModel () {
		var self = this;
		
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents");
	
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

	/* Content Model */
	
	var ContentModel2 = {
		content: ko.observable(null)
	}
	
	var firebase2 = new Firebase("https://howcomputerswork.firebaseio.com/contents/0");
	var schema2 = {
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
								title: true,
							},
						}
					};
	
	function ContentModel (index) {
		var self = this;
		
		self.content = ko.observable(null);
	
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
								title: true,
							},
						}
					};
			
		self.viewContentForSpread = function (index) {
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents/" + index);
			// set the spread observable to the new firebase data
			self.content(KnockoutFire.observable(firebase, schema));
		}
		
		self.getCellType = function (id) {
			var cells = this.content()().cells();
			for (var i = 0; i < cells.length; i++) {
				var cell = cells[i]();
				if (cell.id() == id) {
					return cell.type();
				}
			}
		}
		
		self.viewContentForSpread(0);
	}

	/* LayoutModel */
	
	function LayoutModel (controller, index) {
		this.controller = controller;
		
		var self = this;
		
		self.layout = ko.observable(null);
	
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
								"theme": true,
							}
						}
					};
	
		self.viewLayoutForSpread = function (index) {
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/" + index);
			// set the spread observable to the new firebase data
			self.layout(KnockoutFire.observable(firebase, schema));
		}
		
		/*
		self.getSpreadStyle = function () {
			if (self && self.controller && self.controller.getSpreadStyle) {
				return self.controller.getSpreadStyle();
			}
			return self.controller.getSpreadStyle;
		}
		*/
		
		// TODO: try to get the cell type of the content for this id
		self.getCellType = function (id) {
			return this.controller.getCellType(id);
		}
		
		self.viewLayoutForSpread(0);
	}

	/* Spread */
	
	var SpreadController = function (id) {
		// TODO: get index from id
		this.content = new ContentModel(0);

		this.layout = new LayoutModel(this, 0);
		
		window.spread = this;
	}

	SpreadController.prototype = {};
	SpreadController.prototype.constructor = SpreadController;
	
	SpreadController.prototype.resizeLayoutPane = function () {
		$(".grid").trigger("reformat");
		$(".fixer").trigger("resize_layout");
	}
	
	SpreadController.prototype.viewSpread = function (index) {
		this.content.viewContentForSpread(index);

/*
		ContentModel2.content({
			firebase1: KnockoutFire.observable(firebase2, schema2)
		});
*/
	
		this.layout.viewLayoutForSpread(index);
	}
	
	SpreadController.prototype.initialize = function () {
		ko.applyBindings(this.content, $("#contentModel")[0]);
		ko.applyBindings(this.layout, $("#layoutModel")[0]);
	}
	
	SpreadController.prototype.getCellType = function (id) {
		return this.content.getCellType(id);
	}

	return SpreadController;
});