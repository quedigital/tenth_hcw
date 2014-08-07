define(["gridder", "fixer", "Helpers"], function (gridder, fixer, Helpers) {
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
	
	ko.bindingHandlers.cloudinary = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var id = bindingContext.$root.getID();
			$(element).append(
				$.cloudinary.unsigned_upload_tag("asset_upload", { cloud_name: 'hcw10', folder: id })
					.bind('cloudinarydone', function (e, data) {
						var observable = valueAccessor();
						observable(data.result.secure_url);
					})
					.bind('cloudinaryfail', function (e, data)  {
						console.log("failed");
						console.log(e);
						console.log(data);
					})
			);
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		}
	};

	/* SpreadListModel */
	
	function SpreadListModel () {
		var self = this;
		
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents");
		
		self.spreadArray = [];
	
		self.spreads = KnockoutFire.observable(firebase, {
			"$spread": {
				"id": true,
				"chapter": true,
				"number": true,
				"title": true,
			}
		});
		
		// NOTE: this catches additions and deletions but not text changes
		self.spreads.subscribe(function (changes) {
			self.rebuildSidebarMenu();			
		});
		
		self.rebuildSidebarMenu = function () {
			self.removeAllMenuItems();
			
			self.loadSpreadArrayFromFirebase();
						
			var sidebar = w2ui["toc_sidebar"];
			
			if (sidebar) {
				$.each(self.spreadArray, function (index, element) {
					var text = element.id + " " + element.title;
					sidebar.add([ { id: element.index, text: text, routeData: { index: element.index }, icon: "fa fa-list-alt" } ]);
				});
			}
		}
		
		self.loadSpreadArrayFromFirebase = function () {
			self.spreadArray = [];
			
			for (var i = 0; i < self.spreads().length; i++) {
				var s = self.spreads()[i]();
				var spread = { id: s.id(), chapter: s.chapter(), number: s.number(), title: s.title(), index: s.firebase.name() };
				self.spreadArray.push(spread);
			}
			
			self.spreadArray.sort(function (a, b) {
				var cha = parseInt(a.chapter), chb = parseInt(b.chapter);
				var numa = parseInt(a.number), numb = parseInt(b.number);
				
				if (cha < chb) return -1;
				else if (cha > chb) return 1;
				else {
					if (numa < numb) return -1;
					else if (numa > numb) return 1;
					else return 0;
				}
			});
		}

		// rebuild only the text
		self.rebuildSidebarMenuText = function () {
			self.loadSpreadArrayFromFirebase();
			
			var sidebar = w2ui["toc_sidebar"];
			
			for (var i = 0; i < self.spreadArray.length; i++) {
				var s = self.spreadArray[i];
				var text = s.id + " " + s.title;
				sidebar.nodes[i].id = s.index;
				sidebar.nodes[i].text = text;
				sidebar.nodes[i].routeData = { index: s.index };
				sidebar.nodes[i].icon = "fa fa-list-alt";
			}
			
			sidebar.refresh();
		}
		
		self.removeAllMenuItems = function () {
			var sidebar = w2ui["toc_sidebar"];
			var nd = [];
			if (sidebar) {
				for (var i in sidebar.nodes) nd.push(sidebar.nodes[i].id);
				sidebar.remove.apply(sidebar, nd);
			}
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
		
		self.getCellData = function (id, field) {
			// convert cells from Firebase to an array
			var cells = $.map(this.content()().cells(), function (el) { return el() } )
			for (var i = 0; i < cells.length; i++) {
				var cell_id = cells[i].id();
				if (cell_id == id) {
					return cells[i][field]();
				}
			}
			return undefined;
		}
		
		self.onSelectCell = function (data, event) {
			var selected = $(".cell-check:checked");
			self.controller.onSelectionChange(selected);
		}
		
		self.addNew = function (id, title, chapter, number) {
			self.content().firebase.parent().child(id).set( { id: id, title: title, chapter: chapter, number: number, cells: [] });
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
			
			self.content().firebase.child("cells/" + obj.id).set(obj);
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
		
		self.getFirebaseKeys = function () {
			var keys = [];
			var cells = self.content()().cells();
			$.each(cells, function (index, item) {
				keys.push(item().firebase.name());
			});
			return keys;
		}
		
		// return one higher than the highest numeric id so far, but use the firebase key not the content id!
		self.getUniqueID = function () {
			var ids = self.getFirebaseKeys();
			var max = 0;
			$.each(ids, function (index, item) {
				var n = parseInt(item);
				if (n > max) {
					max = n;
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
		
		self.getID = function () {
			return self.content()().id();
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
						"publish": true,
						"notes": true,
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
								"row": true,
								"col": true,
								"nonblocking": true,
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
		
		self.getCellData = function (id, field) {
			return this.controller.getCellData(id, field);
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
			self.layout().firebase.child("hints/" + id).set(defaults);
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
		
		self.getID = function () {
			return self.layout()().id();
		}			

		self.viewLayoutForSpread(0);
	}
	
	return { ContentModel: ContentModel, LayoutModel: LayoutModel, callbacks: callbacks }
});