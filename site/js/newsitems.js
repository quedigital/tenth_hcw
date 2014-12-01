define(["Database", "jquery.ui.widget", "tourguide"], function (Database) {

    $.widget("que.NewsItems", {

        // Options to be used as defaults
        options: {},

        _create: function () {
            this.element.append('<ul></ul>');
            
            this.items = [];
            
            this.refresh();
        },

        _destroy: function () {
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
			this.beginNewsPresentation(item);
		},
		
		beginNewsPresentation: function (item) {
			var tour = [
							{
								title: item.title,
								text: item.desc,
								setup: [
											{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: true },								
											{ type: "openTo", spread: item.spread },
											{ type: "scrollTo", target: item.target },
										],
								teardown: [
											{ type: "option", target: "#toc-container", class: "TOC", key: "leaveOpen", value: false },
										],
								target: item.target
							}
						];
							
			var guide = $("body").TourGuide({ tour: tour, onComplete: $.proxy(this.endNewsPresentation, this, item) });
			guide.TourGuide("beginTour");
		},
		
		endNewsPresentation: function (item) {
			Database.setNewsItemRead(item.key);
			
			this.refresh();
			
			this._trigger("end");
		},
		
        refresh: function () {
            Database.getNewsItems($.proxy(this.onReceivedItems, this));            
        },
    });
});