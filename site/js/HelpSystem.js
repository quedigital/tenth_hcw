define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo"], function () {

	var tour = [
		{
			target: "#toc-container",
			text: "This is the table of contents",
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
        
        showCurrentTourStep: function () {
        	var details = tour[this.step];
        	
        	$(details.target).dimBackground();

			var content = $("<p>").html(details.text);
			var btn = $('<button>', { text: 'Ok', class: 'full' });
			content.append(btn);
			
			$(details.target).qtip( {
				content: { text: content },
				style: { classes: "qtip-green qtip-rounded myCustomTooltip" },
				show: { ready: true, modal: { on: true }, delay: 1000 },
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
					}
				},
			} );
        	
        },
    });
});