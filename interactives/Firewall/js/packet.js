define(["Phaser"], function (Phaser) {
	// Follower constructor
	var Packet = function (game, defaultAngle, path) {
		var SPEED = .2;
		
		Phaser.Sprite.call(this, game, path[0].x, path[0].y, "bad packet");

		// Set the pivot point for this sprite to the center
		this.anchor.setTo(0.5, 0.5);

		if (path.length > 1) {
			var firstAngle = Phaser.Math.angleBetween(path[0].x, path[0].y, path[1].x, path[1].y);
			this.rotation = firstAngle + defaultAngle;
		} else {
			this.rotation = defaultAngle;
		}
		
		this.x = path[0].x;
		this.y = path[0].y;
				
		var tween = game.add.tween(this);
		
		for (var i = 1; i < path.length; i++) {
			var d = Phaser.Math.distance(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			var time = d / SPEED;
			var angle = Phaser.Math.angleBetween(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			tween.to( { x: path[i].x, y: path[i].y, rotation: angle + defaultAngle }, time, Phaser.Easing.Linear.None);
		}
		tween.start();
		
		// NOTE: hack to trigger onComplete after LAST tween (not the first)
		var me = this;
		tween._lastChild.onComplete.add(function () { me.x = path[0].x; me.y = path[0].y; me.rotation = firstAngle + defaultAngle; tween.start(); });
	};

	Packet.prototype = Object.create(Phaser.Sprite.prototype);
	Packet.prototype.constructor = Packet;

	Packet.prototype.update = function () {
	};
	
	return Packet;
});