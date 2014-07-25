requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.custom",
	},
	
	shim: {
	},
});

require(["Spread", "jquery.hotkeys"], function (Spread) {

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
		ko.applyBindings(this.layout, $("#propertyPane")[0]);		
	}
	
	Editor.prototype.getCellType = function (id) {
		return this.content.getCellType(id);
	}
	
	Editor.prototype.onSelectionChange = function (selected) {
		w2ui['bottom-toolbar'].set('delete', { count: selected.length });
		
		this.selectedCells = selected;
	}
	
	Editor.prototype.addNewSpread = function (id, title) {
		this.content.addNew(id, title);
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
				
				// NOTE: I think we have to remove from both simultaneously or else Knockout re-populates Firebase
				me.content.removeCellFromKnockoutByFirebaseRef(firebaseRef);
				me.content.removeCellFromFirebaseByFirebaseRef(firebaseRef);
			});
			
		var selected = $(".cell-check:checked");
		this.onSelectionChange(selected);
		
		this.synchronizeCellsAndHints();
	}
	
	// add a layout hint for every new cell
	// and remove hints with no corresponding cells
	Editor.prototype.synchronizeCellsAndHints = function () {
		var cell_ids = this.content.getIDs();
		var hint_ids = this.layout.getIDs();
		
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
	
	Editor.prototype.onExport = function (data) {
		var json = $.toJSON(data);
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
		
			var snapshot = { date: new Date(), data: dataSnapshot.exportVal(), diff: s };
			this.snapshots.push(snapshot);
		
			menu.items.unshift( { text: 'Snapshot', id: "rewind", routeData: this.snapshots.length - 1, icon: 'fa fa-camera' } );
			w2ui["top-toolbar"].set("version_history", { count: this.snapshots.length });
		} else {
			// ignoring change since it's the same as the last snapshot (as when going back to an older version)
		}
	}
	
	Editor.prototype.refreshVersionHistoryMenu = function () {
		var toolbar = w2ui["top-toolbar"];
		var menu = toolbar.get("version_history");
		for (var i = 0; i < menu.items.length; i++) {
			var item = menu.items[i];
			var snapshot = this.snapshots[item.routeData];
			var text = snapshot.diff + " (" + moment(snapshot.date).fromNow() + ")";
			item.text = text;
		}
	}
	
	Editor.prototype.rewindToVersion = function (index) {
		if (index >= 0 && index < this.snapshots.length) {
			var data = this.snapshots[index].data;
			
			// turn value tracking off temporarily so we don't count this as a new version
			this.firebase.off("value");
			
			var me = this;
			
			this.firebase.set(data, function (error) {
				if (error) {
					console.log("error setting firebase data");
					console.log(error);
				}
				
				// turn value tracking back on
				me.firebase.on("value", $.proxy(me.onValueChange, me));
			});
		}
	}
	
	// INITIALIZE THE UI

	$("body").layout({ applyDefaultStyles: true,
						livePaneResizing: true,
						east__onresize: function () { editor.resizeLayoutPane(); },
						east__size: "40%",
					});
					
    $('#top-toolbar').w2toolbar({
        name: 'top-toolbar',
        items: [
            { type: 'button',  id: 'glossary',  caption: 'Toggle Glossary Term', icon: 'fa fa-book', hint: 'Hint for item 3' },
            { type: 'break', id: 'break0' },

            { type: 'menu',   id: 'version_history', caption: 'Version History', icon: 'fa fa-table', count: 0,
            	items: [
				]
			},
                        
            { type: 'break', id: 'break1' },
            { type: 'button', id: "export", caption: 'Export', icon: 'fa fa-sign-out' },
        ],
        onClick: function (event) {
        	switch (event.target) {
        		case "glossary":
					onGlossaryKey(null, selectedNode, selectedRange);
        			break;
        		case "version_history":
        			editor.refreshVersionHistoryMenu();
        			break;
        		case "version_history:rewind":
        			editor.rewindToVersion(event.subItem.routeData);
        			break;
        		case "export":
        			editor.exportAll();
        			break;
        	}
        }
    });
    
    // KLUDGE: grab the selected node during mouseDown since it's not there during the toolbar button's click event
    var selectedNode, selectedRange;
    var button = $("#top-toolbar .w2ui-button");
    button.on("mousedown", function () {
    		if (document.getSelection().type === "Range") {
				selectedNode = document.getSelection().baseNode;
				selectedRange = document.getSelection().getRangeAt(0);
			} else {
				selectedNode = selectedRange = undefined;
			}
		});
    
    $('#bottom-toolbar').w2toolbar({
        name: 'bottom-toolbar',
        items: [
            { type: 'button',  id: 'add',  caption: 'Add Cell', icon: 'fa fa-plus-square', hint: 'Hint for item 3' },
            { type: 'break', id: 'break0' },
            { text: 'Delete Cell', id: "delete", icon: 'fa fa-trash-o', count: 0 },
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
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Add": addSpread,
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
	
	function addSpread () {
		$(".validateTips").addClass("checking");
		
		var valid = true;
		
		var id = $("#dialog-form #id");
		var title = $("#dialog-form #title");
		
		var invalid = /[\.\#\$\[\]]/;
		if (invalid.test(id.val())) {
			id.addClass("ui-state-error");
			updateTips("ID cannot contain . # $ [ or ]");
			valid = false;
		}
		
		valid = valid && checkfield(id) && checkfield(title);
		
		if (valid) {
			editor.addNewSpread(id.val(), title.val());
			
			dialog.dialog("close");
		}
		
		return false;
	}
    
    $("#leftmost").layout({ applyDefaultStyles: true });
	$("#content").layout({ applyDefaultStyles: true });
	$(".ui-layout-east").layout({ applyDefaultStyles: true, livePaneResizing: true, south__size: "20%" });

	// TODO: make this open the given spread by id
	var editor = new Editor("10_1");
	editor.initialize();
	editor.trackChanges("https://howcomputerswork.firebaseio.com/");

	$("#content").bind('keydown', 'alt+meta+g', onGlossaryKey);

	function onGlossaryKey (event, selectedNode, selectedRange) {
		if (!selectedNode) {
			selectedNode = document.getSelection().type === "Range" && document.getSelection().baseNode;
			selectedRange = document.getSelection().type === "Range" && document.getSelection().getRangeAt(0);
		}
		
		if (selectedNode) {
			var node = selectedNode;
			
			var div = $(selectedNode);
			while (div) {
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
	
	function compareDifferences (one, two) {
		var out = "";
		
		if (one && two) {
			var dmp = new diff_match_patch();
			var diffs = dmp.diff_main(one, two);
			for (var i = 0; i < diffs.length; i++) {
				var d = diffs[i];
				if (d[0] == 1) {
					// insertion
					out += "<span style='color: green'>" + d[1] + "</span>";
				} else if (d[0] == -1) {
					// deletion
					out += "<span style='color: red'>" + d[1] + "</span>";
				}
			}
		}
		
		return out;
	}
});

// TODO: load published pages from json
// TODO: only retain 20 or so version histories in the menu (but allow permanent "checkpoints"?)
// TODO: button to jump from content to its relevant layout hint
// TODO: image uploading (Firebase server?)
// TODO: sidebar with chapter groupings
// TODO: different sidebar icons for each spread type
// TODO: collapsible columns
// TODO: template the sections

// DONE: add a handle for the resizable
// DONE: view one spread at a time, selectable from list
// DONE: don't hard-code variable "cm"
// DONE: only show placement checkboxes for cells that have an associated image
// DONE: save the new width to the database
// DONE: add checkboxes for image position
// DONE: trigger cell resize when width is updated (ala checkbox subscribe method)
// DONE: set image placement checkboxes on load
// DONE: what if content and layout indices don't line up sometimes? [switched to id's]
// DONE: steps nicely set off in panels or wells
// DONE: textarea sized to fit
// DONE: custom fields for grid or fixed layouts (using knockout if binding)
// DONE: variable properties nicely formatted in a grid or table
// DONE: navbar for spread and layout info
// DONE: put "grid / fixed" field in content or layout – NOT BOTH
// BUG_FIXED: "grid / fixed" select keeps resetting, upon page reload, to the first option?! (first on the content side, now on the layout side... strange!) [valueAllowUnset seemed to do the trick]
// DONE: image placement as a 9-box selectable grid widget
// TODONT: move all image references to layout (nah)
// IGNORE: getVariableProperties doesn't work when updating values (yes, I think it does; well, not now it doesn't; obviated)
// DONE: ability to add extra properties [generic "styling" text area]
// DONE: fixed layout anchor point UI [in properties table]
// DONE: handle glossary terms (ie, bold) within text
// DONE: add class name to callouts [theme field]
// DONE: "glossary" style button
// DONE: show currently selected spread
// DONE: sidebar add and delete spreads
// DONE: rename editor.js spread instance to something like Editor
// DONE: ability to add step
// DONE: put marginLeft (for grid layout) into the property panel
// DONE: standardize anchor values
// DONE: make sure new cell id's are unique (using max id + 1)
// DONE: when adding/deleting cells, sync layout hints
// DONE: re-order cells
// DONE: when updating hint id's via textbox, update the necessary data("id") as well
// DONE: update sidebar list when a spread gets deleted (and added and modified)
// DONE: also add/delete corresponding layout when spread gets added/deleted
// DONE: export to json (server side process that will let us download the json output -- not necessary!)
// DONE: backup and undo capability
