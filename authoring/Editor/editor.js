requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.min",
		"domReady": "../../../common/js/domready",
		"Helpers": "../../../common/js/helpers",
		"jquery.layout": "jquery.layout-latest.min",
		"jquery.autosize": "jquery.autosize.min",
		"jquery.json": "jquery.json.min",
		"jquery.hotkeys": "jquery.hotkeys",
		"w2ui": "w2ui-1.4.min",
		"firebase": "https://cdn.firebase.com/js/client/1.0.15/firebase",
		"knockout": "knockout-3.1.0",
		"knockout.sortable": "knockout-sortable",
		"knockoutfire": "knockoutfire",
		"moment": "moment.min"
	},
	
	shim: {
			"jquery": {
				export: "$",
			},
			"jqueryui": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.layout": {
				export: "$",
				deps: ['jquery', 'jqueryui']
			},
			"jquery.autosize": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.json": {
				export: "$",
				deps: ['jquery']
			},
			"jquery.hotkeys": {
				export: "$",
				deps: ['jquery']
			},
			"w2ui": {
				export: "w2ui",
				deps: ['jquery']
			},
			"knockout.sortable": {
				deps: ['jquery', 'jqueryui', 'knockout']
			},
			"knockoutfire": {
				deps: ["knockout", "firebase"]
			},
	},
});

require(["knockout", "spread", "w2ui", "jquery.hotkeys", "jquery.layout", "jquery.json", "moment", "domReady!"], function (ko, Spread) {
	var credentials;
	var region = 'us-east-1'

	/* Editor */
	var Editor = function (id) {
		// TODO: get index from id
		this.content = new Spread.ContentModel(this, 0);
		
		// this is a kludge; I couldn't get knockout-sortable to accept my options in editor.js
		Spread.callbacks.onSortStart = $.proxy(this.onSortableStart, this);
		Spread.callbacks.onSortUpdate = $.proxy(this.onSortableUpdate, this);
		Spread.callbacks.onSortStop = $.proxy(this.onSortableStop, this);

		this.layout = new Spread.LayoutModel(this, 0);
		
		this.selectedCells = [];
		
		this.snapshots = [];
		
		this.firebase = undefined;
		
		this.localVersionNumber = 1;
	}

	Editor.prototype = {};
	Editor.prototype.constructor = Editor;
	
	Editor.prototype.resizeLayoutPane = function () {
		$(".grid").trigger("reformat");
		$(".fixer").trigger("resize_layout");
	}
	
	Editor.prototype.viewSpread = function (index) {
		this.content.viewContentForSpread(index);
		this.layout.viewLayoutForSpread(index);
	}
	
	Editor.prototype.initialize = function () {
		ko.applyBindings(this.content, $("#contentModel")[0]);
		ko.applyBindings(this.layout, $("#layoutModel")[0]);
		// TODO: is it valid to applyBindings to the same object twice?!
		ko.applyBindings(this.layout, $("#propertyPane")[0]);
		
		// listen for changes from the gridder object:
		$("#layoutModel").on("order_change", $.proxy(this.onCellOrderChange, this));
		
		$("#content").on("upload", $.proxy(this.onFileUpload, this));
		$("#layout").on("upload", $.proxy(this.onFileUpload, this));
		
		$("#layout").on("selectedCell", $.proxy(this.onSelectedLayoutCell, this));
		$("#content").focusin($.proxy(this.onSelectedContentCell, this));
		
		$("#content").on("change_id", $.proxy(this.onChangedCellID, this));		
	}

	Editor.prototype.onChangedCellID = function (event, old_id, new_id) {
		var firebase = $(event.target).parents(".cell").data("firebaseRef");
		this.layout.setCellID(firebase, new_id);
	}
	
	Editor.prototype.onSelectedLayoutCell = function (event, id) {
		var cell = $("#content .cell[data-id=" + id + "]");
		var a = $("#content-cells").scrollTop();
		if (cell.length) {
			var t = cell.offset().top;
			// NOTE: might want to adjust this number to scroll it higher or lower:
			var b = (a + t) - 100;
			$("#content-cells").animate({ scrollTop: b });
		}
	}
	
	Editor.prototype.onSelectedContentCell = function (event) {
		var id = $(event.target).parents(".cell").data("id");
		var layoutObject = $("#layout .layoutUI").data("layoutObject");
		if (layoutObject && layoutObject.setSelectedCell)
			layoutObject.setSelectedCell(id);
	}
	
	Editor.prototype.onCellOrderChange = function (event, ids) {
		this.content.setSortOrder(ids);
	}
	
	Editor.prototype.getCellType = function (id) {
		return this.content.getCellType(id);
	}
	
	Editor.prototype.getCellData = function (id, field) {
		return this.content.getCellData(id, field);
	}
	
	Editor.prototype.onSelectionChange = function (selected) {
		w2ui['bottom-toolbar'].set('delete', { count: selected.length });
		
		this.selectedCells = selected;
	}
	
	Editor.prototype.addNewSpread = function (id, title, part, chapter, number) {
		this.content.addNew(id, title, part, chapter, number);
		this.layout.addNew(id);
	}
	
	Editor.prototype.removeSpreadByID = function (id) {
		this.content.removeByID(id);
		this.layout.removeByID(id);
	}
	
	Editor.prototype.addCell = function () {
		this.content.addNewCell();
		
		var d = $("#content-cells");
		d.scrollTop(d.prop("scrollHeight"));
		
		this.synchronizeCellsAndHints();
	}
	
	Editor.prototype.deleteSelectedCells = function () {
		var me = this;
		
		$.each(this.selectedCells, function (index, item) {
				var cell = $(item).parents(".cell");
				var firebaseRef = cell.data("firebaseRef");
				
				var id = cell.data("id");
				
				// NOTE: the order of these two .remove's made a big difference
				//  layout remove needed to be called last or dispose wasn't called
				//  content needed to be called first or the cell wasn't cleanly removed from Firebase
				
				$("#content .cell[data-id=" + id + "]").remove();

				// KLUDGE: I added these again here to help with being able to delete fixed layout cells (otherwise they came back!)
				$("table.properties tbody[data-id = " + id + "]").remove();
				$(".hideable[data-id = " + id + "]").remove();

				// delete content cell and layout hint from Firebase
				me.content.removeCellFromFirebaseByFirebaseRef(firebaseRef);
				me.layout.removeHintFromFirebaseByFirebaseRef(firebaseRef);
				
				// NOTE: remove the DOM so Knockout doesn't add it back
				$("#layout .cell[data-id=" + id + "]").remove();
				$("#layout .bounds[data-id=" + id + "]").remove();
				
				$("table.properties tbody[data-id = " + id + "]").remove();
				$(".hideable[data-id = " + id + "]").remove();
			});
			
		var selected = $(".cell-check:checked");
		this.onSelectionChange(selected);
	}
	
	// add a layout hint for every new cell
	// and remove hints with no corresponding cells
	Editor.prototype.synchronizeCellsAndHints = function () {
		console.log("sync");
		
		var cell_ids = this.content.getIDs();
		var hint_ids = this.layout.getIDs();
		var hint_keys = this.layout.getFirebaseKeys();
		
		var me = this;
		
		if (cell_ids.length > hint_ids.length) {
			$.each(cell_ids, function (index, item) {
				if ($.inArray(item, hint_ids) == -1) {
					me.layout.addNewHint(item);
				}
			});
		} else if (hint_ids.length > cell_ids.length) {
			$.each(hint_ids, function (index, item) {
				if ($.inArray(item, cell_ids) == -1) {
					me.layout.removeHintByID(item);
				}
			});
		}
	}
	
	Editor.prototype.onSortableStart = function (event, ui) {
		$("#bound-cells").addClass("sorting");
		// to make things easier to see when reordering
		var helper = $(ui.helper);
		helper.addClass("shorter");
	}
	
	Editor.prototype.onSortableUpdate = function (event, ui) {
		$("#bound-cells").removeClass("sorting");
		
		// scroll to the one we just dropped
		// NOTE: this math doesn't seem quite infallible
		var t = ui.item.offset().top;
		var d = $("#content-cells");
		d.scrollTop(t - ui.item.height() * .5);
		
		var cells = $("#cells .cell");
		var order = cells.map(function (index, element) {
			return $(element).data("firebaseRef");
		}).toArray();

		this.content.setSortOrder(order);
	}

	Editor.prototype.onSortableStop = function (event, ui) {
		$("#bound-cells").removeClass("sorting");
		$(".shorter").removeClass("shorter");
	}
	
	function download (content, filename, contentType) {
		if (!contentType) contentType = 'application/octet-stream';
		var a = document.createElement('a');
		var blob = new Blob([content], { 'type': contentType });
		a.href = window.URL.createObjectURL(blob);
		a.download = filename;
		a.click();
	}
	
	Editor.prototype.onPrePublish = function (data) {
		var to_publish = { contents: {}, layouts: {} };
		
		for (var each in data.layouts) {
			var layout = data.layouts[each];
			if (layout.publish != false) {
				to_publish.layouts[each] = layout;
				to_publish.contents[each] = data.contents[each];
			}
		}
		
		this.onPublish(to_publish);
	}
	
	Editor.prototype.onPublish = function (data) {
		var json = $.toJSON(data);
		
		var bucket = new AWS.S3({
			params: { Bucket: 'HCW10' },
			credentials: credentials,
			region: region
		});

		var params = { Key: 'export.json', Body: json, ACL: 'public-read' };

		bucket.putObject(params, function (err, data) {
			if (err) {
				console.log("S3 error");
				console.log(err);
				console.log(data);
				$("#dialog-message .text-message").text(err);
				$("#dialog-message").dialog( { title: "Publish Error" } ).dialog("open");
			} else {
				console.log("file put successful");
				$("#dialog-message .text-message").text("Published.");
				$("#dialog-message").dialog( { title: "Publish" } ).dialog("open");
			}
		});
	}
	
	Editor.prototype.onFileUpload = function (event, file, folder, observable) {
		this.uploadFile(file, folder, observable);
	}
	
	Editor.prototype.uploadFile = function (file, folder, observable) {
		if (file) {
			var bucket = new AWS.S3({
										params: { Bucket: 'HCW10' },
										credentials: credentials,
										region: region
									});
								
			var params = { Key: "Images/" + folder + "/" + file.name, ContentType: file.type, Body: file, ACL: "public-read" };
			
			bucket.putObject(params, function (err, data) {
				if (err) {
					console.log("putObject");
					console.log(err);
					$("#dialog-message .text-message").text(err);
					$("#dialog-message").dialog( { title: "File Upload Error" } ).dialog("open");
				} else {
					// store the filename in Firebase
					var url = "https://s3.amazonaws.com/HCW10/Images/" + folder + "/" + file.name;
					observable(url);
				}
			});
		}
	}
	
	Editor.prototype.publishAll = function () {
		this.content.getData($.proxy(this.onPrePublish, this));
	}
	
	Editor.prototype.onExport = function (data) {
		var json = $.toJSON(data);
		
		// To save it to the download directory:
		download(json, "export.json");
	}
	
	Editor.prototype.exportAll = function () {
		this.content.getData($.proxy(this.onExport, this));
	}
	
	Editor.prototype.trackChanges = function (firebaseUrl) {
		this.firebase = new Firebase(firebaseUrl);
		this.firebase.on("value", $.proxy(this.onValueChange, this));
	}
	
	Editor.prototype.getLastSnapshot = function () {
		return this.snapshots.length ? this.snapshots[this.snapshots.length - 1].data : undefined;
	}
	
	Editor.prototype.onValueChange = function (dataSnapshot) {
		var lastSnapshot = this.getLastSnapshot();
		
		var prevVer = $.toJSON(lastSnapshot);
		var newVer = $.toJSON(dataSnapshot.exportVal());
		
		if (prevVer != newVer) {
			var toolbar = w2ui["top-toolbar"];
			var menu = toolbar.get("version_history");
			
			var s = compareDifferences(prevVer, newVer);
		
			var snapshot = { id: this.localVersionNumber++, date: new Date(), data: dataSnapshot.exportVal(), diff: s };
			this.snapshots.push(snapshot);
		
			menu.items.unshift( { text: 'Snapshot', id: "rewind", routeData: snapshot.id, icon: 'fa fa-camera' } );
			
			// don't store too many versions (they can probably get huge)
			this.limitVersionList();
			
			w2ui["top-toolbar"].set("version_history", { count: this.snapshots.length });
		} else {
			// ignoring change since it's the same as the last snapshot (as when going back to an older version)
		}
	}
	
	Editor.prototype.limitVersionList = function () {
		var MAX_VERSIONS = 20;
		
		if (this.snapshots.length > MAX_VERSIONS) {
			var remove = this.snapshots.splice(0, this.snapshots.length - MAX_VERSIONS);
			
			var toolbar = w2ui["top-toolbar"];
			var menu = toolbar.get("version_history");
			
			for (var i = 0; i < remove.length; i++) {
				menu.items.pop();
			}
		}
	}
	
	Editor.prototype.refreshVersionHistoryMenu = function () {
		var toolbar = w2ui["top-toolbar"];
		var menu = toolbar.get("version_history");
		for (var i = 0; i < menu.items.length; i++) {
			var item = menu.items[i];
			var snapshot = this.getSnapshotFromID(item.routeData);//this.snapshots[item.routeData];
			if (snapshot) {
				var text = snapshot.diff + " (" + moment(snapshot.date).fromNow() + ")";
				item.text = text;
			}
		}
	}
	
	Editor.prototype.getSnapshotFromID = function (id) {
		for (var i = 0; i < this.snapshots.length; i++) {
			var ver = this.snapshots[i];
			if (ver.id == id) return ver;
		}
		return undefined;
	}
	
	Editor.prototype.rewindToVersion = function (id) {
		var ver = this.getSnapshotFromID(id);
		if (ver) {
			var data = ver.data;
		
			// turn value tracking off temporarily so we don't count this as a new version
			// NOTE: This didn't work (too close to the .set call?)
//			this.firebase.off("value");
		
			var me = this;
		
			this.firebase.set(data, function (error) {
				if (error) {
					console.log("error setting firebase data");
					console.log(error);
				}
			
				// turn value tracking back on
//				me.firebase.on("value", $.proxy(me.onValueChange, me));
			});
		}
	}
	
	function checkfield (f) {
		if (f.val().length == 0) {
			f.addClass("ui-state-error");
			return false;
		}
		return true;
	}
	
	function updateTips (t) {
		var tips = $(".validateTips");
		tips.text(t).addClass("ui-state-highlight");
		
		setTimeout(function() {
				tips.removeClass("ui-state-highlight", 1500);
			}, 500 );      		
	}
	
	function addSpread (editor, dialog) {
		$(".validateTips").addClass("checking");
		
		var valid = true;
		
		var part = $("#dialog-form #part");
		var chapter = $("#dialog-form #chapter");
		var number = $("#dialog-form #number");
		var title = $("#dialog-form #title");
		
		var invalid = /[\.\#\$\[\]]/;
		if (invalid.test(chapter.val())) {
			chapter.addClass("ui-state-error");
			updateTips("Chapter field cannot contain . # $ [ or ]");
			valid = false;
		} else if (invalid.test(number.val())) {
			number.addClass("ui-state-error");
			updateTips("Number field cannot contain . # $ [ or ]");
			valid = false;
		}
		
		valid = valid && checkfield(chapter) && checkfield(number) && checkfield(title);
		
		if (valid) {
			var id = chapter.val() + "_" + number.val();
			editor.addNewSpread(id, title.val(), part.val(), chapter.val(), number.val());
			
			dialog.dialog("close");
		}
		
		return false;
	}
    
	function onGlossaryKey (event, selectedNode, selectedRange) {
		if (!selectedNode) {
			selectedNode = document.getSelection().type === "Range" && document.getSelection().baseNode;
			selectedRange = document.getSelection().type === "Range" && document.getSelection().getRangeAt(0);
		}
		
		if (selectedNode) {
			var node = selectedNode;
			
			var div = $(selectedNode);
			while (div && div.length) {
				if (div.hasClass("editable-text"))
					break;
				else
					div = div.parent();
			}
						
			var glossary = $(selectedNode).parent("span");
			
			if (glossary.length) {
				var t = document.createTextNode(glossary.text());
				glossary.replaceWith(t);
			} else {
				var glossary = $("<span class=\"glossary\">");
				selectedRange.surroundContents(glossary[0]);
				div.html(div.html());
			}

			// make sure the observable gets updated			
			div.trigger("blur");			
		}
					
		return false;
	}
	
	function onCleanupText () {
		if (activeElement) {
			var el = $(activeElement);
			if (el.hasClass("editable-text")) {
				el.html(el.text().trim());
				el.trigger("blur");
			}
		}
	}
	
	function compareDifferences (one, two) {
		var out = "";
		
		if (one && two) {
			var dmp = new diff_match_patch();
			var diffs = dmp.diff_main(one, two);
			for (var i = 0; i < diffs.length; i++) {
				var d = diffs[i];
				if (d[0] == 1) {
					// insertion
					out += "<span style='color: green'>" + d[1].substr(0, 32) + "</span>";
				} else if (d[0] == -1) {
					// deletion
					out += "<span style='color: red'>" + d[1].substr(0, 32) + "</span>";
				}
			}
		}
		
		return out;
	}

	var activeElement, selectedNode, selectedRange;
	
	function initializeUI () {
		$("body").layout({ applyDefaultStyles: true,
							livePaneResizing: true,
							east__onresize: function () { editor.resizeLayoutPane(); },
							east__size: "40%",
						});
					
		$('#top-toolbar').w2toolbar({
			name: 'top-toolbar',
			items: [
				{ type: 'button', id: 'signin', caption: 'Sign In', icon: 'fa fa-sign-in', hint: 'Log in via Google' },
				{ type: 'button', id: 'cleanup', caption: 'Cleanup PDF Text', icon: 'fa fa-chain-broken', hint: "Remove line breaks from the current field" },
				{ type: 'button', id: 'glossary',  aption: 'Toggle Glossary Term', icon: 'fa fa-book', hint: 'Make the selected text a glossary term' },
				{ type: 'break', id: 'break0' },

				{ type: 'menu',   id: 'version_history', caption: 'Undo History', icon: 'fa fa-table', count: 0, hint: "Show recent changes",
					items: [
					]
				},
						
				{ type: 'break', id: 'break1' },
				{ type: 'button', id: "publish", caption: 'Publish', icon: 'fa fa-book', hint: "Output to the cloud" },
				{ type: 'button', id: "export", caption: 'Export', icon: 'fa fa-external-link-square', hint: "Save the current book data to a file" },
			],
			onClick: function (event) {
				switch (event.target) {
					case "signin":
						var additionalParams = {
							'callback': signinCallback,				
						};

						gapi.auth.signIn(additionalParams);
						
						break;
					case "cleanup":
						onCleanupText();
						break;
					case "glossary":
						onGlossaryKey(null, selectedNode, selectedRange);
						break;
					case "version_history":
						editor.refreshVersionHistoryMenu();
						break;
					case "version_history:rewind":
						editor.rewindToVersion(event.subItem.routeData);
						break;
					case "publish":
						editor.publishAll();
						break;
					case "export":
						editor.exportAll();
						break;
				}
			}
		});

		function signinCallback (authResult) {
			if (authResult['status']['signed_in']) {
				// Update the app to reflect a signed in user
				// Hide the sign-in button now that the user is authorized, for example:
				console.log("signed in to google");
				
				/*
				AWS.config.credentials = new AWS.WebIdentityCredentials({
					RoleArn: 'arn:aws:iam::961571864643:role/Editors',
					ProviderId: null,
				});
				
				AWS.config.credentials.params.WebIdentityToken = authResult.id_token;
				*/

				var arn = 'arn:aws:iam::961571864643:role/Editors'
				credentials = new AWS.WebIdentityCredentials({
					RoleArn: arn
				});

				credentials.params.WebIdentityToken = authResult.id_token;
				credentials.refresh(function (err) {
					if (err) {
						console.log("Error logging into application");
						console.log(err);
					} else {
						console.log("Logged into application");
					}
				});
				
				gapi.client.load('plus','v1', function() {
					var request = gapi.client.plus.people.get({
						'userId': 'me'
					});
					
					request.execute(function(resp) {
						console.log('Retrieved profile for:' + resp.displayName);
						var toolbar = w2ui["top-toolbar"];
						toolbar.set("signin", { caption: resp.displayName } );
					});
				});
				
			} else {
				// Update the app to reflect a signed out user
				// Possible error values:
				//   "user_signed_out" - User is signed-out
				//   "access_denied" - User denied access to your app
				//   "immediate_failed" - Could not automatically log in the user
				console.log('Sign-in state: ' + authResult['error']);
			}
		}
			
		// KLUDGE: grab the selected node during mouseDown since it's not there during the toolbar button's click event
		var button = $("#top-toolbar .w2ui-button");
		button.on("mousedown", function () {
				activeElement = document.activeElement;
				if (document.getSelection().type === "Range") {
					selectedNode = document.getSelection().baseNode;
					selectedRange = document.getSelection().getRangeAt(0);
				} else {
					selectedNode = selectedRange = undefined;
				}
			});

		$('#search-toolbar').w2toolbar({
			name: 'search-toolbar',
			items: [
				{ type: 'html',  id: 'search', html: '<div id="search_box"><span class="fa fa-lg fa-search"></span><input/></div>' },
			]
		});
	
		$('#bottom-toolbar').w2toolbar({
			name: 'bottom-toolbar',
			items: [
				{ type: 'button',  id: 'add',  caption: 'Add Cell', icon: 'fa fa-plus-square', hint: 'Add a new content cell' },
				{ type: 'break', id: 'break0' },
				{ text: 'Delete Cell', id: "delete", icon: 'fa fa-trash-o', count: 0, hint: 'Delete selected content cells' },
			],
			onClick: function (event) {
				switch (event.target) {
					case "add":
						editor.addCell();
						break;
					case "delete":
						editor.deleteSelectedCells();
						break;
				}
			}
		});
		
		$("#toc").w2sidebar({
			name: "toc_sidebar",
			onClick: function (event) {
				editor.viewSpread(event.node.routeData.index);
			}
		});
		
		$('#bottom-sidebar').w2toolbar({
			name: 'bottom-sidebar',
			items: [
				{ type: 'button',  id: 'add', icon: 'fa fa-plus-square', hint: "Add new spread" },
				{ type: 'break', id: 'break0' },
				{ type: "button", id: "delete", icon: "fa fa-minus-square", hint: "Delete selected spread" },
				{ type: 'break', id: 'break1' },
			],
			onClick: function (event) {
				switch (event.target) {
					case "add":
						dialog.dialog("open");
						break;
					case "delete":
						editor.viewSpread(0);
					
						editor.removeSpreadByID(w2ui['toc_sidebar'].selected);
						break;
				}
			}
		});
    
		var dialog;
	
		dialog = $("#dialog-form").dialog({
			autoOpen: false,
			height: 400,
			width: 350,
			modal: true,
			buttons: {
				"Add": function () { addSpread(editor, dialog); },
				"Cancel": function () {
					dialog.dialog("close");
				}
			},
			close: function() {
				$("#dialog-form").find("form")[0].reset()
				$(".ui-state-error").removeClass("ui-state-error");
				$(".checking").removeClass("checking");
			}
		});
		
		$("#dialog-message").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Ok: function () {
					$(this).dialog("close");
				}
			}
		});		

		$("#dialog-target-selector").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Ok: function () {
					var imageSelector = $(this).find(".control").data("control");
					if (imageSelector) {
						imageSelector.setDataToPosition();
					}
					$(this).dialog("close");
				},
				Cancel: function () {
					$(this).dialog("close");
				}
			}
		});		
	
		$("#leftmost").layout({ applyDefaultStyles: true, north__resizable: false, north__closable: false, south__resizable: false, south__closable: false });
		$("#content").layout({ applyDefaultStyles: true, north__resizable: false, north__closable: false, south__resizable: false, south__closable: false });
		$(".ui-layout-east").layout({ applyDefaultStyles: true, livePaneResizing: true, south__size: "20%" });

		// TODO: make this open the given spread by id
		var editor = new Editor("10_1");
		editor.initialize();
		editor.trackChanges("https://howcomputerswork.firebaseio.com/");

		$("#content").bind('keydown', 'alt+meta+g', onGlossaryKey);		
		
		$("body").css("opacity", 1);
	}

	// NOTE: using domReady seemed to cause problems with the toc_sidebar loading sequence	
//	domReady(function () {
		initializeUI();
//	});
});