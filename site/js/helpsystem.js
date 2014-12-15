define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo", "tourguide"], function () {

	var tour = [
		{
			type: "centered",
			blockWholeScreen: true,
			text: "<p class='centered'>Welcome to the web version of<br/><span class='title'>How Computers Work</span> <img width='100%' src='site/images/HCWX_cover.png'/>Start with a feature tour or jump right in!</p>"
		},
		{
			type: "centered",
			target: ".layout .spread",
			text: "This is the main reading area. Scroll down through this area to follow along with the text."
		},
		{
			target: "#toc-container",
			text: "This is the table of contents. Scroll through this list to see all the topics to explore. Click on a topic that interests you to open it in the main reading area.",
			setup: [
						{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
						{ type: "command", target: "#toc-container", class: "TOC", command: "open", params: { instant: true } },
						{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },
					],
			teardown: [
						{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
					],
		},
		/*
		{
			title: "Pan/Zoom Improvement!",
			text: "We added clickable lead-ins to introduce pan/zoom spreads. You click on them to start going through the steps.",
			setup: [
						{ type: "openTo", spread: "9_2b" },
						{ type: "scrollTo", target: ".preamble" },
					],
			target: ".preamble"
		},
		*/
		/*
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
		*/
		{
			type: "centered",
			blockWholeScreen: true,
			text: "There's much more to explore. Enjoy this exciting new version of <b>How Computers Work</b>!"
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
				this.options.layoutManager.trigger("open-spread", { id: "0_3", replace: true, active: true } );
				
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