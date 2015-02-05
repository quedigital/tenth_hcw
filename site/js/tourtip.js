define(["imagesloaded.pkgd.min", "jquery.ui.widget"], function (imagesLoaded) {

	$.widget("que.TourTip", {

		options: {},

		defaults: { skipButton: false, type: "", arrow: "" },

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
				this.container.position( { my: "center center", at: "center center", of: $(window), collision: "fit" } );
			} else {
				var my, at;

				switch (this.options.arrow) {
					case "top":
						my = "center top";
						at = "center bottom+25px";
						break;
					case "left":
						my = "left center";
						at = "right+25px center";
						break;
					case "right":
						my = "right center";
						at = "left-25px center";
						break;
					case "bottom":
						my = "center bottom";
						at = "center top-25px";
						break;
				}

				this.container.position( { my: my, at: at, of: this.options.target, collision: "fit" });
			}
		},

		refreshControls: function () {
			this.element.find(".blocker").css("display", "block");

			this.element.find(".container").removeClass("arrow arrow-top arrow-left arrow-right arrow-bottom");
			if (this.options.arrow) this.element.find(".container").addClass("arrow arrow-" + this.options.arrow);

			this.container.find(".skip").css("display", this.options.skipButton ? "inline-block" : "none");
			this.container.find(".back").css("display", (this.options.step > 0) ? "inline-block" : "none");
			this.container.find(".cancel").css("display", (this.options.step > 0 && this.options.step < this.options.steps - 1) ? "inline-block" : "none");
			var nextCaption = "Next";
			switch (this.options.step) {
				case 0:
					nextCaption = "Begin";
					break;
				case this.options.steps - 1:
					nextCaption = "Let's Go!";
					break;
			}
			this.container.find(".next").text(nextCaption);
			this.container.find("span.counter").text(this.options.step + 1);
			this.container.find("span.total").text(this.options.steps);
		}
	});
});
