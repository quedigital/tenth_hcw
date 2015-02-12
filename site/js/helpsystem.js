define(["jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo", "tourguide"], function () {

	var tour = [
		{
			type: "centered",
			blockWholeScreen: true,
			skipButton: true,
			text: "<p class='centered'>Welcome to the web version of<br/><span class='title'>How Computers Work</span> <img width='100%' src='site/images/HCWX_cover.png'/>Start with a feature tour or jump right in!</p>",
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "close", params: { instant: true } },
			],
		},
		{
			type: "centered",
			target: ".layout .spread",
			text: "This is the main reading area. Scroll down and new pages will continue to appear.",
			setup: [
				{ type: "openTo", spread: "3_2" },
			],
		},
		{
			target: ".step:first",
			arrow: "top",
			text: "You will see two different page styles. The first style, shown here, has numbered steps from left to right, top to bottom.",
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "close", params: { instant: true } },
				{ type: "scrollTo", target: ".diamond" },
			],
		},
		{
			text: "Click on any of the images in the book to zoom in on them.",
			target: ".image:eq(2)",
			arrow: "bottom",
			setup: [
				{ type: "scrollTo", target: ".image:eq(2)" },
			],
		},
		{
			text: "You can zoom in further using these buttons or your mousewheel.",
			target: "button#zoomin",
			arrow: "top",
			setup: [
				{ type: "command", target: ".image:eq(2)", trigger: "imageZoom" },
				{ type: "delay", amount: 1000 }
			],
			teardown: [
				{ type: "command", target: ".image:eq(2)", trigger: "closeZoom", params: "fast" },
				{ type: "delay", amount: 300 },
			],
		},
		{
			text: "Close the image zoomer with this button.",
			target: "button#cboxClose",
			arrow: "bottom",
			setup: [
				{ type: "delay", amount: 300 },
				{ type: "command", target: ".image:eq(2)", trigger: "imageZoom" },
				{ type: "delay", amount: 1000 }
			],
			teardown: [
				{ type: "command", target: ".image:eq(2)", trigger: "closeZoom", params: "fast" },
				{ type: "delay", amount: 300 },
			],
		},
		{
			text: "Some step numbers have an animated yellow border around them which means they contain pointer arrows. Hover over (or touch) these steps to see what they're pointing to.",
			target: ".cell[data-id=12] .step",
			arrow: "top",
			noDim: true,
			setup: [
				{ type: "openTo", spread: "3_2" },
				{ type: "scrollTo", target: ".cell[data-id=12] .step" },
				{ type: "command", delay: 2500, target: ".cell[data-id=12] .step", trigger: "calloutOn" },
			],
			teardown: [
				{ type: "command", target: ".cell[data-id=12] .step", trigger: "calloutOff" },
			]
		},
		{
			text: "Look for the yellow <strong>interactive</strong> tag. These are simulations and activities to interact with, either in-place or full-screen. Try clicking on this one!",
			target: ".cell[data-id=10]",
			arrow: "top",
			noBlocker: true,
			setup: [
				{ type: "openTo", spread: "1_1" },
				{ type: "scrollTo", target: ".cell[data-id=10]" },
			]
		},
		{
			text: "After each page, you'll find a <strong>Ratings and Comments</strong> tab. Hover or tap it to open it. Use it to add your rating or comments to the page you just read.",
			target: "#opinion",
			offset: [-30, 0],
			arrow: "right",
			setup: [
				{ type: "command", target: "#opinion", trigger: "openRatings" },
				{ type: "scrollTo", target: "#opinion" },
			]
		},
		{
			type: "centered",
			text: "This is the second style of page: a <strong>Pan & Zoom</strong>. When reading this style of page, you'll zoom in and around a single large image.",
			setup: [
				{ type: "openTo", spread: "2_4" },
				{ type: "scrollTo", target: ".viewport" },
			]
		},
		{
			text: "Read about each step in this scrollable box.",
			target: ".text_holder",
			offset: [30, 0],
			arrow: "left",
			setup: [
				{ type: "command", target: ".panzoom", trigger: "beginPresentation" },
				{ type: "delay", amount: 1000 }
			]
		},
		{
			text: "You can see all the steps (or sometimes sub-topics) listed here.",
			target: ".main-buttons",
			arrow: "bottom"
		},
		{
			text: "Use these three buttons to go forward or backward one step, or to zoom back out.",
			target: ".nav-buttons",
			arrow: "bottom",
			noDim: true,
			setup: [
				{ type: "command", delay: 2000, target: ".panzoom", trigger: "advanceStep" }
			]
		},
		{
			target: "#toc-container",
			arrow: "left",
			text: "This is the table of contents. Scroll through this list to see all the parts, chapters, and pages of the book. Clicking on a heading will open it in the main reading area.",
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
				{ type: "command", target: "#toc-container", class: "TOC", command: "open", params: { instant: true } },
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },
			],
			teardown: [
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
			],
		},
		{
			text: "This is the menu button.",
			target: "#options-button",
			arrow: "left",
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
			text: "Here you'll find links to your account, customer support, and your favorite pages, based on what you've rated so far.",
			target: "#menu",
			arrow: "left",
			noDim: true,
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
				{ type: "command", target: "#toc-container", class: "TOC", command: "openImmediate" },
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },
				{ type: "command", target: "#toc-container", trigger: "openMenu" },
				{ type: "delay", amount: 500 }
			],
			teardown: [
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
			],
		},
		{
			text: "This is the help button.",
			target: "#big-help-button",
			arrow: "left",
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
			text: "Here you'll find links to further help, as well as a list of news and updates.",
			target: "#help-menu",
			arrow: "left",
			noDim: true,
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
				{ type: "command", target: "#toc-container", class: "TOC", command: "openImmediate" },
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },
				{ type: "command", target: "#toc-container", trigger: "openHelp" },
				{ type: "delay", amount: 500 }
			],
			teardown: [
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
			]
		},
		{
			text: "If you're looking for a specific topic or technology to learn about, use these buttons. One button searches all text and the other searches a list of keywords.",
			target: "#toc-footer",
			arrow: "bottom",
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "closeMenus" },
				{ type: "command", target: "#toc-container", class: "TOC", command: "openImmediate" },
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true }
			],
			teardown: [
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
			]
		},
		{
			text: "Clicking either search button will open the Search Window. Type the words you're searching for into search box.",
			type: "centered",
			setup: [
				{ type: "command", target: "#toc-container", class: "TOC", command: "close", params: { instant: true } },
				{ type: "command", target: "#toc-container", trigger: "showSearch" },
			],
			teardown: [
				{ type: "command", target: "#search-window", trigger: "hide" }
			]
		},
		{
			type: "centered",
			text: "Here we've searched for <strong>transistor</strong> and the result pages appear underneath as clickable boxes. You can also further filter the results by clicking the keyword buttons above.",
			setup: [
				{ type: "command", target: "#toc-container", trigger: "showSearch", params: "transistor" },
			],
			teardown: [
				{ type: "command", target: "#search-window", trigger: "hide" }
			]
		},
		{
			type: "centered",
			blockWholeScreen: true,
			text: "Now see what else you can learn from this exciting new version of <b>How Computers Work</b>!",
			teardown: [
				{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
			],
		},
	];

    $.widget("que.HelpSystem", {

        options: {},

        _create: function () {
            if (this.options.manualLink)
				$(this.options.manualLink).click($.proxy(this.showManual, this));
				
			if (this.options.tourLink)
				$(this.options.tourLink).click($.proxy(this.beginGuidedTour, this));

	        if (this.options.newsLink)
	            $(this.options.newsLink).click($.proxy(this.showNews, this));
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

	    showNews: function () {
		    $("#toc-container").TOC("onClickNewsButton");
	    }
    });
});