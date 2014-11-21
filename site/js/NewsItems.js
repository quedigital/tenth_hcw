define(["Database", "jquery.ui.widget", "jquery.dim-background", "jquery.qtip", "jquery.scrollTo"], function (Database) {

    $.widget("que.NewsItems", {

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
            
            this.element.append('<ul></ul>');
            
            this.items = [];
            
            this.refresh();
            
            //this.element.addStuff();
            //this.element.addStuff();
            //this.element.tmpl(assetHtml).appendTo(this.content);
        },

        // Destroy an instantiated plugin and clean up modifications
        // that the widget has made to the DOM
        _destroy: function () {
            //this.element.removeStuff();
        },
        
        onReceivedItems: function (items) {
        	this.items = items;
        	
			var ul = this.element.find("ul");
			
			ul.empty();
			
			if (items.length) {
				var me = this;
				$.each(items, function (index, item) {
					var li = $("<li>" + item.title + "</li>");
					li.click($.proxy(me.onClickItem, me, item));
					li.appendTo(ul);
				});
			} else {
				var p = $("<p>No more news at this time.</p>");
				p.appendTo(ul);
			}
        },

		onClickItem: function (item, event) {
			this._trigger("begin", event, { item: item, callback: $.proxy(this.beginNewsPresentation, this, item) });
		},
		
		beginNewsPresentation: function (item) {
			var top_third = $("#content").height() * .3;
			
			// once spread is open, scroll to item.target
			$("#content").scrollTo(item.target, { axis: "y", duration: 1000, offset: { top: -top_third } });
			
			var me = this;
			
			// wait for scrollto to be complete (could use scrollTo's callback...)
			setTimeout(function () {
				// NOTE: this won't work for all DOM elements but it worked for most of the ones I tested
				// TODO: write my own using the screen coordinates & 4 divs
				$(item.target).dimBackground();
				
				var content = $("<p>").html(item.desc);
				var btn = $('<button>', { text: 'Ok', class: 'full' });
				content.append(btn);
				
				$(item.target).qtip( {
					content: { title: item.title, text: content },
					style: { classes: "qtip-green qtip-rounded myCustomTooltip" },
					show: { ready: true, modal: { on: true }, delay: 1000 },
					hide: false,
					position: { my: "top center", at: "bottom center" },
					events: {
						render: function (event, api) {
							$("button", api.elements.content).click(function (e) {
								api.hide(e);
							});
						},
						hide: function (event, api) {
							api.destroy();
							me.endNewsPresentation(item);
						}
					},
				} );
				
			}, 1000);
		},
		
		endNewsPresentation: function (item) {
			$.undim();
			
			Database.setNewsItemRead(item.key);
			
			this.refresh();
			
			this._trigger("end");
		},
		
        refresh: function () {
            Database.getNewsItems($.proxy(this.onReceivedItems, this));            
        },

        methodA: function ( event ) {
            this._trigger("dataChanged", event, {
                key: "someValue"
            });
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