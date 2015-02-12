define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo", "tourtip"], function () {
	$.widget("que.TourGuide", {

		options: {},

		_create: function () {
		},

		beginTour: function () {
			this.tourtip = $("<div>").TourTip( {
				onClickNext: $.proxy(this.onClickNext, this),
				onClickBack: $.proxy(this.onClickBack, this),
				onClickClose: $.proxy(this.stopTour, this)
			} );

			$("body").append(this.tourtip);

			this.step = 0;

//			this.addBlocker();
			
			this.preventScrolling();
			
			this.showCurrentTourStep();
		},

		onClickNext: function () {
			this.advanceTourStep();
		},

		onClickBack: function () {
			this.backOneTourStep();
		},

		endTour: function () {
			this.onTourComplete();
		},
		
		stopTour: function () {
			this.tourtip.TourTip("hide");

			$.undim();

			var details = this.options.tour[this.step];
			
			var me = this;
			
			if (details.teardown)
				this.doTeardown(details.teardown, function () { me.allowScrolling(); });
			else
				me.allowScrolling();
		},
		
		advanceTourStep: function () {
			$.undim();

			var details = this.options.tour[this.step];
			
			if (details.teardown)
				this.doTeardown(details.teardown, this.doAdvanceTourStep);
			else
				this.doAdvanceTourStep();
		},
		
		doAdvanceTourStep: function () {
			this.step += 1;
			
			if (this.step >= this.options.tour.length) {
				this.endTour();
			} else {
				this.showCurrentTourStep();
			}
		},

		backOneTourStep: function () {
			$.undim();

			var details = this.options.tour[this.step];
			
			if (details.teardown)
				this.doTeardown(details.teardown, this.doBackOneTourStep);
			else
				this.doBackOneTourStep();
		},
		
		doBackOneTourStep: function () {
			this.step -= 1;
			
			this.showCurrentTourStep();
		},
		
		showCurrentTourStep: function () {
			$.undim();

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
		
			if (details.target && !details.noDim)	{
				$(details.target).dimBackground();
			}
		
			//var options = { type: details.type, blockWholeScreen: details.blockWholeScreen, target: details.target };
		
			this.showTourTip(target, details.text, details);
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
			this.tourtip.TourTip("hide");

//			this.removeBlocker();
			this.allowScrolling();
			
			if (this.options.onComplete) {
				this.options.onComplete();
			}		
		},
		
		hideLastPopup: function () {
			console.log("hide last popup");
			var step = this.step > 0 ? this.step - 1 : 0;

			var popup = this.options.tour[step].popup;
			if (popup) {
				var api = popup.qtip("api");
				if (api) {
					api.hide();
				}
			}
		},

		showTourTip: function (target, text, options) {
			var opts = { step: this.step, steps: this.options.tour.length };

			$.extend(opts, options);

			this.tourtip.TourTip("option", { target: target, content: text, options: opts } );
//			this.tourtip.position( { my: "center", at: "center", of: $(window), collision: "fit" } );
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
				case "delay":
					setTimeout($.proxy(this.advanceSetup, this), step.amount);
					okToProceed = false;
					break;
				case "option":
					$(step.target)[step.class]("option", step.key, step.value);
					break;
				case "command":
					if (step.delay) {
						if (step.class) {
							setTimeout(function () { $(step.target)[step.class](step.command, step.params) }, step.delay);
						} else if (step.trigger) {
							setTimeout(function () { $(step.target).trigger(step.trigger, step.params) }, step.delay);
						}
					} else {
						if (step.class) {
							$(step.target)[step.class](step.command, step.params);
						} else if (step.trigger) {
							$(step.target).trigger(step.trigger, step.params);
						}
					}
					break;
				case "openTo":
					var options = { id: step.spread, replace: true, onVisibleCallback: $.proxy(this.advanceSetup, this) }
					$("#toc-container").TOC("openSpread", options);
					okToProceed = false;
					break;
				case "scrollTo":
					var top_third = window.innerHeight * .3;			
					$(window).scrollTo(step.target, { axis: "y", duration: 1000, offset: { top: -top_third } });
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
		},
		
		doTeardown: function (steps, callback) {
			this.setupSteps = steps;
			this.currentStep = 0;
			
			this.teardownCallback = callback;
			
			this.doCurrentTeardownStep();
		},
		
		advanceTeardown: function () {
			this.currentStep++;
			if (this.currentStep >= this.setupSteps.length) {
				this.teardownCallback();
			} else {
				this.doCurrentTeardownStep();
			}
		},
		
		doCurrentTeardownStep: function () {
			var step = this.setupSteps[this.currentStep];
			var okToProceed = true;
		
			switch (step.type) {
				case "option":
					$(step.target)[step.class]("option", step.key, step.value);
					break;
				case "command":
					if (step.class) {
						$(step.target)[step.class](step.command, step.params);
					} else if (step.trigger) {
						$(step.target).trigger(step.trigger, step.params);
					}
					break;
				case "delay":
					setTimeout($.proxy(this.advanceTeardown, this), step.amount);
					okToProceed = false;
					break;
			}
			
			if (okToProceed) {
				this.advanceTeardown();
			}
		}			
	});
	
	
});