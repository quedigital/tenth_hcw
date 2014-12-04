importScripts('lunr.min.js');

var idx = lunr(function () {
	this.field('title', { boost: 10 })
	this.field('body')
});

self.onmessage = function (event) {
	if (event.data.type == "initialize") {
		console.log("search initializing");
		
		var data = event.data.content;
	
		for (var i = 0; i < data.length; i++) {
			var spread = data[i];
			var text = "";
			if (spread.cells) {
				for (var each in spread.cells) {
					var cell = spread.cells[each];
					if (cell.heading) text += cell.heading + " ";
					if (cell.text) text += cell.text;
				}
			}
		
			var doc = { title: spread.title, body: text, id: spread.id };
		
			idx.add(doc);
		}
	
		self.postMessage({ type: "progress", data: "complete" });
	} else if (event.data.type == "query") {
		var term = event.data.term;
		
		var r = idx.search(term);
		
		self.postMessage({ type: "results", results: r });
	}
}