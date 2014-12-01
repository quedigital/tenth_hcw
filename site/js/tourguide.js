define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo"], function () {
	$.widget("que.TourGuide", {

		options: {},

		_create: function () {
		},

		beginTour: function () {
			this.step = 0;

			this.addBlocker();
			
			this.preventScrolling();
			
			this.showCurrentTourStep();
		},
		
		endTour: function () {
			this.onTourComplete();
		},
		
		stopTour: function () {
			var details = this.options.tour[this.step];
			
			if (details.teardown)
				doTeardown(details.teardown);
				
			this.removeBlocker();
			this.allowScrolling();				
		},
		
		advanceTourStep: function () {
			var details = this.options.tour[this.step];
			
			if (details.teardown)
				doTeardown(details.teardown);
				
			this.step += 1;
			
			if (this.step >= this.options.tour.length) {
				this.endTour();
			} else {
				this.showCurrentTourStep();
			}
		},

		backOneTourStep: function () {
			var details = this.options.tour[this.step];
			
			if (details.teardown)
				doTeardown(details.teardown);
				
			this.step -= 1;
			
			this.showCurrentTourStep();
		},
		
		showCurrentTourStep: function () {
			var details = this.options.tour[this.step];
			
			if (details.setup) {
				this.doSetup(details.setup);
			} else {
				setTimeout($.proxy(this.onSetupComplete, this), 0);
			}
		},

		onSetupComplete: function () {
			var details = this.options.tour[this.step];
			
			var target;
			if (details.target) target = details.target;
			else target = $(window);
		
			if (details.target)			
				$(details.target).dimBackground();
		
			var options = { type: details.type, block: details.block };
		
			this.showTourTip(target, details.text, options);
		},
		
		preventScrolling: function () {
//			$("html, body").css({'overflow': 'hidden'});
			$(document).bind("touchmove", false);
			$(document).bind("mousewheel", false);
		},
		
		allowScrolling: function () {
//			$("html").css("overflow-y", "visible");
//			$("body").css("overflow-y", "scroll");
			$(document).unbind("touchmove", false);
			$(document).unbind("mousewheel", false);
		},
		
		onTourComplete: function () {
			this.removeBlocker();
			this.allowScrolling();
			
			if (this.options.onComplete) {
				this.options.onComplete();
			}		
		},
		
		showTourTip: function (target, text, options) {
			var content = $("<p>").html(text);
			var div1 = $("<div>", { class: "control-holder" } );
			var div = $("<div>", { class: "button-bar" } );
			div1.append(div);
			
			content.append(div1);
			
			var btn;
			
			if (this.step > 0) {
				btn = $('<button>', { id: "back", text: 'Back' });
				btn.click($.proxy(this.backOneTourStep, this));
				div.append(btn);
			}
			
			if (this.options.skipButton && this.step == 0 && this.options.tour.length > 1) {
				btn = $("<button>", { id: "skip", text: "Skip the Tour" });
				btn.click($.proxy(this.stopTour, this));
				div.append(btn);
			}
			
			if (this.options.tour.length > 1) {
				var t = (this.step + 1) + " of " + (this.options.tour.length);
				div.append("<span>" + t + "</span>", { class: "caption" });
			}

			if (this.step > 0 && this.step < this.options.tour.length - 1) {
				btn = $("<button>", { id: "cancel", text: "Cancel" });
				btn.click($.proxy(this.stopTour, this));
				div.append(btn);
			}
					
			if (this.step < this.options.tour.length - 1) {
				if (this.step == 0) {
					btn = $('<button>', { id: "next", text: 'Begin' });
				} else {
					btn = $('<button>', { id: "next", text: 'Next' });
				}
				btn.click($.proxy(this.advanceTourStep, this));
				div.append(btn);
			} else if (this.step == this.options.tour.length - 1) {
				var caption = this.options.finishedButtonCaption || "Ok";
				
				btn = $('<button>', { id: "next", text: caption });
				btn.click($.proxy(this.advanceTourStep, this));
				div.append(btn);
			}
			
			var me = this;
			
			// make it full-screen modal if there's no target or the target is the whole window
			var modal = target == undefined || $(target).is($(window));
			
			var opts = {
				content: { text: content },
				style: { classes: "qtip-green qtip-rounded myCustomTooltip" },
				show: { ready: true, modal: { on: modal, blur: false }, delay: 1000 },
				hide: false,
				position: { my: "center left", at: "center right", viewport: $(window), adjust: { method: "shift" } },
				events: {
					render: function (event, api) {
						$("button", api.elements.content).click(function (e) {
							api.hide(e);
						});
					},
					
					hide: function (event, api) {
						api.destroy();
						$("#qtip-overlay div").removeClass("dimming");
						$(target).undim();
					}
				},
			};
			
			if (options.block) {
				opts.events.show = function (event, api) {
						$("#qtip-overlay div").addClass("dimming");
					};
			}
			
			if (options.type == "centered") {
				opts.position = { my: "center center", at: "center center" };
			}
			
			$(target).qtip(opts);
		},
		
		doSetup: function (steps) {
			this.setupSteps = steps;
			this.currentStep = 0;
			
			this.doCurrentSetupStep();
		},
		
		doCurrentSetupStep: function () {
			var step = this.setupSteps[this.currentStep];
			var okToProceed = true;
		
			switch (step.type) {
				case "option":
					$(step.target)[step.class]("option", step.key, step.value);
					break;
				case "command":
					$(step.target)[step.class](step.command, step.params);
					break;
				case "openTo":
					var options = { id: step.spread, replace: true, onVisibleCallback: $.proxy(this.advanceSetup, this) }
					$("#toc-container").TOC("openSpread", options);
					okToProceed = false;
					break;
				case "scrollTo":
					var top_third = $(window).height() * .3;			
					$("body").scrollTo(step.target, { axis: "y", duration: 1000, offset: { top: -top_third } });
					setTimeout($.proxy(this.advanceSetup, this), 1000);
					okToProceed = false;
					break;
			}
		
			if (okToProceed) {
				this.advanceSetup();
			}
		},
		
		advanceSetup: function () {
			this.currentStep++;
			if (this.currentStep >= this.setupSteps.length) {
				this.onSetupComplete();
			} else {
				this.doCurrentSetupStep();
			}
		},
		
		addBlocker: function () {
			var blocker = $("<div>", { class: "blocker" });
			blocker.bind("click", function (event) { event.preventDefault(); event.stopImmediatePropagation(); });
			$("body").append(blocker);
		},
		
		removeBlocker: function () {
			$(".blocker").remove();
		}
			
	});
	
	function doTeardown (steps) {
		for (var i = 0; i < steps.length; i++) {
			var step = steps[i];
			switch (step.type) {
				case "option":
					$(step.target)[step.class]("option", step.key, step.value);
					break;
				case "command":
					$(step.target)[step.class](step.command, step.params);
					break;
			}
		}
	}
	
});