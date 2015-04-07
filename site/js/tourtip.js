define(["imagesloaded.pkgd.min", "Helpers", "jquery.ui.widget"], function (imagesLoaded, Helpers) {

	function offsetToString (offset) {
		if (offset == 0) return "";
		else if (offset < 0) return offset + "px";
		else if (offset > 0) return "+" + offset + "px";
	}

	$.widget("que.TourTip", {

		options: {},

		defaults: { skipButton: false, type: "", arrow: "", noBlocker: "" },

		_create: function () {
			this.element.addClass("tourtip");

			$("<div>", { class: "blocker" }).appendTo(this.element);

			this.container = $("<div>", { class: "container animated bounceInDown" }).appendTo(this.element);

			var c = $("<div>", { class: "content" }).appendTo(this.container);

			var buttons = $("<div>", { class: "buttons" }).appendTo(this.container);
			var bar = $("<div>", { class: "button-bar" }).appendTo(buttons);
			var backButton = $("<button>", { class: "back", text: "Back" }).appendTo(bar);
			var skipButton = $("<button>", { class: "skip", text: "Skip the Tour" }).appendTo(bar);
			var t = $("<div class='label'><p><span class='counter'>1</span> of <span class='total'>3</span></p></div>").appendTo(bar);
			var nextButton = $("<button>", { class: "next", text: "Next" }).appendTo(bar);
			var cancelButton = $("<button>", { class: "cancel", text: "Cancel" }).appendTo(bar);

			nextButton.click(this.options.onClickNext);
			backButton.click(this.options.onClickBack);
			skipButton.click(this.options.onClickClose);
			cancelButton.click(this.options.onClickClose);
		},

		_destroy: function () {
		},

		_setDefaults: function (opts) {
			for (var each in this.defaults) {
				if (opts[each] == undefined)
					opts[each] = this.defaults[each];
			}
		},

		_setOption: function (key, value) {
			switch (key) {
				case "content":
					this.container.find(".content").html(value);
					imagesLoaded(this.container, $.proxy(this.onImagesLoaded, this));

					break;
				case "options":
					this._setDefaults(value);

					for (var subkey in value) {
						this.options[subkey] = value[subkey];
					}

					this.refreshControls();
					break;
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		},

		hide: function () {
			this.container.css("display", "none");
			this.element.find(".blocker").css("display", "none");
		},

		onImagesLoaded: function () {
			if (this.options.type == "centered") {
				// jquery ui position was not working on ipad to fit within the window (!)
				Helpers.alignElementInWindow(this.container, "center center", "window", "center center");
			} else {
				var my, at;
				var atOffset = [0, 0];

				switch (this.options.arrow) {
					case "left":
						my = "left center";
						at = ["right", "center"];
						atOffset = [25, 0];
						break;
					case "right":
						my = "right center";
						at = ["left", "center"];
						atOffset = [-25, 0];
						break;
					case "bottom":
						my = "center bottom";
						at = ["center", "top"];
						atOffset = [0, -25];
						break;
					case "top":
					default:
						my = "center top";
						at = ["center", "bottom"];
						atOffset = [0, 25];
						break;
				}

				if (this.options.offset) {
					atOffset[0] += this.options.offset[0];
					atOffset[1] += this.options.offset[1];
				}

				var adjustment = Helpers.alignElementInWindow(this.container, my, this.options.target, at.join(" "), atOffset);
				
				// see if we need to adjust the arrow point
				if ( (this.options.arrow == "top" || this.options.arrow == "bottom") && adjustment[0] != 0) {
					var px = Math.round(adjustment[0]);
					Helpers.overrideStyle(".arrow-top:before,.arrow-top:after,.arrow-bottom:before,.arrow-bottom:after { left: calc(50% - " + px + "px) !important; }");
					// kludge to force redraw of arrows
					setTimeout(function () {
							$(".arrow-top,.arrow-bottom").css("overflow", "hidden").height();
							$(".arrow-top,.arrow-bottom").css("overflow", "show");
						}, 0);
				} else if ( (this.options.arrow == "left" || this.options.arrow == "right") && adjustment[1] != 0) {
					var px = Math.round(adjustment[1]);
					Helpers.overrideStyle(".arrow-right:before,.arrow-right:after,.arrow-left:before,.arrow-left:after { top: calc(50% - " + px + "px) !important; }");
					setTimeout(function () {
							$(".arrow-left,.arrow-right").css("overflow", "hidden").height();
							$(".arrow-left,.arrow-right").css("overflow", "show");
						}, 0);
				} else {
					Helpers.overrideStyle("");
				}
			}
		},

		refreshControls: function () {
			if (this.options.noBlocker)
				this.element.find(".blocker").css("display", "none");
			else
				this.element.find(".blocker").css("display", "block");

			this.element.find(".container").removeClass("arrow arrow-top arrow-left arrow-right arrow-bottom");
			if (this.options.arrow) this.element.find(".container").addClass("arrow arrow-" + this.options.arrow);

			this.container.find(".skip").css("display", this.options.skipButton ? "inline-block" : "none");
			this.container.find(".back").css("display", (this.options.step > 0) ? "inline-block" : "none");
			this.container.find(".cancel").css("display", (this.options.step > 0 && this.options.step < this.options.steps - 1) ? "inline-block" : "none");
			var nextCaption = "Next";
			switch (this.options.step) {
				case this.options.steps - 1:
					nextCaption = this.options.options.finishedButtonCaption ? this.options.options.finishedButtonCaption : "Let's Go!";
					break;
				case 0:
					nextCaption = "Begin Tour";
					break;
			}
			this.container.find(".next").text(nextCaption);
			this.container.find("span.counter").text(this.options.step + 1);
			this.container.find("span.total").text(this.options.steps);
		}
	});
});
