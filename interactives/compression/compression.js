// TODO: tracking for end of game
// DONE: enable "compress" button
// DONE: add to "compression dictionary"
// DONE: show "maximum compression" value (and distance from it)
// DONE: start over button
// DONE: welcome dialog
// DONE: dialog to advance to next level
// DONE: tour dialogs animate down
// DONE: highlight compress button when active
// DONE: emit stars after compression
// TODONT: erase word from dictionary? (nah, start over)
// DONE: mark where a pattern has been compressed in the original document
// DONE: show original byte size of document
// DONE: help button

requirejs.config({
    baseUrl: "",
    paths: {
        "jquery": "../../common/js/jquery-1.11.0.min",
        "jquery.ui.widget": "../../site/js/jquery.ui.widget",
        "jquery-tourbus": "../common/js/jquery-tourbus.min",
        "fastclick": "../common/js/fastclick"
    },

    shim: {
        "jquery": {
            export: "$"
        },
        "jquery.ui.widget": {
            export: "$",
            deps: ['jquery']
        },
        "jquery-tourbus": {
            export: "$",
            deps: ['jquery']
        }
    }
});

require(["fastclick", "compressor", "jquery-tourbus"], function (FastClick) {

    $("#game-widget").Compressor();

    var tour = $('#my-tour-id').tourbus({
        onLegStart: function(leg, bus) {
            leg.$el
                .css( { visibility: 'visible', zIndex: 9999 } )
                .addClass("animated fadeInDown").show();
        }
    });

    tour.trigger('depart.tourbus');

    var levelCompleteTour = $("#level-complete-id").tourbus({
        onLegStart: function(leg, bus) {
            leg.$el.find("h3").text(bus.rawData.title);
            leg.$el.find("p").text(bus.rawData.text);
            leg.$el.find("#confirm").text(bus.rawData.buttonText);

            leg.$el
                .removeClass("animated bounceInDown").hide(0)
                .css( { visibility: 'visible', zIndex: 9999, top: 10 } )
                .show(0)
                .addClass("animated bounceInDown")
        },
        onStop: function (tourbus) {
            advanceLevel();
        }
    });

    $("#game-widget").on("compressorlevelcomplete", onLevelComplete);
    $("#game-widget").on("compressorrestart", onRestart);

    $("#btnHelp").click(function () { tour.trigger('destroy').trigger('stop').trigger('depart'); });

    FastClick.attach(document.body);

    function advanceLevel () {
        $("#game-widget").Compressor("advanceLevel");
    }

    function onLevelComplete (event, data) {
        levelCompleteTour.trigger("depart.tourbus");

        if (data.level == 2) {
            // call out of iframe to site (for Google Analytics)
            parent.$("body").trigger("trackedevent", { category: "interactive", action: "complete", label: "compression" });
        }
    }

    function onRestart () {
        tour.trigger("destroy").trigger("stop");
        levelCompleteTour.trigger("destroy").trigger("stop");
    }
});