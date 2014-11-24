requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "../../../common/js/jquery-1.11.0.min",
		"pixi": "../../common/js/pixi",
		"TweenLite": "../../common/js/tweenlite.min",
		"DuckWave": "duckwave"
	},
	
	shim: {
		"jquery": {
			export: "$",
		},
	},
});

require(["pixi", "DuckWave"], function (PIXI) {
	// create an new instance of a pixi stage
	var stage = new PIXI.Stage(0xEDF5F5);

	// create a renderer instance
	var renderer = new PIXI.autoDetectRenderer(400, 240);

	// add the renderer view element to the DOM
	document.body.appendChild(renderer.view);

	var loader = new PIXI.AssetLoader([	"art/duck.png",
										"art/arrow.png",
										"art/wave.png",
									]);
	loader.addEventListener("onComplete", initialize);
	loader.load();
	
	function initialize () {
		var wave = new DuckWave(stage, 50, 200);
		// BUG: the GL renderer disregards local transform
		stage.addChild(wave);
		
		requestAnimFrame(animate);
	}
	
	function animate() {
	    requestAnimFrame(animate);

	    renderer.render(stage);
	}
});