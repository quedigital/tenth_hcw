define(["jquery.ui.widget", "letter", "star"], function () {

	var COLORS = ["orange", "blue", "red", "green", "purple", "aqua", "gray"];

	$.widget("que.Compressor", {

		options: {},

		_create: function () {
			this.database = [];
			this.currentPattern = "";
			this.currentMatches = 0;
			this.dictionary = [];
			this.currentLevel = 0;

			this.dictionaryColor = 0;

			this.element.addClass("compressor");

			this.holder = $("<div>", { class: "holder"}).appendTo(this.element);

			$("#btnCompress").click($.proxy(this.onClickCompress, this));
			$("#btnCompress").prop("disabled", true);

			$("#btnRestart").click($.proxy(this.onClickRestart, this));

			this.gotoLevel(this.currentLevel);
		},

		resetMessage: function () {
			for (var i = 0; i < this.options.message.length; i++) {
				this.database.push( { character: this.options.message[i], selected: false, matched: false, compressed: false, startOfPattern: false } );
			}

			var words = this.options.message.split(" ");

			for (var i = 0; i < words.length; i++) {
				var w = words[i];

				var word = $("<div>", { class: "word" }).appendTo(this.holder);

				for (var j = 0; j < w.length; j++) {
					var letter = $("<div>").Letter({ letter: w[j], select: $.proxy(this.onSelectLetter, this) });
					letter.appendTo(word);

					letter.on("select", $.proxy(this.onSelectLetter));
				}

				if (i < words.length - 1) {
					var letter = $("<div>").Letter({ letter: " ", select: $.proxy(this.onSelectLetter, this) });
					letter.appendTo(word);

					// need this to actually create word breaks:
					this.holder.append(" ");
				}
			}

			// center puzzle
			var t = (this.holder.parent().height() - this.holder.height()) * .5
			this.holder.css("margin-top", t);

			this.updateByteCount();
		},

		updateByteCount: function () {
			var bytes = 0, pointers = 0;
			for (var i = 0; i < this.database.length; i++) {
				if (!this.database[i].compressed)
					bytes++;
				if (this.database[i].startOfPattern)
					pointers++;
			}

			$("#document-bytes").text(bytes + " bytes + " + pointers + " pointers");

			bytes = 0, pointers = 0;
			for (var i = 0; i < this.dictionary.length; i++) {
				bytes += this.dictionary[i].text.length;
			}

			$("#dictionary-bytes").text(bytes + " bytes");
		},

		onSelectLetter: function (event, ui) {
			var allLetters = this.element.find(".letter");

			var cur  = $(event.currentTarget);

			var index = $.inArray(cur[0], allLetters);

			var letter = cur.data("que-Letter");

			var hasPrev = false, hasNext = false;
			if (index > 0 && this.database[index - 1].matched) {
				hasPrev = true;
			}
			if (index < this.database.length - 1 && this.database[index + 1].matched) {
				hasNext = true;
			}

			if (!hasNext && !hasPrev) {
				// new area; deselect previous and select new
				var sel = this.database[index].matched;

				this.clearMatched();
				this.clearSelected();

				this.database[index].selected = !sel;
			} else {
				// toggle selection; may be extending or cutting selection

				//this.database[index].selected = !this.database[index].selected;
				this.database[index].matched = !this.database[index].matched;

				if (!this.database[index].selected && hasNext && hasPrev) {
					// split; eliminate second half
					for (var i = index + 1; i < this.database.length; i++) {
						this.database[i].selected = false;
					}
				}
			}

			// find the current pattern (we might have moved to a different pattern location, so use the match near where we clicked)
			this.currentPattern = "";
			var patternStarted = false;
			if (hasNext) {
				for (var i = index; i < this.database.length; i++) {
					if (this.database[i].matched || this.database[i].selected) {
						this.currentPattern += this.database[i].character;
						patternStarted = true;
					} else if (patternStarted) {
						break;
					}
				}
			} else {
				for (var i = index; i >= 0; i--) {
					if (this.database[i].matched || this.database[i].selected) {
						this.currentPattern = this.database[i].character + this.currentPattern;
						patternStarted = true;
					} else if (patternStarted) {
						break;
					}
				}
			}

			this.updatePatternDisplay();

			this.clearMatched();

			if (this.currentPattern)
				this.findAllMatches(this.currentPattern);
			else
				this.currentMatches = 0;

			this.clearSelected();

			this.redrawBoard();

			this.updateProposedCompression();
		},

		updateProposedCompression: function () {
			var compressionAmount = this.getCurrentCompressionAmount();

			$("#btnCompress").text("Compress " + Math.round(compressionAmount * 100) + "%").prop("disabled", compressionAmount > 0 ? false : true);
			$("#btnPattern").css("display", compressionAmount > 0 ? "block" : "none");

			if (compressionAmount > 0) {
				$("#btnCompress").addClass("animated tada");
			} else {
				$("#btnCompress").removeClass("animated tada");
			}
		},

		updatePatternDisplay: function () {
			var html = "";

			for (var i = 0; i < this.currentPattern.length; i++) {
				if (this.currentPattern[i] == " ")
					html += "&nbsp;";
				else
					html += this.currentPattern[i];
			}

			$("#curPattern").html(html);
		},

		clearBoard: function () {
			this.element.find(".holder").empty();
		},

		clearCurrentPattern: function () {
			$("#curPattern").text("");
			$("#btnCompress").text("Compress").prop("disabled", true);
			$("#btnPattern").css("display", "none");
		},

		clearMatched: function () {
			for (var i = 0; i < this.database.length; i++) {
				if (this.database[i].matched) this.database[i].startOfPattern = false;
				this.database[i].matched = false;
			}
		},

		clearSelected: function () {
			for (var i = 0; i < this.database.length; i++) {
				this.database[i].selected = false;
			}
		},

		findAllMatches: function (pattern) {
			var matches = [];

			this.clearMatched();

			var i = 0;
			while (i <= this.database.length - pattern.length) {
				var found = true;
				for (var j = 0; j < pattern.length; j++) {
					var d = this.database[i + j];
					if (d.compressed || d.character != pattern[j]) {
						found = false;
						break;
					}
				}

				if (found) {
					for (var j = 0; j < pattern.length; j++) {
						this.database[i + j].matched = true;
						if (j == 0)
							this.database[i].startOfPattern = true;
					}
					matches.push(i);
					i += pattern.length;
				} else {
					i++;
				}
			}

			this.currentMatches = matches.length;
		},

		getCurrentCompressionAmount: function () {
			return this.getCompressionAmount(this.currentMatches, this.currentPattern.length);
		},

		getCompressionAmount: function (matches, patternSize) {
			var bytesCompressed = (patternSize * matches) - (patternSize + matches);

			if (matches == 0 || patternSize == 0)
				return 0;
			else
				return bytesCompressed / this.options.message.length;
				//return ((matches - 1) * (patternSize - 2)) / this.options.message.length;
		},

		getTotalCompressionAmount: function () {
			var total = 0;

			for (var i = 0; i < this.dictionary.length; i++) {
				var pattern = this.dictionary[i].text;
				var matches = this.dictionary[i].matches;
				total += this.getCompressionAmount(matches, pattern.length);
			}

			return total;
		},

		redrawBoard: function () {
			var allLetters = this.element.find(".letter");

			allLetters.removeClass("compressed selected");

			for (var i = 0; i < this.database.length; i++) {
				if (this.database[i].selected || this.database[i].matched) {
					allLetters.eq(i).addClass("selected");
				} else if (this.database[i].compressed) {
					allLetters.eq(i).addClass("compressed");
				}
			}
		},

		onClickCompress: function (event) {
			if (this.currentPattern) {
				var color = COLORS[this.dictionary.length % COLORS.length];

				this.element.find(".selected").removeClass("selected").addClass("compressed").addClass(color).unbind("click");

				for (var i = 0; i < this.database.length; i++) {
					if (this.database[i].matched) {
						this.database[i].compressed = true;
						this.database[i].selected = this.database[i].matched = false;

						this.launchStar(i);
					}
				}

				var compressionAmount = this.getCurrentCompressionAmount();

				this.addToDictionary(this.currentPattern, this.currentMatches, Math.round(compressionAmount * 100));

				this.clearCurrentPattern();
			}

			var amt = Math.round(this.getTotalCompressionAmount() * 100);
			$("#curCompressionTotal").text(amt + "%");

			this.updateByteCount();

			if (amt == this.options.target) {
				this.onLevelComplete();
			}
		},

		addToDictionary: function (pattern, matches, amount) {
			this.dictionary.push( { text: pattern, matches: matches, amount: amount } );

			this.redrawDictionary();
		},

		redrawDictionary: function () {
			$("#dictionary").find(".word").remove();

			for (var i = 0; i < this.dictionary.length; i++) {
				var pattern = this.dictionary[i].text;
				var w = $("<div>", { class: "word" }).appendTo($("#dictionary"));
				for (var j = 0; j < pattern.length; j++) {
					var ch = pattern[j] == " " ? "&nbsp;" : pattern[j];
					var l = $("<div>", { class: "letter compressed" }).appendTo(w);

					var color = i % COLORS.length;
					l.addClass(COLORS[color]);

					var c = $("<span>", { class: "char" }).html(ch).appendTo(l);
				}
			}
		},

		onClickRestart: function () {
			this._trigger("restart");

			this.currentLevel = 0;
			this.gotoLevel(this.currentLevel);
		},

		gotoLevel: function (n) {
			this.resetLevel();

			switch (n) {
				case 0:
					this.option("message", "the dog ate the hot dog");
					this.option("target", 13);
					break;
				case 1:
					this.option("message", "it was the best of times it was the worst of times");
					this.option("target", 36);
					break;
				case 2:
					this.option("message", "she sells seashells down by the seashore");
					this.option("target", 18);
					break;
			}

			$("#lblLevel").text("Level " + (n + 1) + " of 3");
			$("#byteCount").text("(" + this.options.message.length + " bytes)");
		},

		resetLevel: function () {
			this.dictionary = [];
			this.database = [];

			this.clearBoard();
			this.clearCurrentPattern();
			this.redrawDictionary();

			$("#curCompressionTotal").text("0%");
		},

		advanceLevel: function () {
			if (this.currentLevel < 2) {
				this.currentLevel++;
				this.gotoLevel(this.currentLevel);
			}
		},

		onLevelComplete: function () {
			switch (this.currentLevel) {
				case 0:
					$("#level-complete-id").data("title", "Level Complete");
					$("#level-complete-id").data("text", "Well done! You did it!");
					$("#level-complete-id").data("buttonText", "Next Level");
					break;
				case 1:
					$("#level-complete-id").data("title", "Level Complete");
					$("#level-complete-id").data("text", "You've got the hang of it now!");
					$("#level-complete-id").data("buttonText", "Next Level");
					break;
				case 2:
					$("#level-complete-id").data("title", "Game Over");
					$("#level-complete-id").data("text", "Great Job! You mastered it!");
					$("#level-complete-id").data("buttonText", "All Done");
					break;
			}

			this._trigger("levelcomplete", null, { level: this.currentLevel });
		},

		launchStar: function (index) {
			var letter = this.element.find(".letter").eq(index);
			var pos = letter.position();
			pos.left += letter.width() * .5;
			pos.top += letter.height() * .5;

			var star = $("<div>").Star(pos);
			this.element.append(star);
		},

		_destroy: function () {
		},

		_setOption: function ( key, value ) {
			switch (key) {
				case "message":
					this.options.message = value;
					this.resetMessage();
					break;
				case "target":
					this.options.target = value;
					$("#curCompressionTarget").text(this.options.target + "%");
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		}
	});
});
