define(["Phaser"], function (Phaser) {
	var DEBUG = false;
	
	var MultiSprite = function (game, x, y, details) {
		this.game = game;
		this.details = details;
		
		this.currentKey = undefined;
		this.nextKey = undefined;
		
		Phaser.Sprite.call(this, this.game, x, y, details[0].key);
		/*
		Phaser.Sprite.call(this, this.game, x, y, spritesheets[0]);
		this.animations.add(spritesheets[0]);
		this.play(spritesheets[0], 12, true);
		*/
				
		/*
		this.character = new Phaser.Sprite(this.game, 440, 100, "standing");
		this.character.animations.add("standing");
		this.character.play("standing", 12, true);
		*/
	}

	MultiSprite.prototype = Object.create(Phaser.Sprite.prototype);
	MultiSprite.prototype.constructor = MultiSprite;
	
	MultiSprite.prototype.getDetailsFor = function (key) {
		for (var i = 0; i < this.details.length; i++) {
			if (this.details[i].key == key) {
				return this.details[i];
			}
		}
		
		return undefined;
	}
	
	MultiSprite.prototype.playAnim = function (anim) {
		var old_detail = this.getDetailsFor(this.currentKey);
		var new_detail = this.getDetailsFor(anim);
		
		if (old_detail && old_detail.offset) {
			this.x -= old_detail.offset.x;
			this.y -= old_detail.offset.y;
		}
		
		if (new_detail) {
			var looping = new_detail.looping || false;
			
			if (new_detail.offset) {
				this.x += new_detail.offset.x;
				this.y += new_detail.offset.y;
			}
			
			this.loadTexture(new_detail.key);
			var animation = this.animations.add(new_detail.key);
			if (new_detail.next) {
				this.nextKey = new_detail.next;
				animation.onComplete.add(onAnimationComplete);
			}
			this.play(new_detail.key, 12, looping);
		}
		
		this.currentKey = anim;
	}
	
	function onAnimationComplete (multisprite) {
		if (multisprite.nextKey)
			multisprite.playAnim(multisprite.nextKey);
	}
	
	return MultiSprite;
});