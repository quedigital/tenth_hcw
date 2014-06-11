define(["Phaser"], function (Phaser) {
	// Follower constructor
	var Packet = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, "bad packet");

		// Set the pivot point for this sprite to the center
		this.anchor.setTo(0.5, 0.5);
		
		this.rotation = .52;
		
		// TODO: don't loop this (is there a way to repeat without looping?)
		var tween = game.add.tween(this).to({ x: 250, y: 360, rotation: .5 }, 500, Phaser.Easing.Linear.None)
			.to({ x: 450, y: 300, rotation: 0 }, 500, Phaser.Easing.Linear.None)
			.start();
		
		// NOTE: hack to trigger onComplete after LAST tween (not the first)
		var me = this;
		tween._lastChild.onComplete.add(function () { me.x = x; me.y = y; me.rotation = .52; tween.start(); });
	};

	Packet.prototype = Object.create(Phaser.Sprite.prototype);
	Packet.prototype.constructor = Packet;

	Packet.prototype.update = function () {
	};
	
	return Packet;
});