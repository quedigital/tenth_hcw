define(["pixi", "TweenLite", "jquery"], function (PIXI, TweenLite) {
	var MAX_DUCKS = 10;
	
	function sign (number) {
		return number ? (number < 0 ? -1 : 1) : 1;
	}
	
	DuckWave = function (stage, posx, posy) {
		PIXI.SpriteBatch.call(this);
		
		this.angle = 0;
		this.speed = .025;

		this.position.x = posx;
		this.position.y = posy;
		
		var x = this.position.x;
		var y = this.position.y;
		
		var spacing = 8;

		this.ducks = [];
		
		this.waves = [];
		for (var i = 0; i < 4; i++) {
			this.waves[i] = new PIXI.Sprite.fromImage("art/wave.png");
			this.waves[i].anchor.y = 35 / 70;
			this.waves[i].x = (i - 1) * this.waves[i].width;
			this.waves[i].y = y;
			this.addChild(this.waves[i]);
		}
		
		this.arrows = [];
		for (var i = 0; i < 9; i++) {
			this.arrows[i] = new PIXI.Sprite.fromImage("art/arrow.png");
			this.arrows[i].x = (i - 1) * 103 + 52;
			this.arrows[i].y = y;
			this.arrows[i].anchor.x = .5;
			this.arrows[i].anchor.y = .5;
			this.addChild(this.arrows[i]);
		}
		
		this.RIGHT = 8 * 103 + 52;
		
		var scope = this;
		
		stage.mousedown = $.proxy(this.gotClick, this);
	}

	DuckWave.prototype = Object.create(PIXI.SpriteBatch.prototype);
	DuckWave.prototype.constructor = DuckWave;

	// approximate the curve from the Illustrator file
	DuckWave.prototype.drawSine = function (stage, startX) {
		if (this.graphics == undefined) {
			this.graphics = new PIXI.Graphics();
			stage.addChild(this.graphics);
		}
		
		this.graphics.clear();
		
		this.graphics.lineStyle(2, 0xffffff, 1);
		
		var step = 10;
		var amplitude = 9.6;
		var scale = 16.33;
		var offsetX = -78;
		var offsetY = -23;
		for (var x = 0; x < this.RIGHT; x += step) {
			var y = this.position.y + offsetY + Math.sin((x + offsetX) / scale) * amplitude;
			if (x == 0) {
				this.graphics.moveTo(startX + x, y);
			} else {
				this.graphics.lineTo(startX + x, y);
			}
		}		
	}
	
	DuckWave.prototype.getHeightFromWave = function (x) {
		var step = 10;
		var amplitude = 9.6;
		var scale = 16.33;
		var offsetX = -78;
		var offsetY = -23;
		var waveHeight = Math.sin((x + offsetX) / scale) * amplitude;
		var y = this.position.y + offsetY + waveHeight;
		return y;
	}
	
	DuckWave.prototype.loopGraphics = function () {
		var offset = 0;
		for (var j = 0; j < this.arrows.length; j++) {
			this.arrows[j].position.x = offset + (j - 1) * 103 + 52;
		}
		
		for (var j = 0; j < this.waves.length; j++) {
			this.waves[j].x = (j - 1) * this.waves[j].width;
		}
	}
	
	DuckWave.prototype.updateTransform = function () {
		var sets = this.arrows.length;

		var delta = this.speed * 40;
		
		for (var i = 0; i < sets; i++) {
			var particle = this.arrows[i];
			var x = particle.x + delta;
			if (x > this.RIGHT) {
				// reset all to looping state
				this.loopGraphics();
			} else {
				particle.position.x = x;
			}
			particle.rotation = this.angle + Math.PI * .5;
		}
		
		this.angle += this.speed;
		
		for (var i = 0; i < this.waves.length; i++) {
			var xx = this.waves[i].position.x + delta;
			this.waves[i].position.x = xx;
		}
		
		this.updateDucks();
  	}
  	
  	DuckWave.prototype.updateDucks = function () {
  		for (var i = 0; i < this.ducks.length; i++) {
  			var duck = this.ducks[i];
  			if (duck.landed) {
				var yy = this.getHeightFromWave(-this.waves[0].position.x + duck.x);
				var diff = yy - duck.y;
				// ease it in from last position
				duck.y += Math.min(2, Math.abs(diff)) * sign(diff);
			}
		}
  	}
	
	DuckWave.prototype.gotClick = function (event) {
		var duck = new PIXI.Sprite.fromImage("art/duck.png");
		duck.x = event.global.x;
		duck.y = 0;
		duck.anchor.x = 36 / 54;
		duck.anchor.y = 28 / 38;
		this.stage.addChildAt(duck, 0);
		
		var desty = this.getHeightFromWave(duck.x);

		TweenLite.to(duck.position, .5, { y: desty, ease: Power2.easeOut, onComplete: function () { duck.landed = true; } });
				
		this.ducks.push(duck);
		
		while (this.ducks.length > MAX_DUCKS) {
			var old = this.ducks.splice(0, 1);
			
			this.stage.removeChild(old[0]);
		}
	}
});