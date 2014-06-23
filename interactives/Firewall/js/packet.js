define(["Phaser"], function (Phaser) {
	// Follower constructor
	var Packet = function (game, manager, events, options, path) {
		this.manager = manager;
		
		this.defaultAngle = options.defaultAngle || 0;
		
		Phaser.Sprite.call(this, game, path[0].x, path[0].y, options.sprite || "yellow packet");
		
		if (options.animated) {
			this.animations.add("animation");
			this.fps = options.fps || 12;
//			this.animations.play("animation", options.fps || 12, true);
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
		
		this.autopilot = true;
		
		this.good = true;
		
		this.bounced = false;
		
		for (var i = 1; i < path.length; i++) {
			var d = Phaser.Math.distance(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
			this.totalDistance += d;
		}
		
//		this.onComplete = function () { events.onPacketComplete.dispatch(this); }
		
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

	Packet.prototype.isPacket = function () { return true; }
	
	Packet.prototype.onComplete = function () {
		this.manager.events.onPacketComplete.dispatch(this);
	}
	
	Packet.prototype.beginDrag = function () {
		this.isDragging = true;
		this.scale.x = this.scale.y = 1.5;
		this.bringToTop();
	}
	
	Packet.prototype.startAnimating = function () {
			this.animations.play("animation", this.fps || 12, true);
	}
	
	Packet.prototype.resumeCourse = function () {
		var obj = getPointAlongPath(this.path, this.curDistance);
		var x = obj.point.x;
		var y = obj.point.y;
		
		this.autopilot = false;
		
		this.game.add.tween(this.scale).to({ x: 1, y: 1 }, 100, Phaser.Easing.Linear.None, true);
		
		this.resumeTween = this.game.add.tween(this).to({ x: x, y: y }, 100, Phaser.Easing.Linear.None, true)
			.onComplete.add(this.onResumed, this);
	}
	
	Packet.prototype.onResumed = function () {
		this.autopilot = true;
	}
	
	Packet.prototype.update = function (time) {
		if (this.manager.isDragging || !this.autopilot) return;
		
		this.timeElapsed += this.game.time.physicsElapsed;
		this.curDistance += this.game.time.physicsElapsed * this.manager.speed;//this.speed;
		
		if (this.curDistance < this.totalDistance) {
			var obj = getPointAlongPath(this.path, this.curDistance);
			this.x = obj.point.x;
			this.y = obj.point.y;
			this.rotation = this.defaultAngle + obj.angle;
			if (obj.bounce && !this.bounced) {
				this.bounced = true;
				this.game.add.tween(this).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
			}
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
				obj.bounce = path[i - 1].bounce;
				break;
			}
			total += d;
		}
		return obj;
	}
	
	return Packet;
});