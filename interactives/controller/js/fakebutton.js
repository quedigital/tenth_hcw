define(["Phaser"], function (Phaser) {
	var DEBUG = false;
	
	var FakeButton = function (game, x, y, w, h) {
		this.game = game;
		
		Phaser.Group.call(this, this.game, null);
		
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		if (DEBUG) {
			var g = new Phaser.Graphics(this.game, 0, 0);
			g.beginFill(0xffff00);
			g.drawRect(0, 0, w, h);
			g.alpha = .4;
			this.add(g);
		}
		
		this.game.input.onDown.add(this.onClickedGame, this);

		this.events = {
							onInputDown: new Phaser.Signal(),
							onPressStatus: new Phaser.Signal(),
							onAddedToGroup: new Phaser.Signal()
						};
						
		this.rectangle = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
	};

	FakeButton.prototype = Object.create(Phaser.Group.prototype);
	FakeButton.prototype.constructor = FakeButton;
	
	FakeButton.prototype.onClickedGame = function () {
		this.rectangle.x = this.worldTransform.tx;
		this.rectangle.y = this.worldTransform.ty;
	
		if (Phaser.Rectangle.containsPoint(this.rectangle, this.game.input.activePointer.positionDown)) {
			this.events.onInputDown.dispatch(this);
		}
	}
	
	FakeButton.prototype.update = function () {
		var isPressing = false;
		
		if (this.game.input.activePointer.isDown) {
			this.rectangle.x = this.worldTransform.tx;
			this.rectangle.y = this.worldTransform.ty;
		
			if (Phaser.Rectangle.contains(this.rectangle, this.game.input.activePointer.x, this.game.input.activePointer.y)) {
				isPressing = true;
			} else {
				isPressing = false;
			}
		} else {
			isPressing = false;
		}
		
		this.events.onPressStatus.dispatch(isPressing);
	}
	
	return FakeButton;
});