requirejs.config({
    baseUrl: "js",
    paths: {
        "jquery": "../../../common/js/jquery-1.11.0.min"
    },

    shim: {
        "jquery": {
            export: "$"
        }
    }
});

require(["jquery"], function () {

    // left @ -240 = 0, 660 = 1

    $("#eye-layer").mousemove(onEyeHover);

    updateLeftEye();
    updateRightEye();

    function updateLeftEye () {
        var x = $("#eyes").position().left;

        var pct = (x + 240) / 900;

        var w = $("#left-eye").width();

        $("#left-eye .barista").css("left", -w * pct * 6.0 + 300);
        $("#left-eye .table").css("left", -w * pct * 5.0 + 310);
        $("#left-eye .counter").css("left", -w * pct * 4.0 + 180);
        $("#left-eye .street").css("left", -w * pct * 1.8 - 315);
    }

    function updateRightEye () {
        var x = $("#eyes").position().left;

        var pct = (x + 240) / 900;

        var w = $("#right-eye").width();

        $("#right-eye .barista").css("left", -w * pct * 6.0 + 80);
        $("#right-eye .table").css("left", -w * pct * 5.0 + 140);
        $("#right-eye .counter").css("left", -w * pct * 4.0 - 10);
        $("#right-eye .street").css("left", -w * pct * 1.8 - 380);
    }

    function onEyeHover (event) {
        $("#eyes").offset({ left: event.pageX - 280 });

        updateLeftEye();
        updateRightEye();
    }

});