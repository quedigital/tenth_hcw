define(["knockout", "knockoutfire", "gridder", "fixer", "Helpers", "ImagePositionSelector", "w2ui", "jquery.autosize", "knockout.sortable"], function (ko, KnockoutFire, gridder, fixer, Helpers, ImagePositionSelector) {
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
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).html(value);
		}
	};
	
	ko.bindingHandlers.syncID = {
		init: function (element, valueAccessor) {
			$(element).on('blur', function() {
				var observable = valueAccessor();
				var v = $(this).val();
				if (v != observable()) {
					var old_val = observable();
					observable(v);
					$(element).trigger("change_id", [old_val, v]);
				}
			});			
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).val(value);
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
			var id = bindingContext.$root.getFirebaseKey();
			
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
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var observable = valueAccessor();
			// default the slider to 100% (not sure this is the best way to do this)
			if (observable() == null) observable(1.0);
			
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
		self.spreads.subscribe(Helpers.throttle(function () { self.rebuildSidebarMenu(); }, 500, self));
		
		self.rebuildSidebarMenu = function () {
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
			
			$("#search_box input").off("input");
			$("#search_box input").on("input", $.proxy(self.onSearch, self));
		}
		
		// show spreads with titles containing the search text
		self.onSearch = function (event) {
			var txt = $("#search_box input").val().toLowerCase();
						
			var sidebar = w2ui["toc_sidebar"];

			if (txt == "") {
				$("#toc .w2ui-node").css("display", "block");
				sidebar.collapseAll();
				return;
			}
			
			sidebar.expandAll();
			
			for (var i = 0; i < sidebar.nodes.length; i++) {
				var node = sidebar.nodes[i];
				for (var j = 0; j < node.nodes.length; j++) {
					var subnode = node.nodes[j];
					if (subnode.text.toLowerCase().indexOf(txt) != -1) {
						$("#node_" + subnode.id).css("display", "block");
					} else {
						$("#node_" + subnode.id).css("display", "none");
					}
				}
			}
		}
		
		self.addLayoutStyle = function (id, snapshot) {
			if (snapshot && snapshot.val()) {
				var style = snapshot.val().style;
				
				var sidebar = w2ui["toc_sidebar"];
				switch (style) {
					case "fixed":
						sidebar.get(id).icon = "fa fa-desktop";
						break;
					case "grid":
						sidebar.get(id).icon = "fa fa-align-left";
						break;
				}
			}
		}
		
		self.loadSpreadArrayFromFirebase = function () {
			self.spreadArray = [];
			
			for (var i = 0; i < self.spreads().length; i++) {
				var s = self.spreads()[i]();
				var spread = { id: s.firebase.name(), chapter: s.chapter(), number: s.number(), title: s.title(), index: s.firebase.name() };
				self.spreadArray.push(spread);
			}
			
			self.spreadArray.sort(Helpers.sortByChapterAndNumber);
		}

		// rebuild only the text (was too cumbersome to do this with groups, so just rebuild the whole thing)
		self.rebuildSidebarMenuText = function () {
			self.loadSpreadArrayFromFirebase();
			
			self.doRebuild();			
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
								callouts: {
									"$callout": {
										text: true,
									}
								},
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
				if (cell.firebase.name() == id) {
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
			self.content().firebase.parent().child(id).update( { title: title, chapter: chapter, number: number });
		}
		
		self.removeByID = function (id) {
			var ref = self.content().firebase.parent().child(id);
			
			// this worked to disable knockout, but we'd have to reapply bindings, I think
//			var element = $("#contentModel")[0];
//			ko.cleanNode(element);
			// remove from Firebase
//			self.content().firebase.parent().child(id).remove();
			
			// NOTE: temporarily disable Knockout so the data isn't auto-repopulated (kludgy?)
			var dummy = function () { return { chapter: "", number: "", title: "", cells: function () { return []; } } };
			self.content(dummy);
			
			ref.remove();
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
			for (var i = 0; i < ids.length; i++) {
				var id = ids[i];
				var ref = this.getFirebaseRefFromID(id);
				ref.setPriority(i);
			}
		}
		
		self.getFirebaseRefFromID = function (id) {
			var cell = $("#content .cell[data-id=" + id + "]");
			var firebaseKey = cell.data("firebaseRef");
			var ref = self.content().firebase.child("cells/" + firebaseKey);
			return ref;
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
		
		self.getFirebaseKey = function () {
			return self.content()().firebase.name();
		}
		
		self.addImageCallout = function (data, p1) {
			var next = Helpers.getNextHighestKey(data.callouts());
			data.callouts().firebase.child(next).set({ text: "Insert callout text here." });
//			var spread_id = p1.id();
//			var cell_id = data.id();
			var spread_key = data.firebase.parent().parent().name();
			var cell_key = data.firebase.name();
			// add a hint for this spread
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/" + spread_key + "/hints/" + cell_key + "/callouts/" + next);
			firebase.set( { align: "TL", position: "0 0" } );			
		}
		
		self.deleteImageCallout = function (data) {
			var callout_key = data.firebase.name();
			var spread_key = data.firebase.parent().parent().parent().parent().name();
			var cell_key = data.firebase.parent().parent().name();
			
			data.firebase.remove();
			
			// remove the hint also
			var firebase = new Firebase("https://howcomputerswork.firebaseio.com/layouts/" + spread_key + "/hints/" + cell_key + "/callouts/" + callout_key);
			firebase.remove();
		}
		
		self.onClickCell = function (data, event) {
			self.controller.onSelectedContentCell(event);
			return true;
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
								"callout_target_id": true,
								"callout_target_pos": true,
								callouts: {
									"$callout": {
										at: true,
										my: true,
										target: true,
									}
								},
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
		
		self.getFirebaseKey = function () {
			return self.layout()().firebase.name();
		}		
		
		self.setCellID = function (firebase_id, new_id) {
			self.layout().firebase.child("hints/" + firebase_id).update({ id: new_id });
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
			self.layout().firebase.parent().child(id).update( { style: "grid" });
		}		

		self.removeByID = function (id) {
			self.layout().firebase.parent().child(id).child("hints").remove();
			self.layout().firebase.parent().child(id).remove();
		}
/*		
		self.getID = function () {
			return self.layout()().id();
		}
*/
		
		function onInterceptClick (event, data) {
			// find object under click
			$(".clickCatcher").remove();
			var el = document.elementFromPoint(event.clientX, event.clientY);
			if (el.tagName == "IMG") {
				data.callout_target_id("background")
			} else if (el.className.indexOf("bounds") != -1 || el.className.indexOf("inset") != -1) {
				data.callout_target_id($(el).data("id"));
			}
		}
		
		self.setCalloutTarget = function (data, event) {
			$("<div>").addClass("clickCatcher").appendTo(".layoutUI").click(function (event) { onInterceptClick(event, data); });
		}
		
		self.setCalloutTargetPosition = function (data, event) {
			if (!data.callout_target_id || !data.callout_target_id()) return;
			
			var id = data.callout_target_id();
			
			var url;
			if (id == "background") {
				url = self.layout()().background();
			} else {
				url = self.getCellData(data.callout_target_id(), "image");
			}
			
			var selector = new ImagePositionSelector(url, data.callout_target_pos);
			
			$("#dialog-target-selector .control").replaceWith(selector.getContainer());
			$("#dialog-target-selector").dialog({ height:'auto', width:'auto'});
			$("#dialog-target-selector").dialog("open");
		}
		
		self.setImageCalloutTargetPosition = function (parentData, data) {
			var url = self.getCellData(parentData.id(), "image");
			var selector = new ImagePositionSelector(url, data.target);
			
			$("#dialog-target-selector .control").replaceWith(selector.getContainer());
			$("#dialog-target-selector").dialog({ height: 'auto', width: 'auto' });
			$("#dialog-target-selector").dialog("open");
		}

		self.viewLayoutForSpread(0);
	}
	
	return { ContentModel: ContentModel, LayoutModel: LayoutModel, callbacks: callbacks }
});