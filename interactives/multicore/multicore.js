var raff;

var path1, path1_length, ppath1_length;
var path2, path2_length, ppath2_length;
var path3, path3_length, ppath3_length;
var path4, path4_length, ppath4_length;

var text;

//	paper.install(window);

var ones_text, tens_text, hundreds_text, thousands_text;
var stream1, stream2, stream3, stream4;
var internal1, internal1_len, internal2, internal2_len, internal3, internal3_len, internal4, internal4_len;
var internal_final, internal_final_len;
var doneWith1 = false, doneWith2 = false, doneWith3 = false, doneWith4 = false;

var red_circle;

var ones_text_total = 19, ones_text_current = 0;
var tens_text_total = 8 + 7 + 7 + 9 + 8, tens_text_current = 0;
var hundreds_text_total = 5 + 2 + 0 + 3 + 4, hundreds_text_current = 0;
var thousands_text_total = 5 + 8 + 4 + 0 + 1, thousands_text_current = 0;

var answer;

var explainText = 0;

var moving = 0;
var showedFinalAnswer = false;

// Note: couldn't get Paper.js and Raphael.js to work well together on the iPad
//   so I'm using paper functions for pathfinding but not drawing with it.

$(document).ready(function () {
	raff = Raphael($("#canvas_container")[0], 1024, 768);
	
	//var canvas = document.getElementById('myCanvas');
	var canvas = document.getElementById('canvas_container');
	paper.setup(canvas);

	/*
	paper.view.onFrame = function (event) {
		paper.view.draw();
	}
	*/

	$("#canvas_container").bind("touchstart", showNextExplainText);
	$("#canvas_container").bind("mousedown", showNextExplainText);
	$("#canvas_container").bind("mousemove", onMouseMove);
	
	$("#restart").bind("click", onRestart);
	
	// 19,819
	answer = [
		raff.text(660, 71, "1").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial','fill': '#039', opacity: 0 } ),
		raff.text(660, 71, "9").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial','fill': '#039', opacity: 0 } ),
		raff.text(660, 71, ",").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial','fill': '#039', opacity: 0 } ),
		raff.text(660, 71, "8").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial','fill': '#039', opacity: 0 } ),
		raff.text(660, 71, "1").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial','fill': '#039', opacity: 0 } ),
		raff.text(660, 71, "9").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial','fill': '#039', opacity: 0 } ),
	];

	ppath1 = new paper.Path();
	ppath1.add(new paper.Point(40, 343));
	ppath1.quadraticCurveTo(new paper.Point(45, 392), new paper.Point(78, 542));
	ppath1.quadraticCurveTo(new paper.Point(121, 677), new paper.Point(293, 700));
	ppath1.quadraticCurveTo(new paper.Point(522, 713), new paper.Point(592, 579));
	ppath1.quadraticCurveTo(new paper.Point(604, 533), new paper.Point(642, 534));
	ppath1.quadraticCurveTo(new paper.Point(726, 541), new paper.Point(736, 504));	
	ppath1_length = ppath1.length;
	
	ppath2 = new paper.Path();
	ppath2.add(new paper.Point(68, 343));
	ppath2.quadraticCurveTo(new paper.Point(88, 513), new paper.Point(100, 542));
	ppath2.quadraticCurveTo(new paper.Point(134, 624), new paper.Point(388, 663));
	ppath2.quadraticCurveTo(new paper.Point(554, 706), new paper.Point(597, 626));
	ppath2.quadraticCurveTo(new paper.Point(631, 528), new paper.Point(506, 496));
	ppath2.quadraticCurveTo(new paper.Point(458, 483), new paper.Point(480, 453));	
	ppath2_length = ppath2.length;
	
	ppath3 = new paper.Path();
	ppath3.add(new paper.Point(95, 344));
	ppath3.quadraticCurveTo(new paper.Point(119, 545), new paper.Point(136, 569));
	ppath3.quadraticCurveTo(new paper.Point(176, 672), new paper.Point(375, 673));
	ppath3.quadraticCurveTo(new paper.Point(539, 643), new paper.Point(561, 586));
	ppath3.quadraticCurveTo(new paper.Point(567, 515), new paper.Point(595, 519));
	ppath3.quadraticCurveTo(new paper.Point(659, 523), new paper.Point(674, 490));	
	ppath3_length = ppath3.length;
	
	ppath4 = new paper.Path();
//	ppath4.strokeColor = '#09e';
//	ppath4.strokeWidth = 4;
	ppath4.add(new paper.Point(128, 344));
	ppath4.quadraticCurveTo(new paper.Point(123, 445), new paper.Point(140, 510));
	ppath4.quadraticCurveTo(new paper.Point(206, 641), new paper.Point(410, 722));
	ppath4.quadraticCurveTo(new paper.Point(530, 747), new paper.Point(597, 662));
	ppath4.quadraticCurveTo(new paper.Point(658, 549), new paper.Point(632, 519));
	ppath4.quadraticCurveTo(new paper.Point(585, 501), new paper.Point(569, 472));
	ppath4_length = ppath4.length;
	
	path1 = raff.path("M 40 343 Q 45 392 78 542 Q 121 677 293 700 Q 522 713 592 579 Q 604 533 642 534 Q 726 541 736 504").attr( { stroke: "#3cf", 'stroke-width': 4 });
	path1.glow( { offsetx: 3, offsety: 3, width: 4 } );
	
	path2 = raff.path("M 68 343 Q 88 513 100 542 Q 134 624 388 663 Q 554 706 597 626 Q 631 528 506 496 Q 458 483 480 453").attr( { stroke: '#f4e', 'stroke-width': 4 });
	path2.glow( { offsetx: 3, offsety: 3, width: 4 } );
	
	path3 = raff.path("M 95 344 Q 119 545 136 569 Q 176 672 375 673 Q 539 643 561 586 Q 567 515 595 519 Q 659 523 674 490").attr( { stroke: '#cf6', 'stroke-width': 4 });
	path3.glow( { offsetx: 3, offsety: 3, width: 4 } );
	
	path4 = raff.path("M 128 344 Q 123 445 140 510 Q 206 641 410 722 Q 530 747 597 662 Q 658 549 632 519 Q 585 501 569 472").attr( { stroke: '#09e', 'stroke-width': 4 });

	path4.glow( { offsetx: 3, offsety: 3, width: 4 } );
	
	// internal "wiring"
	internal1 = raff.path("M 773 445 L 788 367 M 796 324 Q 804 293 779 287 L 686 271 Q 655 259 655 228").attr( { stroke: '#3cf', 'stroke-width': 4 });
	internal1.glow( { offsetx: 3, offsety: 3, width: 4 } );
	internal1_len = internal1.getTotalLength();

	internal2 = raff.path("M 493 394 L 515 322 M 531 272 Q 543 239 589 248 L 677 264 Q 695 256 686 234").attr( { stroke: '#f4e', 'stroke-width': 4 });
	internal2.glow( { offsetx: 3, offsety: 3, width: 4 } );
	internal2_len = internal2.getTotalLength();
	
	internal3 = raff.path("M 696 431 L 713 355 M 722 308 Q 730 290 723 275 L 705 270 Q 698 258 705 238").attr( { stroke: '#cf6', 'stroke-width': 4 } );
	internal3.glow( { offsetx: 3, offsety: 3, width: 4 } );
	internal3_len = internal3.getTotalLength();
	
	internal4 = raff.path("M 579 408 L 597 334 M 610 286 S 613 265 650 264 L 727 276 S 759 275 740 244").attr( { 'stroke': '#09e', 'stroke-width': 4 } );
	internal4.glow( { offsetx: 3, offsety: 3, width: 4 } );
	internal4_len = internal4.getTotalLength();
	
	internal_final = raff.path("M 428 214 T 405 186 T 433 121 T 725 141").attr( { 'stroke': '#000', 'stroke-width': 4 });
	internal_final.glow( { offsetx: 3, offsety: 3, width: 4, opacity: .25 } );
	internal_final_len = internal_final.getTotalLength();
	
	stream1 = [
		raff.text(40, 308, "5").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#019ACD' } ),//, 'text-anchor': 'start' } );
		raff.text(40, 268, "8").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#019ACD' } ),
		raff.text(40, 228, "4").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#019ACD' } ),
		raff.text(40, 188, "0").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#019ACD' } ),
		raff.text(40, 148, "1").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#019ACD' } ),
	];
	
	stream2 = [
		raff.text(70, 308, "5").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#FF1CCD' } ),//, 'text-anchor': 'start' } );
		raff.text(70, 268, "2").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#FF1CCD' } ),
		raff.text(70, 228, "0").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#FF1CCD' } ),
		raff.text(70, 188, "3").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#FF1CCD' } ),
		raff.text(70, 148, "4").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#FF1CCD' } ),
	];
	
	stream3 = [
		raff.text(100, 308, "8").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#99C033' } ),//, 'text-anchor': 'start' } );
		raff.text(100, 268, "9").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#99C033' } ),
		raff.text(100, 228, "7").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#99C033' } ),
		raff.text(100, 188, "7").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#99C033' } ),
		raff.text(100, 148, "8").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#99C033' } ),
	];
	
	stream4 = [
		raff.text(130, 308, "9").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#039' } ),//, 'text-anchor': 'start' } );
		raff.text(130, 268, "4").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#039' } ),
		raff.text(130, 228, "7").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#039' } ),
		raff.text(130, 188, "9").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#039' } ),
		raff.text(130, 148, "0").attr( { 'font-size': 48, 'font-weight': 'bold', 'font-family': 'Arial', 'fill': '#039' } ),
	];
	
	for (var i = 0; i < 5; i++) {
		stream1[i].clone().attr( { 'fill': '#ddd' } ).toBack();
		stream2[i].clone().attr( { 'fill': '#ddd' } ).toBack();
		stream3[i].clone().attr( { 'fill': '#ddd' } ).toBack();
		stream4[i].clone().attr( { 'fill': '#ddd' } ).toBack();
	}

	ones_text = raff.text(827 + 96, 211 + 44, "0 ones").attr( { font: "22px Arial", 'font-weight': 'bold', transform: "r 10", fill: '#039', 'text-anchor': 'end' } );

	tens_text = raff.text(742 + 89, 196 + 42, "0 tens").attr( { font: "22px Arial", 'font-weight': 'bold', transform: "r 10", fill: '#9f3', 'text-anchor': 'end' } );

	hundreds_text = raff.text(601 + 144, 171 + 52, "0 hundreds").attr( { font: "22px Arial", 'font-weight': 'bold', transform: "r 10", fill: '#f4e', 'text-anchor': 'end' } );

	thousands_text = raff.text(452 + 154, 144 + 54, "0 thousands").attr( { font: "22px Arial", 'font-weight': 'bold', transform: "r 10", fill: '#3cf', 'text-anchor': 'end' } );

	/*
	ones_text = new paper.PointText(new paper.Point(827 + 96, 231 + 44));
	ones_text.paragraphStyle.justification = 'right';
	ones_text.characterStyle.fontSize = 18;
	ones_text.characterStyle.font = "Arial";//"Myriad Pro";
	ones_text.fillColor = '#039';
	ones_text.content = '0 ones';
	ones_text.rotate(10);

	tens_text = new paper.PointText(new paper.Point(742 + 89, 216 + 42));
	tens_text.paragraphStyle.justification = 'right';
	tens_text.characterStyle.fontSize = 18;
	tens_text.characterStyle.font = "Arial";
	tens_text.fillColor = '#9f3';
	tens_text.content = '0 tens';
	tens_text.rotate(10);

	hundreds_text = new paper.PointText(new paper.Point(601 + 144, 191 + 52));
	hundreds_text.paragraphStyle.justification = 'right';
	hundreds_text.characterStyle.fontSize = 18;
	hundreds_text.characterStyle.font = "Arial";
	hundreds_text.fillColor = '#f1c';
	hundreds_text.content = '0 hundreds';
	hundreds_text.rotate(10);

	thousands_text = new paper.PointText(new paper.Point(452 + 154, 164 + 54));
	thousands_text.paragraphStyle.justification = 'right';
	thousands_text.characterStyle.fontSize = 18;
	thousands_text.characterStyle.font = "Helvetica";
	thousands_text.fillColor = '#09c';
	thousands_text.content = '0 thousands';
	thousands_text.rotate(10);
	*/

	stream1[0].touchmove(onMoveText1);
	stream1[0].mousemove(onBeginMoveText1);
	stream2[0].touchmove(onMoveText2);
	stream2[0].mousemove(onBeginMoveText2);
	stream3[0].touchmove(onMoveText3);
	stream3[0].mousemove(onBeginMoveText3);
	stream4[0].touchmove(onMoveText4);
	stream4[0].mousemove(onBeginMoveText4);

	raff.customAttributes.along1 = function (v) {
		var point = internal1.getPointAtLength(v * internal1_len);
		return { x: point.x, y: point.y };
	}

	raff.customAttributes.along2 = function (v) {
		var point = internal2.getPointAtLength(v * internal2_len);
		return { x: point.x, y: point.y };
	}

	raff.customAttributes.along3 = function (v) {
		var point = internal3.getPointAtLength(v * internal3_len);
		return { x: point.x, y: point.y };
	}

	raff.customAttributes.along4 = function (v) {
		var point = internal4.getPointAtLength(v * internal4_len);
		//return { transform: "t" + [point.x, point.y] };
		return { x: point.x, y: point.y };
	}

	raff.customAttributes.alongFinal = function (v) {
		var point = internal_final.getPointAtLength(v * internal_final_len);
		return { x: point.x, y: point.y };
	}
	            
	paper.view.draw();
});

function onMouseMove (event) {
	if (moving == 1) {
		doMoveText1(event.pageX, event.pageY);
	} else if (moving == 2) {
		doMoveText2(event.pageX, event.pageY);
	} else if (moving == 3) {
		doMoveText3(event.pageX, event.pageY);
	} else if (moving == 4) {
		doMoveText4(event.pageX, event.pageY);
	}
}

function onMoveText4 (event) {
	if (doneWith4) return;
	
	event.preventDefault();
	
	doMoveText4(event.pageX, event.pageY);
}

function doMoveText4 (x, y) {
	var move_pt = new paper.Point(x, y);
	var path_pt = ppath4.getNearestPoint(move_pt);
	
	stream4[0].attr( { x: path_pt.x, y: path_pt.y } );
	
	var path_loc = ppath4.getNearestLocation(path_pt);

	if (!doneWith4 && path_loc.offset >= ppath4_length - 25) {
		doneWith4 = true;
		moving = 0;

		countStream4();
		
		return;			
	}
	
	for (var i = 1; i <= 5; i++) {
		var path_pt_trailing = ppath4.getLocationAt(path_loc.offset - 40 * i);	
					
		if (stream4[i] && path_pt_trailing.point)
			stream4[i].attr( { x: path_pt_trailing.point.x, y: path_pt_trailing.point.y } );
	}
	
	//ones_text.content = "1 ones";
	//paper.view.draw();
}

function onMoveText3 (event) {
	if (doneWith3) return;
	
	event.preventDefault();
	
	doMoveText3(event.pageX, event.pageY);
}

function doMoveText3 (x, y) {
	var move_pt = new paper.Point(x, y);
	var path_pt = ppath3.getNearestPoint(move_pt);
	
	stream3[0].attr( { x: path_pt.x, y: path_pt.y } );
	
	var path_loc = ppath3.getNearestLocation(path_pt);

	if (!doneWith3 && path_loc.offset >= ppath3_length - 25) {
		doneWith3 = true;
		moving = 0;

		countStream3();
		
		return;			
	}
	
	for (var i = 1; i <= 5; i++) {
		var path_pt_trailing = ppath3.getLocationAt(path_loc.offset - 40 * i);	
					
		if (stream3[i] && path_pt_trailing.point)
			stream3[i].attr( { x: path_pt_trailing.point.x, y: path_pt_trailing.point.y } );
	}
}

function onMoveText2 (event) {
	if (doneWith2) return;
	
	event.preventDefault();
	
	doMoveText2(event.pageX, event.pageY);
}

function doMoveText2 (x, y) {
	var move_pt = new paper.Point(x, y);
	var path_pt = ppath2.getNearestPoint(move_pt);
	
	stream2[0].attr( { x: path_pt.x, y: path_pt.y } );
	
	var path_loc = ppath2.getNearestLocation(path_pt);

	if (!doneWith2 && path_loc.offset >= ppath2_length - 25) {
		doneWith2 = true;
		moving = 0;

		countStream2();
		
		return;			
	}
	
	for (var i = 1; i <= 5; i++) {
		var path_pt_trailing = ppath2.getLocationAt(path_loc.offset - 40 * i);	
					
		if (stream2[i] && path_pt_trailing.point)
			stream2[i].attr( { x: path_pt_trailing.point.x, y: path_pt_trailing.point.y } );
	}
}

function onBeginMoveText1 (event) {
	if (moving != 1 && !doneWith1) {
		moving = 1;
	}
}

function onBeginMoveText2 (event) {
	if (moving != 2 && !doneWith2) {
		moving = 2;
	}
}

function onBeginMoveText3 (event) {
	if (moving != 3 && !doneWith3) {
		moving = 3;
	}
}

function onBeginMoveText4 (event) {
	if (moving != 4 && !doneWith4) {
		moving = 4;
	}
}

function onMoveText1 (event) {
	if (doneWith1) return;
	
	event.preventDefault();
	
	doMoveText1(event.pageX, event.pageY);
}

function doMoveText1 (x, y) {
	var move_pt = new paper.Point(x, y);
	var path_pt = ppath1.getNearestPoint(move_pt);
	
	stream1[0].attr( { x: path_pt.x, y: path_pt.y } );
	
	var path_loc = ppath1.getNearestLocation(path_pt);

	if (!doneWith1 && path_loc.offset >= ppath1_length - 25) {
		doneWith1 = true;
		moving = 0;

		countStream1();
		
		return;			
	}
	
	for (var i = 1; i <= 5; i++) {
		var path_pt_trailing = ppath1.getLocationAt(path_loc.offset - 40 * i);	
					
		if (stream1[i] && path_pt_trailing.point)
			stream1[i].attr( { x: path_pt_trailing.point.x, y: path_pt_trailing.point.y } );
	}
}

// TODO: don't tween these, just make them flash at intervals

function countStream1 () {
	showNextExplainText();
	
	stream1[0].untouchmove(onMoveText1);
	stream1[0].unmousemove(onMoveText1);
	
	stream1[0].animate({ x: 773, y: 445 }, 500, function () {
		stream1[0].attr({ along1: 0 });
		stream1[0].animate( { along1: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream1[0].animate( { opacity: 0 }, 500 );
			});
		});
	stream1[1].animate({ x: 773, y: 445 }, 600, function () {
		stream1[1].attr({ along1: 0 });
		stream1[1].animate( { along1: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream1[1].animate( { opacity: 0 }, 500 );
			});
		});
	stream1[2].animate({ x: 773, y: 445 }, 700, function () {
		stream1[2].attr({ along1: 0 });
		stream1[2].animate( { along1: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream1[2].animate( { opacity: 0 }, 500 );
			});
		});
	stream1[3].animate({ x: 773, y: 445 }, 900, function () {
		stream1[3].attr({ along1: 0 });
		stream1[3].animate( { along1: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream1[3].animate( { opacity: 0 }, 500 );
			});
		});
	stream1[4].animate({ x: 773, y: 445 }, 1100, function () {
		stream1[4].attr({ along1: 0 });
		stream1[4].animate( { along1: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream1[4].animate( { opacity: 0 }, 500, addUpStream1 );
			});
		});
}

function countStream2 () {
	showNextExplainText();
	
	stream2[0].untouchmove(onMoveText2);
	stream2[0].unmousemove(onMoveText2);
	
	stream2[0].animate({ x: 493, y: 394 }, 500, function () {
		stream2[0].attr({ along2: 0 });
		stream2[0].animate( { along2: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream2[0].animate( { opacity: 0 }, 500 );
			});
		});
	stream2[1].animate({ x: 493, y: 394 }, 600, function () {
		stream2[1].attr({ along2: 0 });
		stream2[1].animate( { along2: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream2[1].animate( { opacity: 0 }, 500 );
			});
		});
	stream2[2].animate({ x: 493, y: 394 }, 700, function () {
		stream2[2].attr({ along2: 0 });
		stream2[2].animate( { along2: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream2[2].animate( { opacity: 0 }, 500 );
			});
		});
	stream2[3].animate({ x: 493, y: 394 }, 900, function () {
		stream2[3].attr({ along2: 0 });
		stream2[3].animate( { along2: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream2[3].animate( { opacity: 0 }, 500 );
			});
		});
	stream2[4].animate({ x: 493, y: 394 }, 1100, function () {
		stream2[4].attr({ along2: 0 });
		stream2[4].animate( { along2: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream2[4].animate( { opacity: 0 }, 500, addUpStream2 );
			});
		});
}

function countStream3 () {
	showNextExplainText();
	
	stream3[0].untouchmove(onMoveText3);
	stream3[0].unmousemove(onMoveText3);
	
	stream3[0].animate({ x: 696, y: 431 }, 500, function () {
		stream3[0].attr({ along3: 0 });
		stream3[0].animate( { along3: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream3[0].animate( { opacity: 0 }, 500 );
			});
		});
	stream3[1].animate({ x: 696, y: 431 }, 600, function () {
		stream3[1].attr({ along3: 0 });
		stream3[1].animate( { along3: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream3[1].animate( { opacity: 0 }, 500 );
			});
		});
	stream3[2].animate({ x: 696, y: 431 }, 700, function () {
		stream3[2].attr({ along3: 0 });
		stream3[2].animate( { along3: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream3[2].animate( { opacity: 0 }, 500 );
			});
		});
	stream3[3].animate({ x: 696, y: 431 }, 900, function () {
		stream3[3].attr({ along3: 0 });
		stream3[3].animate( { along3: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream3[3].animate( { opacity: 0 }, 500 );
			});
		});
	stream3[4].animate({ x: 696, y: 431 }, 1100, function () {
		stream3[4].attr({ along3: 0 });
		stream3[4].animate( { along3: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream3[4].animate( { opacity: 0 }, 500, addUpStream3 );
			});
		});
}

function countStream4 () {
	showNextExplainText();
	
	stream4[0].untouchmove(onMoveText4);
	stream4[0].unmousemove(onMoveText4);
	
	stream4[0].animate({ x: 579, y: 408 }, 500, function () {
		stream4[0].attr({ along4: 0 });
		stream4[0].animate( { along4: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream4[0].animate( { opacity: 0 }, 500 );
			});
		});
	stream4[1].animate({ x: 579, y: 408 }, 600, function () {
		stream4[1].attr({ along4: 0 });
		stream4[1].animate( { along4: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream4[1].animate( { opacity: 0 }, 500 );
			});
		});
	stream4[2].animate({ x: 579, y: 408 }, 700, function () {
		stream4[2].attr({ along4: 0 });
		stream4[2].animate( { along4: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream4[2].animate( { opacity: 0 }, 500 );
			});
		});
	stream4[3].animate({ x: 579, y: 408 }, 900, function () {
		stream4[3].attr({ along4: 0 });
		stream4[3].animate( { along4: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream4[3].animate( { opacity: 0 }, 500 );
			});
		});
	stream4[4].animate({ x: 579, y: 408 }, 1100, function () {
		stream4[4].attr({ along4: 0 });
		stream4[4].animate( { along4: 1, fill: '#fff', transform: "s .25" }, 1000,
			function () {
				stream4[4].animate( { opacity: 0 }, 500, addUpStream4 );
			});
		});
}

function addUpStream1 () {
	if (thousands_text_current < thousands_text_total) {
		thousands_text_current++;
		var flashText = function () {
			thousands_text.attr( { fill: '#fff' } );
		}
		setTimeout(flashText, 100);
		var resumeText = function () {
			thousands_text.attr( { fill: '#3cf', text: thousands_text_current + ' thousands' } );
			addUpStream1();
		}
		setTimeout(resumeText, 300);
	} else if (doneWith1 && doneWith2 && doneWith3 && doneWith4) {
		showFinalAnswer();
	}
}

function addUpStream2 () {
	if (hundreds_text_current < hundreds_text_total) {
		hundreds_text_current++;
		var flashText = function () {
			hundreds_text.attr( { fill: '#fff' } );
		}
		setTimeout(flashText, 100);
		var resumeText = function () {
			hundreds_text.attr( { fill: '#f4e', text: hundreds_text_current + ' hundreds' } );
			addUpStream2();
		}
		setTimeout(resumeText, 300);
	} else if (doneWith1 && doneWith2 && doneWith3 && doneWith4) {
		showFinalAnswer();
	}
}

function addUpStream3 () {
	if (tens_text_current < tens_text_total) {
		tens_text_current++;
		var flashText = function () {
			tens_text.attr( { fill: '#000' } );
		}
		setTimeout(flashText, 100);
		var resumeText = function () {
			tens_text.attr( { fill: '#9f3', text: tens_text_current + ' tens' } );
			addUpStream3();
		}
		setTimeout(resumeText, 300);
	} else if (doneWith1 && doneWith2 && doneWith3 && doneWith4) {
		showFinalAnswer();
	}
}

function addUpStream4 () {
	if (ones_text_current < ones_text_total) {
		ones_text_current++;
		var flashText = function () {
			ones_text.attr( { fill: '#ff0' } );
		}
		setTimeout(flashText, 100);
		var resumeText = function () {
			ones_text.attr( { fill: '#039', text: ones_text_current + ' ones' } );
			addUpStream4();
		}
		setTimeout(resumeText, 300);
	} else if (doneWith1 && doneWith2 && doneWith3 && doneWith4) {
		showFinalAnswer();
	}
}

function showNextExplainText () {
	var txt;
	
	$("#canvas_container").unbind("touchstart", showNextExplainText);
	$("#canvas_container").unbind("mousedown", showNextExplainText);
	
	explainText++;
	
	switch (explainText) {
		case 1:
			txt = "A multi-core processor contains separate cores which work in parallel to perform a task -- such as adding a column of numbers.";
			break;
		case 2:
			txt = "Each core executes its CPU instructions, such as adding, moving, or branching, independently and concurrently.";
			break;
		case 3:
			txt = "The cores may share data with each other through the use of smart caches.";
			break;
		case 4:
			txt = "Each of the operations enters its respective core on different clicks of the computer's clock so they are less likely to run into each other or cause a traffic jam in the areas they have mutual access to.";
			break;
		case 5:
			txt = "The operating system can also take advantage of multiple cores by assigning individual programs to specific cores.";
			break;
		case 6:
			txt = "When the subtasks exit the cores, the operating system combines the threads into a single operation to arrive at the solution.";
			break;
	}
	
	// fade explanation out, and fade it back in with the actual text
	
	if (explainText > 1) {
		$("#explain").animate( { opacity: 0 }, 2500, function () {
			$("#explain p").text(txt);
			$("#explain").animate( { opacity: 1 }, 2500 );
		});
	} else {
		$("#explain p").text(txt);
		$("#explain").animate( { opacity: 1 }, 2500 );
	}
}

function showFinalAnswer () {
	showNextExplainText();
	
	if (!showedFinalAnswer) {
		setTimeout(animateAnswer, 2500);
		showedFinalAnswer = true;
	}
}

function animateAnswer () {
	answer[0].attr({ alongFinal: 0, transform: "s .25", opacity: .5 });
	answer[0].animate( { alongFinal: 1, transform: "s 1", opacity: 1 }, 1000, function () {
			answer[0].animate( { x: 740, y: 141 }, 250 );
		}
	);
	answer[1].attr({ alongFinal: 0, transform: "s .25", opacity: .5 });
	answer[1].animate( { alongFinal: 1, transform: "s 1", opacity: 1 }, 1200, function () {
			answer[1].animate( { x: 762, y: 141 }, 250 );
		}
	);
	answer[2].attr({ alongFinal: 0, transform: "s .25", opacity: .5 });
	answer[2].animate( { alongFinal: 1, transform: "s 1", opacity: 1 }, 1400, function () {
			answer[2].animate( { x: 780, y: 141 }, 250 );
		}
	);
	answer[3].attr({ alongFinal: 0, transform: "s .25", opacity: .5 });
	answer[3].animate( { alongFinal: 1, transform: "s 1", opacity: 1 }, 1600, function () {
			answer[3].animate( { x: 800, y: 141 }, 250 );
		}
	);
	answer[4].attr({ alongFinal: 0, transform: "s .25", opacity: .5 });
	answer[4].animate( { alongFinal: 1, transform: "s 1", opacity: 1 }, 1800, function () {
			answer[4].animate( { x: 825, y: 141 }, 250 );
		}
	);
	answer[5].attr({ alongFinal: 0, transform: "s .25", opacity: .5 });
	answer[5].animate( { alongFinal: 1, transform: "s 1", opacity: 1 }, 2000, function () {
			answer[5].animate( { x: 848, y: 141 }, 250 );
		}
	);
}

function onRestart () {
	window.location.reload();
}