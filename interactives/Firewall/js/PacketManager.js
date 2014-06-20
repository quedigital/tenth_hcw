define(["Phaser", "Packet"], function (Phaser, Packet) {
	var PacketManager = function (game, backgroup, frontgroup) {
		this.game = game;
		this.backgroup = backgroup;
		this.frontgroup = frontgroup;
		
		this.events = {
							onPacketComplete: new Phaser.Signal(),
							onPacketLaunched: new Phaser.Signal(),
							onDropPacket: new Phaser.Signal()
						};
						
		this.events.onPacketComplete.add(this.onPacketComplete, this);
		
		this.packets = [];
		this.maximumPackets = 5;
		this.spawnRate = .02;
		this.lastEmit = 0;
		
		this.ports = [];
		
		this.speed = 200;
		
		this.isDragging = false;
	}
	
	PacketManager.prototype.constructor = PacketManager;
	
	PacketManager.prototype.onPacketComplete = function (packet) {
		var i = this.packets.indexOf(packet);
		this.packets.splice(i, 1);
		
		this.backgroup.remove(packet, true);
		this.frontgroup.remove(packet, true);
	}
	
	PacketManager.prototype.update = function () {
		if (this.packets.length < this.maximumPackets) {
			var t = this.game.time.elapsedSecondsSince(this.lastEmit) * this.speed;
			if (t > 60) {
				if (Math.random() < this.spawnRate) {
					var path = Math.floor(Math.random() * 3);
					var choices = ["bad", "good"];
					var choice = Math.floor(Math.random() * choices.length);
					this.emitPacket(choices[choice], path);
					this.lastEmit = this.game.time.now;
				}
			}
		}
		
		var xx = this.game.input.x, yy = this.game.input.y;
		
		var min_d;
		for (var i = 0; i < this.packets.length; i++) {
			var packet = this.packets[i];
			var d = Phaser.Math.distance(xx, yy, packet.x, packet.y);
			if (min_d == undefined || d < min_d) {
				min_d = d;
			}
		}
		
		var s;
		if (min_d) {
			s = Phaser.Math.interpolateFloat(this.speed, min_d, .1);
		} else {
			s = Phaser.Math.interpolateFloat(this.speed, 200, .1);
		}
		
		if (s < 20) s = 20;
		else if (s > 200) s = 200;		
		
		this.speed = s;
	}
	
	// move all packets on this line to the front and switch their paths
	PacketManager.prototype.closePort = function (index) {
		this.ports[index] = false;
		
		for (var i = 0; i < this.packets.length; i++) {
			var packet = this.packets[i];
			if (packet.port == index) {
				this.frontgroup.add(packet);
				packet.setPath(this.closedPaths[index]);
			}
		}
	}

	PacketManager.prototype.openPort = function (index) {
		this.ports[index] = true;
		
		for (var i = 0; i < this.packets.length; i++) {
			var packet = this.packets[i];
			if (packet.port == index) {
				this.backgroup.add(packet);	
				packet.setPath(this.openPaths[index]);
			}
		}
	}
	
	PacketManager.prototype.emitPacket = function (type, port) {
		this.openPaths = [ [ { x: 0, y: 400 },
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
					],
				 ];
		this.closedPaths = [
						[ { x: 0, y: 400 },
						{ x: 80, y: 411 },
						{ x: 130, y: 413 },
						{ x: 190, y: 412 },
						{ x: 250, y: 402 },
						{ x: 315, y: 384 },
						{ x: 380, y: 350 },
						{ x: 380, y: 430 }
					],
					 [ { x: 0, y: 558 },
						{ x: 125, y: 547 },
						{ x: 185, y: 538 },
						{ x: 245, y: 526 },
						{ x: 310, y: 509 },
						{ x: 375, y: 484 },
						{ x: 435, y: 453 },
						{ x: 465, y: 433 },
						{ x: 518, y: 390 },
						{ x: 519, y: 480 },
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
						{ x: 658, y: 425 },
						{ x: 661, y: 499 },
					]
				];

		var packet;
		var spriteChoices, choice;
		
		var portIsClosed = this.ports[port] == false;
		
		var thePath = portIsClosed ? this.closedPaths[port] : this.openPaths[port];
		
		switch (type) {
			case "good":
				spriteChoices = ["green packet", "yellow packet", "blue packet", "sparkly packet"];
				choice = Math.floor(Math.random() * spriteChoices.length);
				animated = choice == 3;
				packet = new Packet(this.game, this, this.events, { port: port, defaultAngle: .45, sprite: spriteChoices[choice], animated: animated }, thePath);
				break;
			
			case "bad":
				spriteChoices = ["animated bad packet"];
				choice = Math.floor(Math.random() * spriteChoices.length);
				packet = new Packet(this.game, this, this.events, { port: port, defaultAngle: .45, sprite: spriteChoices[choice], animated: true, fps: 18 }, thePath);		
				break;
		}
		
		if (portIsClosed)
			this.frontgroup.add(packet);
		else
			this.backgroup.add(packet);
		
		packet.inputEnabled = true;
		packet.input.enableDrag(true, true);
		packet.events.onDragStart.add(this.startDraggingPacket, this);
		packet.events.onDragStop.add(this.stopDraggingPacket, this);
		
		this.packets.push(packet);
		
		this.events.onPacketLaunched.dispatch(packet);
	}
	
	PacketManager.prototype.startDraggingPacket = function (packet) {
		this.isDragging = true;
		
		packet.beginDrag();
		this.frontgroup.add(packet);
	}
	
	PacketManager.prototype.stopDraggingPacket = function (packet) {
		this.isDragging = false;

		// put the packet back into the correct group
		var port = packet.port;
		var portIsClosed = this.ports[port] == false;
				
		if (portIsClosed)
			this.frontgroup.add(packet);
		else
			this.backgroup.add(packet);
			
		this.events.onDropPacket.dispatch(packet);
	}
	
	return PacketManager;
});
