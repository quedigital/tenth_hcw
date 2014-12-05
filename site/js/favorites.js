define(["Database", "Helpers", "jquery.ui.widget"], function (Database, Helpers) {

    $.widget("que.Favorites", {

        // Options to be used as defaults
        options: {},

        _create: function () {
            this.element.append('<ul></ul>');
            
            this.items = [];
            
            this.refresh();
        },

        _destroy: function () {
        },
        
		onClickItem: function (id, event) {
			this.options.layoutManager.dom.trigger("open-spread", { id: id, replace: true, active: true });
		},

        refresh: function () {
        	var items = Database.getFavoriteSpreads();
        	
        	this.element.find("p").remove();
        	
			var ul = this.element.find("ul");
			
			ul.empty();
			
			if (items.length) {
				var me = this;
				$.each(items, function (index, id) {
					var content = $("#toc-container").TOC("getSpreadContentByID", id);
					var li = $("<li>" + content.title + "</li>");
					li.click($.proxy(me.onClickItem, me, id));
					li.appendTo(ul);
				});
			} else {
				var p = $("<p>You haven't given out any 5-star ratings yet.</p>");
				p.appendTo(this.element);
			}
			
			var ratings = Database.getAllSpreadRatings();
			ratings = Helpers.objectToArrayWithKey(ratings);
			var total = this.options.layoutManager.getSpreadCount();
			var p = $("<p>You have rated " + ratings.length + " out of " + total + " pages.</p>");
			this.element.append(p);
        },
    });
});