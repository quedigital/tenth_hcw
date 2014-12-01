define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo", "tourguide"], function () {

	var tour = [
		{
			type: "centered",
			block: true,
			text: "Welcome to the web version of How Computers Work <img width='50' src='images/HCWX_cover.png'/>"
		},
		{
			title: "Pan/Zoom Improvement!",
			text: "We added clickable lead-ins to introduce pan/zoom spreads. You click on them to start going through the steps.",
			setup: [
						{ type: "openTo", spread: "9_2b" },
						{ type: "scrollTo", target: ".preamble" },
					],
			target: ".preamble"
		},
		{
			target: "#options-button",
			text: "This is the menu button. Click it to see a list of options.",
			setup: [
						{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
						{ type: "command", target: "#toc-container", class: "TOC", command: "openImmediate" },
						{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },
					],
			teardown: [
						{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
					],
		},
		{
			target: "#toc-container",
			text: "This is the table of contents. All the chapters live here in one tiny box.",
			setup: [
						{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
						{ type: "command", target: "#toc-container", class: "TOC", command: "open" },
						{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },
					],
			teardown: [
						{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
					],
		},
		{
			type: "centered",
			block: true,
			text: "This concludes today's tour. Thank you for coming."
		},
	];

    $.widget("que.HelpSystem", {

        options: {},

        _create: function () {
            if (this.options.manualLink)
				$(this.options.manualLink).click($.proxy(this.showManual, this));
				
			if (this.options.tourLink)
				$(this.options.tourLink).click($.proxy(this.beginGuidedTour, this));
        },

        showManual: function () {
        	if (this.options.layoutManager)
				this.options.layoutManager.trigger("open-spread", { id: "0_3", replace: true } );
				
			$(".banner").css({ display: "none" });
			
			$("#content").scrollTop(0);
			
			$("#toc-container").TOC("closeToggler");
        },

        beginGuidedTour: function () {
			var guide = $("body").TourGuide({ tour: tour, skipButton: true, finishedButtonCaption: "Let's Go!" });
			guide.TourGuide("beginTour");
        },
    });
});