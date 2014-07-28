define(["jquery"], function ($) {
	function makeCallout (title, text, image) {
		// TODO: make sure the callout text fits into its bounds
		var callout = $("<div>").addClass("callout");
		
		$("<div class='h2'>").addClass("resizeable").text(title).appendTo(callout);
		
		var block_body = $("<div>").addClass("block-body");
		
		block_body.hide();
		
		var d = $("<div>").addClass("textblock");
		
		$("<span>").addClass("span-text").html(text).appendTo(d);
		
		d.appendTo(block_body);

		if (image) {
			var img = $("<img>").attr("src", image);
			var div = $("<div>").addClass("image").append(img);
			block_body.append(div);
			
			img.load(function () {
				img.width(img[0].naturalWidth);
				img.height(img[0].naturalHeight);
			});
		}
		
		callout.append(block_body);
		
		callout.reveal = reveal;
		callout.anchor = anchor;
		
		return callout;
	}
	
	function reveal (anchor) {
		var block = this.find(".block-body");		
		var baseY = this.offset().top + this.outerHeight();
		
		block.toggle( { easing: "swing", step: $.proxy(this.anchor, this, anchor, baseY) } );
	}

	function anchor (anchor, baseY) {
		// keep the bottom in the same place
		switch (anchor) {
			case "BL":
				var newY = baseY - this.outerHeight();
				this.offset({ top: newY });
				break;
		}
	}
	
	return makeCallout;
});
