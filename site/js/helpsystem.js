define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo"], function () {

	var tour = [
		{
			type: "centered",
			block: true,
			text: "Welcome to the web version of How Computers Work <img width='50' src='https://s3.amazonaws.com/HCW10/Images/0/0000_fig01.jpg'/>"
		},
		{
			target: "#options-button",
			text: "This is the menu button. Click it to see a list of options.",
			setup: [
						{ target: "#toc-container", class: "TOC", type: "command", command: "closeMenus" },
						{ target: "#toc-container", class: "TOC", type: "command", command: "openImmediate" },
						{ target: "#toc-container", class: "TOC", type: "option", key: "leaveOpen", value: true },
					],
			teardown: [
						{ target: "#toc-container", class: "TOC", type: "option", key: "leaveOpen", value: false },
					],
		},
		{
			target: "#toc-container",
			text: "This is the table of contents. All the chapters live here in one tiny box.",
			setup: [
						{ target: "#toc-container", class: "TOC", type: "command", command: "closeMenus" },
						{ target: "#toc-container", class: "TOC", type: "command", command: "open" },
						{ target: "#toc-container", class: "TOC", type: "option", key: "leaveOpen", value: true },
					],
			teardown: [
						{ target: "#toc-container", class: "TOC", type: "option", key: "leaveOpen", value: false },
					],
		},
	];

    $.widget("que.HelpSystem", {

        options: {},

        _create: function () {
            if (this.options.manualLink)
				$(this.options.manualLink).click($.proxy(this.showManual, this));
				
			if (this.options.tourLink)
				$(this.options.tourLink).click($.proxy(this.beginTour, this));
        },

        showManual: function () {
        	if (this.options.layoutManager)
				this.options.layoutManager.trigger("open-spread", { id: "0_3", replace: true } );
				
			$(".banner").css({ display: "none" });
			
			$("#content").scrollTop(0);
			
			$("#toc-container").TOC("closeToggler");
        },

        beginTour: function () {
        	this.step = 0;
        	
        	this.showCurrentTourStep();
        },
        
        endTour: function () {
        	this.showEndMessage();
        },
        
        advanceTourStep: function () {
        	var details = tour[this.step];
        	
        	if (details.teardown)
				doTeardown(details.teardown);
				
			$("html").css("overflow-y", "visible");
			$("body").css("overflow-y", "scroll");
        	
        	this.step += 1;
        	
        	if (this.step >= tour.length) {
        		this.endTour();
        	} else {
        		this.showCurrentTourStep();
        	}
        },
        
        showCurrentTourStep: function () {
        	var details = tour[this.step];
        	
        	if (details.setup)
				doSetup(details.setup);

			var me = this;
			
			setTimeout(function () {
				var target;
				if (details.target) target = details.target;
				else target = $(window);
			
				if (details.target)			
					$(details.target).dimBackground();
			
				$("html, body").css({'overflow': 'hidden'});
				
				var options = { type: details.type, block: details.block };
			
				me.showTourTip(target, details.text, options);
			}, 0);
        },
        
        showEndMessage: function () {
			var content = $("<p>").html("This concludes today's tour.");
			var btn = $('<button>', { text: 'Ok', class: "full" });
			content.append(btn);
		
			var me = this;
			
			var options = {
				content: { text: content },
				style: { classes: "qtip-green qtip-rounded myCustomTooltip" },
				show: { ready: true, modal: { on: true, blur: true }, delay: 1000 },
				hide: false,
				position: { my: "center center", at: "center center" },
				events: {
					render: function (event, api) {
						$("button", api.elements.content).click(function (e) {
							api.hide(e);
						});
					},
					
					show: function (event, api) {
						$("#qtip-overlay div").addClass("dimming");
					},
					
					hide: function (event, api) {
						$("#qtip-overlay div").removeClass("dimming");
						api.destroy();
					}
				},
			};
			
			$(window).qtip(options);
        },
        
		showTourTip: function (target, text, options) {
			var content = $("<p>").html(text);
			var div = $("<div>", { class: "two-button-holder" } );
			content.append(div);
			
			var btn;
			btn = $('<button>', { text: 'Back' });
			div.append(btn);
			btn = $('<button>', { text: 'Next' });
			div.append(btn);
		
			var me = this;
			
			var opts = {
				content: { text: content },
				style: { classes: "qtip-green qtip-rounded myCustomTooltip" },
				show: { ready: true, modal: { on: true, blur: false }, delay: 1000 },
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
						me.advanceTourStep();
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
		}
    });
    
    function doSetup (steps) {
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