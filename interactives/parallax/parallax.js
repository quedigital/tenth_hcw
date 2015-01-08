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

    console.log("Hello");
    console.log($("body"));

});