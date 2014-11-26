define(["jquery.ui.widget", "jquery.textfill"], function () {

    $.widget("que.Banner", {

        options: {},

        _create: function () {
        	this.element.addClass("banner").attr("data-source-id", this.options.source_id);
        	
			var id = undefined;
			
			var atStart = false, atEnd = false;
			var prevSpread = this.options.toc.getPreviousSpread(this.options.source_id);
			var nextSpread = this.options.toc.getNextSpread(this.options.source_id);
			
			if (this.options.previous) {
				if (prevSpread) id = prevSpread.id;
				else atStart = true;
			} else {
				if (nextSpread != undefined) id = this.options.source_id;
				else atEnd = true;
			}
			
			if (id) {
				var html = '<div class="read-banner previous"><header><h1><i class="fa fa-chevron-circle-up"></i> Previous</h1></header><div class="wide-read read"><header><h1></h1></header><div class="preview-image"></div></div></div>';

				this.element.append(html);
			
				var prevSpread = this.options.toc.getSpreadContentByID(id);
				var layout = this.options.toc.getSpreadLayout(prevSpread.id);
			
				this.element.find(".previous .wide-read h1").text(prevSpread.title);
				var img = this.options.toc.getRandomImageFromSpread(prevSpread, layout);
				img = (img == undefined) ? "none" : "url(" + img + ")";
				this.element.find(".previous .wide-read .preview-image").css("backgroundImage", img);
				this.element.find(".previous .read").data("next-id", id);			
			}

			id = undefined;
			
			if (this.options.previous) {
				id = this.options.source_id;
			} else {
				if (nextSpread) id = nextSpread.id;
			}
			
			if (id && !atStart && !atEnd) {
				var html = '<div class="read-banner next"><header><h1>Next <i class="fa fa-chevron-circle-down"></i></h1></header><div class="wide-read read"><header><h1></h1></header><div class="preview-image"></div></div></div><div class="read-area"><header><h1><i class="fa fa-globe"></i> Explore</h1></header><div class="small-read read"><header><h1></h1></header><div class="preview-image"></div></div><div class="small-read read"><header><h1></h1></header><div class="preview-image"></div></div><div class="small-read read"><header><h1></h1></header><div class="preview-image"></div></div></div>';
			
				this.element.append(html);
				
				var nextSpread = this.options.toc.getSpreadContentByID(id);
				var layout = this.options.toc.getSpreadLayout(nextSpread.id);

				this.element.find(".next .wide-read h1").text(nextSpread.title);
				var img = this.options.toc.getRandomImageFromSpread(nextSpread, layout);
				img = (img == undefined) ? "none" : "url(" + img + ")";
				this.element.find(".next .wide-read .preview-image").css("backgroundImage", img);
				this.element.find(".next .read").data("next-id", id);
	
				var spreads = this.options.toc.getRelatedSpreads(id, 3);
			
				var me = this;
				$.each(spreads, function (index, item) {
					var spread = me.options.toc.getSpreadContent(item);
					var small = me.element.find(".read-area .small-read").eq(index);
					small.find("h1").text(spread.title);
					var layout = me.options.toc.getSpreadLayout(spread.id);
					var img = me.options.toc.getRandomImageFromSpread(spread, layout);
					img = (img == undefined) ? "none" : "url(" + img + ")";
					small.find(".preview-image").css("backgroundImage", img);
					small.data("next-id", spread.id);
				});
			}
			
			this.element.find(".read").click($.proxy(this.openBannerSpread, this));
			
			var els = this.element.find(".read header");
			setTimeout(function () {
				els.textfill({ innerTag: "h1" });
			}, 0);
        },

        _destroy: function () {
            //this.element.removeStuff();
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

			this._super( "_setOption", key, value );
        },
        
        openBannerSpread: function (event) {
        	var id = $(event.currentTarget).data("next-id");
        	this.options.toc.openSpread( { id: id, replace: true } );
        }
    });
});