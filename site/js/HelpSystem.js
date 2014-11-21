define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo"], function () {

	var tour = [
		{
			target: "#toc-container",
			text: "This is the table of contents",
			setup: [
						{ target: "#toc-container", class: "TOC", type: "command", command: "open" },
						{ target: "#toc-container", class: "TOC", type: "option", key: "leaveOpen", value: true },
					],
			teardown: [
						{ target: "#toc-container", class: "TOC", type: "option", key: "leaveOpen", value: false },
					],
		}
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
				
			$("#next-read").css({ display: "none" });
			$("#prev-read").css({ display: "none" });
			
			$("#content").scrollTop(0);
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
        	
        	doTeardown(details.teardown);
        	
        	this.step += 1;
        	
        	if (this.step >= tour.length) {
        		this.endTour();
        	} else {
        		this.showCurrentTourStep();
        	}
        },
        
        showCurrentTourStep: function () {
        	var details = tour[this.step];
        	
			doSetup(details.setup);
			
        	$(details.target).dimBackground();
        	
        	this.showTourTip(details.target, details.text);
        },
        
        showEndMessage: function () {
			var content = $("<p>").html("This concludes today's tour.");
			var btn = $('<button>', { text: 'Ok' });
			content.append(btn);
		
			var me = this;
			
			$(window).qtip( {
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
			} );
        },
        
		showTourTip: function (target, text) {
			var content = $("<p>").html(text);
			var btn;
			btn = $('<button>', { text: 'Back' });
			content.append(btn);
			btn = $('<button>', { text: 'Next' });
			content.append(btn);
		
			var me = this;
			
			$(target).qtip( {
				content: { text: content },
				style: { classes: "qtip-green qtip-rounded myCustomTooltip" },
				show: { ready: true, modal: { on: true, blur: false }, delay: 1000 },
				hide: false,
				position: { my: "center left", at: "center right" },
				events: {
					render: function (event, api) {
						$("button", api.elements.content).click(function (e) {
							api.hide(e);
						});
					},
					hide: function (event, api) {
						api.destroy();
						$.undim();
						me.advanceTourStep();
					}
				},
			} );
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