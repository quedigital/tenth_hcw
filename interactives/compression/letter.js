define(["jquery.ui.widget"], function () {

	$.widget("que.Letter", {

		options: {},

		_create: function () {
			this.element.addClass("letter");

			var ch = this.options.letter == " "  ? "&nbsp;" : this.options.letter;

			$("<span>", { class: "char" }).html(ch).appendTo(this.element);

			this.element.click($.proxy(this.onClick, this));
		},

		_destroy: function () {
		},

		onClick: function (event) {
			this._trigger("select", event);
		},

		_setOption: function ( key, value ) {
			switch (key) {
				case "someValue":
					//this.options.someValue = doSomethingWith( value );
					break;
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		}
	});
});
