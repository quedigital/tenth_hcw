define(["Database", "jquery.ui.widget"], function (Database) {

    $.widget("que.NewsAlert", {

        // Options to be used as defaults
        options: {},

        // Set up widget (e.g. create element, apply theming,
        // bind events, etc.)
        _create: function () {
            // _create will automatically run the first time
            // this widget is called. Put the initial widget
            // set-up code here, then you can access the element
            // on which the widget was called via this.element.
            // The options defined above can be accessed via
            // this.options
            
            this.refresh();
        },

        // Destroy an instantiated plugin and clean up modifications
        // that the widget has made to the DOM
        _destroy: function () {
            //this.element.removeStuff();
        },

        refresh: function () {
			Database.getNewNewsItemCount($.proxy(this.onReceiveCount, this));
        },
        
        onReceiveCount: function (count) {
        	if (count == 0) {
        		this.element.css("display", "none");
        	} else {
				this.element.find(".count").text(count);
				this.element.css("display", "block");
			}
        },

        // Respond to any changes the user makes to the option method
        _setOption: function ( key, value ) {
			switch (key) {
				case "someValue":
					//this.options.someValue = doSomethingWith( value );
					break;
				default:
					//this.options[ key ] = value;
					break;
			}

            // For UI 1.8, _setOption must be manually invoked from
            // the base widget
            $.Widget.prototype._setOption.apply( this, arguments );
            // For UI 1.9 the _super method can be used instead
            //this._super( "_setOption", key, value );
        }
    });
});