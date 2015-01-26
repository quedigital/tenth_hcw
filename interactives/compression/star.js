define(["jquery.ui.widget"], function () {

	var MAX_TICKS = 50;

	$.widget("que.Star", {

		options: {},

		_create: function () {
			this.element.css( { left: this.options.left, top: this.options.top });

			this.element.addClass("star");

			$("<img src='assets/star.png'>").appendTo(this.element);

			this.scale = Math.random() * 1.5 + .5;

			var angle = (Math.random() * Math.PI * .25) - Math.PI * .6;

			var dx = Math.cos(angle);
			var dy = Math.sin(angle);
			var speed = Math.random() * 5 + 3;

			this.velocity = { x: dx * speed, y: dy * speed };

			this.tx = 0, this.ty = 0;

			this.updateTransform();

			this.ticksToLive = MAX_TICKS;

			this.timer = setInterval($.proxy(this.onUpdate, this), 16);
		},

		updateTransform: function () {
			var scale = "scale(" + this.scale + ")";
			var translate = "translate3d(" + this.tx + "px," + this.ty + "px,0)";

			this.element.css("transform", scale + " " + translate);

		},

		onUpdate: function () {
			this.ticksToLive--;

			this.tx += this.velocity.x;
			this.ty += this.velocity.y;

			if (this.ticksToLive < MAX_TICKS * .5)
				this.element.css("opacity", this.ticksToLive / (MAX_TICKS * .5));

			this.updateTransform();

			if (this.ticksToLive <= 0) {
				clearInterval(this.timer);
				this.element.remove();
			}
		},

		_destroy: function () {
		},

		_setOption: function ( key, value ) {
			switch (key) {
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		}
	});
});
