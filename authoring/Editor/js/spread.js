define(["gridder", "fixer"], function () {
	// NOTE: Gah, I couldn't get these sorting options to stick from event.js; hence these horrible workarounds
	var callbacks = {
		onSortStart: function () { console.log("no"); },
		onSortUpdate: function () { console.log("nope nope nope"); },
		onSortStop: function () { console.log("no way"); },
	};
	
	var kludgyOnSortStart = function (event, ui) {
		callbacks.onSortStart(event, ui);
	}

	var kludgyOnSortStop = function (event, ui) {
		callbacks.onSortStop(event, ui);
	}
	
	// NOTE: for some reason, these settings wouldn't stick if placed in editor.js
	ko.bindingHandlers.sortable.options = {
											placeholder: "sortable-placeholder",
											handle: ".cell-left",
											opacity: .7,
											cursor: "move",
											axis: "y",
											tolerance: "pointer",
											start: kludgyOnSortStart,
											stop: kludgyOnSortStop,
	};

	ko.bindingHandlers.sortable.afterMove = function (arg, event, ui) {
												callbacks.onSortUpdate(event, ui);
											};
											
	ko.bindingHandlers.editableText = {
		init: function (element, valueAccessor) {
			$(element).on('blur', function() {
				var observable = valueAccessor();
				observable( $(this).html() );
			});
			
			$(element).on("bob", function () {
				console.log("writing");
				var observable = valueAccessor();
				observable( $(this).html() );
			});
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).html(value);
		}
	};
	
	ko.bindingHandlers.firebaseRef = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var firebaseRef = viewModel.firebase.name();
			$(element).data("firebaseRef", firebaseRef);
		}
	};
	
	ko.bindingHandlers.sidebarItem = {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var text = bindingContext.$data.id() + " " + bindingContext.$data.title();
			var index = bindingContext.$index();
			
			// this catches changes to spread id and title (but not additions or deletions)
			valueAccessor().subscribe(function (changes) {
				spreadList.rebuildSidebarMenuText();
			});
		},
		
		// this catches additions but not changes or deletions
		update: function (element, valueAccessor) {
		}
	};

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
		});
		
		// NOTE: this catches additions and deletions but not text changes
		self.spreads.subscribe(function (changes) {
			self.rebuildSidebarMenu();			
		});
		
		self.rebuildSidebarMenu = function () {
			self.removeAllMenuItems();
			
			var sidebar = w2ui["toc_sidebar"];
			for (var i = 0; i < self.spreads().length; i++) {
				var s = self.spreads()[i]();
				var text = s.id() + " " + s.title();
				var index = s.firebase.name();
				sidebar.add([ { id: index, text: text, routeData: { index: index }, icon: "fa fa-list-alt" } ]);
			}
		}

		// rebuild only the text
		self.rebuildSidebarMenuText = function () {
			var sidebar = w2ui["toc_sidebar"];
			for (var i = 0; i < self.spreads().length; i++) {
				var s = self.spreads()[i]();
				var text = s.id() + " " + s.title();
				var index = s.firebase.name();
				sidebar.nodes[i].id = index;
				sidebar.nodes[i].text = text;
				sidebar.nodes[i].routeData = { index: index };
				sidebar.nodes[i].icon = "fa fa-list-alt";
			}
			sidebar.refresh();
		}
		
		self.removeAllMenuItems = function () {
			var sidebar = w2ui["toc_sidebar"];
			var nd = []; 
			for (var i in sidebar.nodes) nd.push(sidebar.nodes[i].id);
			sidebar.remove.apply(sidebar, nd);
		}
	}
	
	var spreadList = new SpreadListModel();

	ko.applyBindings(spreadList, $("#spreadModel")[0]);

	/* Content Model */
	
	function ContentModel (controller, index) {
		this.controller = controller;
		
		var self = this;
		
		self.content = ko.observable(null);
		
		var defaults = { id: "New", type: "step" };
	
		var schema = {
						"id": true,
						"chapter": true,
						"number": true,
						"title": true,
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
		
		self.onSelectCell = function (data, event) {
			var selected = $(".cell-check:checked");
			self.controller.onSelectionChange(selected);
		}
		
		self.addNew = function (id, title) {
			self.content().firebase.parent().child(id).set( { id: id, title: title, cells: [] });
		}
		
		self.removeByID = function (id) {
			// this worked to disable knockout, but we'd have to reapply bindings, I think
//			var element = $("#contentModel")[0];
//			ko.cleanNode(element);
			// remove from Firebase
			self.content().firebase.parent().child(id).remove();
			
			// NOTE: temporarily disable Knockout so the data isn't auto-repopulated (kludgy?)
			var dummy = function () { return { chapter: "", number: "", title: "", id: "", cells: function () { return []; } } };
			self.content(dummy);
		}
		
		self.addNewCell = function () {
			var obj = $.extend({}, defaults);
			obj.id = self.getUniqueID();
			
			self.content().firebase.child("cells").push(obj);
		}
		
		self.removeCellFromFirebaseByFirebaseRef = function (firebaseRef) {
			var cell = self.content().firebase.child("cells/" + firebaseRef);
			self.content().firebase.child("cells/" + firebaseRef).remove();
		}
		
		self.removeCellFromKnockoutByFirebaseRef = function (firebaseRef) {
			self.content()().cells.remove(function (cell) {
				return cell().firebase.name() === firebaseRef;
			});
		}
		
		self.getIDs = function () {
			var ids = [];
			var cells = self.content()().cells();
			$.each(cells, function (index, item) {
				ids.push(item().id());
			});
			return ids;
		}
		
		// return one higher than the highest numeric id so far
		self.getUniqueID = function () {
			var ids = self.getIDs();
			var max = 0;
			$.each(ids, function (index, item) {
				if (item > max) {
					max = item;
				}
			});
			return max + 1;
		}
		
		self.getDisplayOrder = function () {
			var c = $("#cells .cell");
			return c.map(function (index, element) { return $(element).data("id"); }).toArray();
		}
		
		self.setSortOrder = function (ids) {
			$.each(ids, function (index, id) {
				var ref = self.content().firebase.child("cells/" + id);
				ref.setPriority(index);
			});
		}
		
		self.getData = function (callback) {
			var firebaseRef = self.content().firebase.root();
			firebaseRef.once('value', function (dataSnapshot) {
				var data = dataSnapshot.exportVal();
				callback(data);
			});
		}
		
		self.setData = function (data) {
			var firebaseRef = self.content().firebase.root();
			firebaseRef.set(data, function (error) {
				console.log(error);
			});
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
								"anchor": true,
								"theme": true,
								"backgroundColor": true,
								"marginTop": true,
							}
						}
					};
	
		self.viewLayoutForSpread = function (index) {
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/" + index);
			// set the spread observable to the new firebase data
			self.layout(KnockoutFire.observable(firebase, schema));
		}
		
		self.getCellType = function (id) {
			return this.controller.getCellType(id);
		}

		self.getIDs = function () {
			var ids = [];
			var hints = self.layout()().hints();
			$.each(hints, function (index, item) {
				ids.push(item().id());
			});
			return ids;
		}
		
		self.addNewHint = function (id) {
			var style = self.layout()().style();
			var defaults = {};
			switch (style) {
				case "grid":
					defaults = { id: id, width: 1,  };
					break;
				case "fixed":
					defaults = { id: id, bounds: [10, 10, 100, 100], anchor: "TL" };
					break;
			}
			self.layout().firebase.child("hints").push(defaults);
		}
		
		self.removeHintByID = function (id) {
			var hints = self.layout()().hints();
			$.each(hints, function (index, item) {
				if (item().id() == id) {
					item().firebase.remove();
					return false;
				}
			});
		}
		
		self.addNew = function (id, title) {
			self.layout().firebase.parent().child(id).set( { id: id, style: "grid", hints: [] });
		}		

		self.removeByID = function (id) {
			self.layout().firebase.parent().child(id).child("hints").remove();
			self.layout().firebase.parent().child(id).remove();
		}		

		self.viewLayoutForSpread(0);
	}
	
	return { ContentModel: ContentModel, LayoutModel: LayoutModel, callbacks: callbacks }
});