define(["Phaser"], function (Phaser) {
	var RIGHT_COL = 218;
	
	var Scorer = function (game, x, y) {
		this.game = game;
		
		Phaser.Group.call(this, this.game, null, "scorer");
		this.x = x;
		this.y = y;
		this.game.add.existing(this);

		var sprite = new Phaser.Sprite(this.game, 0, 0, "scorer");
		this.add(sprite);
		
		this.container = new Phaser.Group(this.game);
		this.container.x = 70;
		this.container.y = 48;
		this.add(this.container);

		var g = new Phaser.Graphics(this.game, -17, 0);
		g.beginFill(0xffffff);
		g.drawRect(0, 0, 157, 210);
		this.container.add(g);
		
		this.container.mask = g;
				
		this.rows = [];
		
		// TODO: get & use a better bitmap font
		
		this.scoreTexts = [
			new Phaser.Text(this.game, 60, 280, "GOOD PACKETS RECEIVED:", { font: '10px Arial', fill: 'green' }),
			new Phaser.Text(this.game, 210, 280, "0", { font: '10px Arial', fill: 'green' }),
			new Phaser.Text(this.game, 60, 305, "BAD PACKETS BLOCKED:", { font: '10px Arial', fill: 'green' }),
			new Phaser.Text(this.game, 210, 305, "0", { font: '10px Arial', fill: 'green' }),
			new Phaser.Text(this.game, 60, 330, "BAD PACKETS ALLOWED", { font: '10px Arial', fill: 'red' }),
			new Phaser.Text(this.game, 210, 330, "0", { font: '10px Arial', fill: 'red' })
		];
		
		for (var i = 0; i < 6; i++) {
			var t = this.scoreTexts[i];
			if (i % 2 == 1)
				t.x = RIGHT_COL - t.width;
			this.add(this.scoreTexts[i]);
		}
	};

	Scorer.prototype = Object.create(Phaser.Group.prototype);
	Scorer.prototype.constructor = Scorer;

	Scorer.prototype.updateScores = function (good, blocked, bad) {
		this.scoreTexts[1].setText(good);
		this.scoreTexts[3].setText(blocked);
		this.scoreTexts[5].setText(bad);
		
		for (var i = 1; i < 6; i += 2) {
			var t = this.scoreTexts[i];
			t.x = RIGHT_COL - t.width;
		}
	}
	
	Scorer.prototype.log = function (key, value) {
		var offsets = { "blue packet": { x: 0, y: 0 }, "green packet": { x: 0, y: 0 } };
		
		var row = new Phaser.Group(this.game);
		row.y = this.rows.length * 35;
		this.container.add(row);
		
		if (value == "bad" || value == "blocked") {
			var g = new Phaser.Graphics(this.game, -20, 0);
			g.beginFill(0xffff00);
			g.drawRect(0, 0, 240, 35);
			row.add(g);
		}
		
		if (value == "bad") {
			var sx = new Phaser.Sprite(this.game, -12, 5, "red x");
			row.add(sx);
		}
				
		var sprite = new Phaser.Sprite(this.game, 14, 0, key);
		sprite.rotation = .51;
		sprite.scale.set(1.5, 1.5);
		sprite.anchor.set(0, .5);
		var offset = offsets[key];
		if (offset) {
			sprite.x += offset.x;
			sprite.y += offset.y;
		}
		
		var status = (value == "bad" || value == "blocked") ? "NOT OK" : "OK";
		var color = (value == "bad" || value == "blocked") ? "red" : "green";
		var t = new Phaser.Text(this.game, 85, 11, status, { font: '12px Arial', fill: color });
		row.add(t);

		row.add(sprite);
		
		this.rows.push(row);
		
		if (this.rows.length > 6) {
			this.container.remove(this.rows[0]);
			this.rows.splice(0, 1);
			
			for (var i = 0; i < this.rows.length; i++) {
				var row = this.rows[i];
				this.game.add.tween(row).to({ y: i * 35 }, 300, Phaser.Easing.Cubic.InOut, true);
			}
		}
	}
	
	return Scorer;
});