define(["Phaser", "Packet"], function (Phaser, Packet) {
	// Follower constructor
	var PacketManager = function (game) {
		this.game = game;
		
		this.events = {
							onPacketComplete: new Phaser.Signal(),
							onPacketLaunched: new Phaser.Signal()
						};
						
		this.events.onPacketComplete.add(this.onPacketComplete, this);
		
		this.packets = [];
		this.maximumPackets = 5;
		this.spawnRate = .02;
		this.lastEmit = 0;		
	}
	
	PacketManager.prototype.constructor = PacketManager;
	
	PacketManager.prototype.onPacketComplete = function (packet) {
		var i = this.packets.indexOf(packet);
		this.packets.splice(i, 1);
		this.game.world.remove(packet, true);
	}
	
	PacketManager.prototype.update = function () {
		if (this.packets.length < this.maximumPackets) {
			var t = this.game.time.elapsedSecondsSince(this.lastEmit);
			if (t > .3) {
				if (Math.random() < this.spawnRate) {
					var path = Math.floor(Math.random() * 3);
					var choices = ["bad", "good"];
					var choice = Math.floor(Math.random() * choices.length);
					this.emitPacket(choices[choice], path);
					this.lastEmit = this.game.time.now;
				}
			}
		}
	}
	
	PacketManager.prototype.emitPacket = function (type, path) {
		var paths = [ [ { x: 0, y: 400 },
						{ x: 80, y: 411 },
						{ x: 130, y: 413 },
						{ x: 190, y: 412 },
						{ x: 250, y: 402 },
						{ x: 315, y: 384 },
						{ x: 418, y: 337 }
					],
					 [ { x: 0, y: 558 },
						{ x: 125, y: 547 },
						{ x: 185, y: 538 },
						{ x: 245, y: 526 },
						{ x: 310, y: 509 },
						{ x: 375, y: 484 },
						{ x: 435, y: 453 },
						{ x: 465, y: 433 },
						{ x: 535, y: 370 },
					],
					 [ { x: 0, y: 708 },
						{ x: 125, y: 683 },
						{ x: 185, y: 669 },
						{ x: 245, y: 652 },
						{ x: 310, y: 633 },
						{ x: 375, y: 610 },
						{ x: 435, y: 585 },
						{ x: 516, y: 544 },
						{ x: 565, y: 512 },
						{ x: 605, y: 479 },
						{ x: 665, y: 405 },
					] ];

		var packet;
		var spriteChoices, choice;
		
		switch (type) {
			case "good":
				spriteChoices = ["green packet", "yellow packet", "blue packet", "sparkly packet"];
				choice = Math.floor(Math.random() * spriteChoices.length);
				animated = choice == 3;
				packet = new Packet(this.game, this.events, { defaultAngle: .45, sprite: spriteChoices[choice], animated: animated } , paths[path]);
				break;
			
			case "bad":
				spriteChoices = ["animated bad packet"];
				choice = Math.floor(Math.random() * spriteChoices.length);
				packet = new Packet(this.game, this.events, { defaultAngle: .45, sprite: spriteChoices[choice], animated: true, fps: 18 }, paths[path]);		
				break;
		}
		
		this.game.add.existing(packet);
		
		this.packets.push(packet);
		
		this.events.onPacketLaunched.dispatch(packet);
	}
	
	return PacketManager;
});
