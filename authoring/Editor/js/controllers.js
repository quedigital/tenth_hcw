var spreaderApp = angular.module("spreaderApp", ["firebase"]);

spreaderApp.controller("SpreadListControl", function ($scope, $firebase) {
	var contentsRef = new Firebase("https://howcomputerswork.firebaseio.com/contents");
	$scope.contents = $firebase(contentsRef);
	$scope.name = "World";
	
	$scope.phones = [
		{'name': 'Nexus S',
		 'snippet': 'Fast just got faster with Nexus S.'},
		{'name': 'Motorola XOOM™ with Wi-Fi',
		 'snippet': 'The Next, Next Generation tablet.'},
		{'name': 'MOTOROLA XOOM™',
		 'snippet': 'The Next, Next Generation tablet.'}
	];
	
	// NOTE: $scope.contents.length isn't available right away
});

spreaderApp.controller("SpreadDetailControl", function ($scope, $firebase) {
	$scope.details = [
		{ number: 1 },
		{ number: 2 },
	];
});
