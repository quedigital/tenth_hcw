define(["Helpers"], function (Helpers) {

	CalloutLabel = function (text, options, container, cell, cell_hint) {
		this.elem = $("<div>").addClass("image-callout");
		this.span = $("<span>").text(text).appendTo(this.elem);
		
		var remainingWidthPerSide = (1.0 - cell_hint.imageWidth) * .5;

		var w = Math.round(remainingWidthPerSide * 100) + "%";

		// NOTE: Firefox didn't like this.elem.width(w);
		this.elem.css("width", w);
		
		cell.append(this.elem);
		
		// if we're position at the top of the image, increase the top padding
		if (alignedAlongTop(options.my, options.at)) {
			cell.css("padding-top", this.elem.outerHeight());
		}
		
		var my = Helpers.convertAlignToJQueryAlign(options.my);
		var at = Helpers.convertAlignToJQueryAlign(options.at);
		
		if (options.at_free != undefined && options.at_free != "") {
			at = options.at_free;
		}
		
		this.elem.position({ my: my, at: at, of: cell.find("img"), collision: "none" });
		
		this.line = new CalloutLine(container, this.span, cell, options.target, { style: "label", my: options.my, at: options.at, alwaysVisible: true } );
	}

	CalloutLabel.prototype = Object.create(null);
	CalloutLabel.prototype.constructor = CalloutLabel;
	
	CalloutLabel.prototype.remove = function () {
		this.elem.remove();
		this.line.remove();
	}
	
	function alignedAlongTop (my_options, at_options) {
		var my = my_options;
		var at = at_options;
		
		if (my[0] == "B" && at[0] == "T")
			return true;
		else
			return false;
	}
	
	return CalloutLabel;
});