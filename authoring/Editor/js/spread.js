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
	
	ko.bindingHandlers.uploadToS3 = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var id = bindingContext.$root.getID();
			
			var input = $("<input type='file' class='file-chooser' />");
			input.change(uploadFile);
			
			$(element).append(input);
			
			function uploadFile (event) {
				var file = event.target.files[0];
				if (file) {
					$(element).trigger("upload", [file, id, valueAccessor()]);
					input[0].value = null;
				}
			}
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
	
	ko.bindingHandlers.slider = {
		init: function (element, valueAccessor, allBindingsAccessor) {
			ko.utils.registerEventHandler(element, "slidechange", function (event, ui) {
				var observable = valueAccessor();
				observable(ui.value);
			});
			// NOTE: not sure if this is required (I'm not doing it anywhere else)
			ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
				$(element).slider("destroy");
			});
			ko.utils.registerEventHandler(element, "slide", function (event, ui) {
				var observable = valueAccessor();
				observable(ui.value);
			});
		},
		update: function (element, valueAccessor, allBindingsAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("value", value);

		}
	};

	/* SpreadListModel */
	
	function SpreadListModel () {
		var self = this;
		
		var firebase = new Firebase("https://howcomputerswork.firebaseio.com/contents");
		var layouts = new Firebase("https://howcomputerswork.firebaseio.com/layouts");
		
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
			window.spreadList = this;
			
			self.loadSpreadArrayFromFirebase();

			self.doRebuild();						
		}
		
		self.doRebuild = function () {
			self.removeAllMenuItems();
			
			var sidebar = w2ui["toc_sidebar"];
			
			if (sidebar) {
				var lastChapter = undefined, lastGroupID = undefined;
				for (var index = 0; index < self.spreadArray.length; index++) {
					var element = self.spreadArray[index];
					if (element.chapter != lastChapter) {
						var newGroup = { id: "ch" + element.chapter, text: "CHAPTER " + element.chapter, expanded: false, group: true, nodes: [] };
						lastParent = newGroup;
						lastChapter = element.chapter;
						lastGroupID = "ch" + element.chapter;
						sidebar.add(newGroup);
					}
					
					var node = { id: element.index, text: element.title, routeData: { index: element.index }, icon: "fa fa-table", count: element.number };
					sidebar.add(lastGroupID, node);
					
					// NOTE: This is really slow, especially since rebuilding gets called each time a row is fetched (ugh)
					layouts.child(element.index).once("value", $.proxy(self.addLayoutStyle, self, element.index));
				}
			}
		}
		
		self.addLayoutStyle = function (id, snapshot) {
			if (snapshot && snapshot.val()) {
				var style = snapshot.val().style;
				
				var sidebar = w2ui["toc_sidebar"];
				switch (style) {
					case "fixed":
						sidebar.get(id).icon = "fa fa-th-list";
						break;
					case "grid":
						sidebar.get(id).icon = "fa fa-table";
						break;
				}
			}
		}
		
		self.loadSpreadArrayFromFirebase = function () {
			self.spreadArray = [];
			
			for (var i = 0; i < self.spreads().length; i++) {
				var s = self.spreads()[i]();
				var spread = { id: s.id(), chapter: s.chapter(), number: s.number(), title: s.title(), index: s.firebase.name() };
				self.spreadArray.push(spread);
			}
			
			self.spreadArray.sort(Helpers.sortByChapterAndNumber);
		}

		// rebuild only the text (was too cumbersome to do this with groups, so just rebuild the whole thing)
		self.rebuildSidebarMenuText = function () {
			self.loadSpreadArrayFromFirebase();
			
			self.doRebuild();
			
			/*
			var sidebar = w2ui["toc_sidebar"];
			
			for (var i = 0; i < self.spreadArray.length; i++) {
				var s = self.spreadArray[i];
				var node = sidebar.get(s.id);
				node.routeData = { index: s.index };
				var text = s.id + " " + s.title;
				sidebar.nodes[i].id = s.index;
				sidebar.nodes[i].text = text;
				sidebar.nodes[i].routeData = { index: s.index };
				sidebar.nodes[i].icon = "fa fa-list-alt";
			}
			
			sidebar.refresh();
			*/
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
			
			self.content().firebase.child("cells/" + obj.id).setWithPriority(obj, obj.id);
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
		
		// return one higher than the highest numeric id so far, but use the firebase key not the content id (because the content id can be alpha)
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
		
		// kind of clunky because of the way (I think) you have to retrieve firebase children
		self.setSortOrder = function (ids) {
			var ref = self.content().firebase.child("cells");
			ref.once("value", function (snapshot) {
				self.setPriorityByID(snapshot.val(), ids);
			});
		}
		
		self.setPriorityByID = function (val, ids) {
			for (var i = 0; i < ids.length; i++) {
				var id = ids[i];
				var ref = self.getCellByID(id, val);
				if (ref) {
					ref.setPriority(i);
				}
			}
		}
		
		self.getCellByID = function (id, cells_in_firebase_order) {
			for (var i = 0; i < cells_in_firebase_order.length; i++) {
				var cell = cells_in_firebase_order[i];
				if (cell && cell.id == id) {
					return self.content().firebase.child("cells/" + i);
				}
			}
			return undefined;
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
						"textcolor": true,
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
								"imageWidth": true,
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
		
		self.getFirebaseKeys = function () {
			var keys = [];
			var hints = self.layout()().hints();
			$.each(hints, function (index, item) {
				keys.push(item().firebase.name());
			});
			return keys;
		}		

		self.addNewHint = function (id) {
			var style = self.layout()().style();
			var defaults = {};
			switch (style) {
				case "grid":
					defaults = { id: id, width: 1 };
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

		self.removeHintFromFirebaseByFirebaseRef = function (firebaseRef) {
			var hint = self.layout().firebase.child("hints/" + firebaseRef);
			self.layout().firebase.child("hints/" + firebaseRef).remove();
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