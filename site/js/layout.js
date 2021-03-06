define(["Helpers", "CalloutLine", "Glossary", "jquery.qtip", "RatingsSystem"], function (Helpers, CalloutLine, Glossary) {
	Layout = function (container, manager, content) {
		this.container = container;
		this.manager = manager;
		
		this.title = content.title;
		this.id = content.id;
		
		this.container.data("layout", this);
		
		this.elements = [];
		this.calloutLines = [];
		
		this.isReady = false;
		this.isActive = false;
		
		this.layoutHost = this.container.parents(".layout");
		
		var beforeHolder = $("<div>", { class: "layout-placeholder before" }).prependTo(this.layoutHost);
		var afterHolder = $("<div>", { class: "layout-placeholder after" }).appendTo(this.layoutHost);
		
		$("<div>", { class: "opinion" }).ratingsSystem("initialize", { title: this.title, id: this.id }).appendTo(afterHolder);
		
		this.layoutHost.css("backgroundColor", Helpers.getColorForChapter(content.chapter));
	}
	
	Layout.prototype = Object.create(null);
	Layout.prototype.constructor = Layout;

	function removeCalloutLines (index, element) {
		element.remove();
	}
	
	Layout.prototype.removeAllCallouts = function () {
		$.each(this.calloutLines, removeCalloutLines);
	}
	
	// add callout lines AFTER the spread is fully laid out
	Layout.prototype.addLineCallouts = function (options) {
		var cells = $.map(this.content.cells, function (el) { return el });
		var hints = $.map(this.layout.hints, function (el) { return el });
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var id = cell.id;
			var hint = Helpers.findByID(id, hints);
			if (hint.callout_target_id) {
				var target_id = hint.callout_target_id;
				var targetDOM;
				if (target_id == "background") {
					targetDOM = this.container.find(".background").parent();
				} else {
					targetDOM = this.getCellDOM(target_id);
				}
				
				var el = this.container.find(options.fromSelector + "[data-id=" + id + "]");
				var sourceDOM = el.find(".block, .diamond, .bounds, .textblock");
				
				var step = sourceDOM.parent();
				
				var line = new CalloutLine(step, sourceDOM, targetDOM, hint.callout_target_pos);
				// lines will be displayed during scrolling or clicking
//				line.elem.css("visibility", "hidden");
				
				this.calloutLines.push(line);
				
				step.data("callout-line", line);
			}
		}	
	}

	Layout.prototype.getCellDOM = function (id) {
		return this.container.find(".cell[data-id=" + id + "]");
	}
	
	Layout.prototype.layoutComplete = function () {
		this.initializeGlossaryTerms();
		
		if (this.manager) {
			this.manager.onLayoutComplete(this);
		}
		
		this.isReady = true;
	}
	
	Layout.prototype.gotoPrevious = function () {
	}

	Layout.prototype.gotoNext = function () {
	}
	
	Layout.prototype.gotoStep = function (n) {
		console.log("got " + n);
	}
	
	Layout.prototype.activate = function () {
		this.isActive = true;
	}
	
	Layout.prototype.deactivate = function () {
		this.isActive = false;
	}

	Layout.prototype.reflow = function () {
	}
	
	Layout.prototype.unload = function () {
		$.each(this.elements, function (index, element) {
			if (this.unload) {
				this.unload();
			}
		});
	}
	
	Layout.prototype.makeSureElementIsOnScreen = function (element, scroller, optional) {
		var wt = element.offset().top;
		
		var h = element.height() + (optional ? optional.height() : 0);
		
		var wh = window.innerHeight;
		
		var cst = wt - wh + h;
		
		if (scroller.scrollTop() < cst) {
			scroller.animate({ scrollTop: cst }, 500);
		}
	}
	
	function htmlEncode (value) {
		return $('<div/>').text(value).html();
	}
	
	Layout.prototype.initializeGlossaryTerms = function () {
		var terms = this.container.find(".glossary");
		
		terms.removeClass("defined").qtip("destroy");
		
		var me = this;

		$.each(terms, function (index, item) {
			var t = $(item).text();
			var def = Glossary.getDefinition(t);
			if (def) {
				$(item).addClass("defined");
				$(item).qtip( {	
								content: htmlEncode(def),
								style:	{
											classes: "qtip-green qtip-rounded glossaryTooltip"
										},
								position: {
											my: "top center",
											at: "bottom center",
											viewport: $("#cboxOverlay"),
											adjust: { method: "shift" },
										},
								show: {
											delay: 500,
											effect: function (offset) {
												$(this).removeClass("animated fadeOutUp").addClass("animated bounceInDown").show(0);
											},
										},
								hide: {
											delay: 500,
											effect: function () {
												$(this).removeClass("animated bounceInDown").addClass("animated fadeOutUp").delay(500);
											}
									},
							} );
			}
		});		
	}
	
	return Layout;
});