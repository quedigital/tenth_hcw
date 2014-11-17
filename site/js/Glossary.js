define([], function () {

	var Glossary = {};
	
	Glossary.terms = {
		"microprocessor": "The \"brains\" of a computer. A component that contains circuitry that can manipulate data in the form of binary bits. A microprocessor is contained on a single microchip.",
		"microprocessors": "microprocessor",
		"processor": "microprocessor",
		"transistor": "A microscopic switch that controls the flow of electricity through it, depending on whether a different electrical charge has opened or closed the switch.",
	};
	
	Glossary.getDefinition = function (term) {
		var def = this.terms[term];
		
		if  (def) {
			// if it's one word, it's a cross-reference to another term
			if (def.indexOf(" ") == -1) {
				def = this.terms[def];
			}
		}
		
		return def;
	}
	
	return Glossary;
});