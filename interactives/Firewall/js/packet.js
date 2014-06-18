define(["Phaser"], function (Phaser) {
	// Follower constructor
	var Packet = function (game, events, options, path) {
		this.defaultAngle = options.defaultAngle || 0;
		
		Phaser.Sprite.call(this, game, path[0].x, path[0].y, options.sprite || "yellow packet");
		
		if (options.animated) {
			this.animations.add("animation");
			this.animations.play("animation", options.fps || 12, true);
		}

		this.port = options.port || 0;
		
		// Set the pivot point for this sprite to the center
		this.anchor.setTo(0.5, 0.5);

		if (path.length > 1) {
			var firstAngle = Phaser.Math.angleBetween(path[0].x, path[0].y, path[1].x, path[1].y);
			this.rotation = firstAngle + this.defaultAngle;
		} else {
			this.rotation = this.defaultAngle;
		}
		
		this.x = path[0].x;
		this.y = path[0].y;
				
		this.timeElapsed = 0;
		this.curDistance = 0;
		
		this.path = path;
		
		this.totalDistance = 0;
		this.speed = 200;
		
		for (var i = 1; i < path.length; i++) {
			var d = Phaser.Math.distance(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			this.totalDistance += d;
		}
		
		this.onComplete = function () { events.onPacketComplete.dispatch(this); }
		
		/*
		var tween = game.add.tween(this);		
		
		for (var i = 1; i < path.length; i++) {
			var d = Phaser.Math.distance(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			var time = d / SPEED;
			var angle = Phaser.Math.angleBetween(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			tween.to( { x: path[i].x, y: path[i].y, rotation: angle + this.defaultAngle }, time, Phaser.Easing.Linear.None);
		}
		tween.start();
		
		// NOTE: hack to trigger onComplete after LAST tween (not the first)
		var self = this;
		tween._lastChild.onComplete.add(function () { events.onPacketComplete.dispatch(self); });
		//*/
	};

	Packet.prototype = Object.create(Phaser.Sprite.prototype);
	Packet.prototype.constructor = Packet;

	Packet.prototype.update = function (time) {
		this.timeElapsed += this.game.time.physicsElapsed;
		this.curDistance = this.timeElapsed * this.speed;
		
		if (this.curDistance < this.totalDistance) {
			var obj = getPointAlongPath(this.path, this.curDistance);
			this.x = obj.point.x;
			this.y = obj.point.y;
			this.rotation = this.defaultAngle + obj.angle;
		} else {
			if (this.onComplete) {
				this.onComplete();
			}
		}
	}
	
	Packet.prototype.setPath = function (path) {
		this.path = path;
		this.totalDistance = 0;
		for (var i = 1; i < path.length; i++) {
			var d = Phaser.Math.distance(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			this.totalDistance += d;
		}		
	}
	
	function getPointAlongPath (path, distance) {
		var obj = {};
		
		var total = 0, newp;
		for (var i = 1; i < path.length; i++) {
			var d = Phaser.Math.distance(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			if (total + d > distance) {
				var f = (distance - total) / d;
				var p1 = new Phaser.Point(path[i - 1].x, path[i - 1].y);
				var p2 = new Phaser.Point(path[i].x, path[i].y);
				obj.point = Phaser.Point.interpolate(p1, p2, f);
				obj.angle = Phaser.Math.angleBetween(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
				break;
			}
			total += d;
		}
		return obj;
	}
	
	return Packet;
});