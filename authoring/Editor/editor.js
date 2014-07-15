requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-1.11.0.min",
		"jqueryui": "jquery-ui-1.10.4.custom",
	},
	
	shim: {
	},
});

require(["Spread", "jquery.hotkeys"], function (SpreadController) {
	$("body").layout({ applyDefaultStyles: true,
						livePaneResizing: true,
						east__onresize: function () { spread.resizeLayoutPane(); },
						east__size: "40%",
					});
					
    $('#top-toolbar').w2toolbar({
        name: 'top-toolbar',
        items: [
            { type: 'button',  id: 'glossary',  caption: 'Toggle Glossary Term', icon: 'fa fa-book', hint: 'Hint for item 3' },
        ],
        onClick: function (event) {
        	if (event.target === "glossary") {
        		onGlossaryKey(null, selectedNode, selectedRange);
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
            { type: 'button',  id: 'add',  caption: 'Add', icon: 'fa fa-plus-square', hint: 'Hint for item 3' },
            { type: 'break', id: 'break0' },
            { text: 'Delete', id: "delete", icon: 'fa fa-trash-o', count: 0 },
        ],
        onClick: function (event) {
            console.log('Target: '+ event.target, event);
        }
    });
    
	$(".ui-layout-center").layout({ applyDefaultStyles: true });
	$(".ui-layout-east").layout({ applyDefaultStyles: true, livePaneResizing: true, south__size: "20%" });

	// TODO: make this open the given spread by id
	var spread = new SpreadController("10_1");
	spread.initialize();
	
	$(spread).on("selection", onContentCellSelected);
	
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
	
	function onContentCellSelected (event, params) {
		w2ui['bottom-toolbar'].set('delete', { count: params.selected.length });
	}
});

// TODO: show currently selected spread
// TODO: put marginLeft (for grid layout) into the property panel
// TODO: button to add step and/or layout hint
// TODO: standardize anchor values
// TODO: load published pages from json
// TODO: button to jump from content to its relevant layout hint
// TODO: collapsible columns
// TODO: template the sections
// TODO: image uploading (Firebase server?)
// TODO: backup and undo capability

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
