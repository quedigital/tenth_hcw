define([], function () {
	var DEBUG_MODE = false;
	
	function write (text) {
		console.log(text);
	}
	
	function isDebugMode () {
		return DEBUG_MODE;
	}
	
	return {
		write: write,
		isDebugMode: isDebugMode
	}
});