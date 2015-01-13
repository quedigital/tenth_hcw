requirejs.config({
    baseUrl: "js",
    paths: {
        "jquery": "../../../common/js/jquery-1.11.0.min",
        "hammerjs": "../../common/js/hammer.min",
        "hammer": "../../common/js/jquery.hammer",
        "Helpers": "../../../common/js/helpers"
    },

    shim: {
        "jquery": {
            export: "$"
        }
        /*
        "jquery.hammer": {
            export: "$",
            deps: ['jquery']
        },
        */
    }
});

require(["Helpers", "jquery", "hammer", ], function (Helpers) {

    // left @ -255 = 0
    // right @ 265 = 1

    if (Helpers.isTouchEnabled()) {
        $(".eye-label").text("Swipe the eyes back and forth to see the parallax effect.");
    }

    $("#eye-layer").mousemove(onEyeHover);

    $("#eye-layer").hammer({}).bind("pan", onEyePan);

    /*
    var hammertime = new Hammer($("eye-layer"), {});
    hammertime.on('pan', function(ev) {
        console.log(ev);
    });
    */

    updateLeftEye();
    updateRightEye();

    function updateLeftEye () {
        var x = $("#eyes").position().left;

        var pct = (x + 255) / 600;

        var w = $("#left-eye").width();

        $("#left-eye .barista").css("left", -w * pct * 4.3 + 350);
        $("#left-eye .table").css("left", -w * pct * 3.6 + 380);
        $("#left-eye .counter").css("left", -w * pct * 3.2 - 220);
        $("#left-eye .street").css("left", -w * pct * 1.8 - 315);
    }

    function updateRightEye () {
        var x = $("#eyes").position().left;

        var pct = (x + 335) / 600;

        var w = $("#right-eye").width();

        $("#right-eye .barista").css("left", -w * pct * 4.3 + 350);
        $("#right-eye .table").css("left", -w * pct * 3.6 + 380);
        $("#right-eye .counter").css("left", -w * pct * 3.2 - 220);
        $("#right-eye .street").css("left", -w * pct * 1.8 - 315);
    }

    function onEyeHover (event) {
        $("#eyes").offset({ left: event.pageX - 295 });

        updateLeftEye();
        updateRightEye();
    }

    function onEyePan (event) {
        var xx = event.gesture.center.x - 295;

        $("#eyes").offset({ left: xx });

        updateLeftEye();
        updateRightEye();
    }

});