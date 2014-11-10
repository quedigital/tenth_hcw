var f;

function BlockMove(event) {
	// Tell Safari not to move the window.
	event.preventDefault() ;
}

$(document).ready(function () {
	initialize();
});

function GetPos (e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft	+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	var pos = {x: posx, y: posy};
	return pos;
}

function initialize () {
	var id, xx, yy;
	
	$("body").bind("touchmove", BlockMove);
	
	f = new Flowchart( { host: "#container" } );
	
	f.setFlow( [
				{ name: "while", type: "continue", next: "variables" },
				{ name: "variables", type: "continue", next: "intro" },
				{ name: "intro", type: "continue", next: "input" },
				{ name: "input", type: "continue", next: "islegal" },
				{ name: "islegal", type: "decision", yes: { label: "isgo", x: 120, y: 20 }, no: { label: "tryagain", x: 0, y: 140 } },
				{ name: "tryagain", type: "continue", next: "input" },
				{ name: "isgo", type: "decision", yes: { label: "isnorth", x: 120, y: 20 }, no: { label: "istake", x: 0, y: 140 } },
				{ name: "isnorth", type: "decision", no: { label: "issouth", x: 120, y: 20 }, yes: { label: "gonorth", x: 0, y: 140 } },
				{ name: "issouth", type: "decision", no: { label: "iswest", x: 120, y: 20 }, yes: { label: "gosouth", x: 0, y: 140 } },
				{ name: "iswest", type: "decision", no: { label: "iseast", x: 120, y: 20 }, yes: { label: "gowest", x: 0, y: 140 } },
				{ name: "iseast", type: "decision", no: { label: "nogo", x: 120, y: 20 }, yes: { label: "goeast", x: 0, y: 140 } },
				{ name: "gonorth", type: "continue", next: "prelosechance" },
				{ name: "prelosechance", type: "continue", next: "prelosechance2" },
				{ name: "prelosechance2", type: "continue", next: "losechance" },
				{ name: "gosouth", type: "continue", next: "prelosechance" },
				{ name: "gowest", type: "continue", next: "prelosechance" },
				{ name: "goeast", type: "gameover", pos: [-940, 175] },
				{ name: "nogo", type: "continue", next: "prelosechance" },
				{ name: "istake", type: "decision", yes: { label: "isobjectmatch", x: 120, y: 20 }, no: { label: "isstrike", x: 0, y: 140 } },				
				{ name: "isstrike", type: "decision", yes: { label: "hasmatch", x: 120, y: 20 }, no: { label: "firecannon", x: 0, y: 140 } },
				{ name: "firecannon", type: "continue", next: "hasmatch2" },
				{ name: "hasmatch2", type: "decision", yes: { label: "isstruck", x: 120, y: 20 }, no: { label: "nomatch", x: 0, y: 140 } },
				{ name: "nomatch", type: "continue", next: "losechance" },
				{ name: "burning", type: "continue", next: "prelosechance2" },
				{ name: "isstruck", type: "decision", yes: { label: "istimer", x: 120, y: 20 }, no: { label: "notlit", x: 0, y: 140 } },
				{ name: "notlit", type: "continue", next: "losechance" },
				{ name: "istimer", type: "decision", yes: { label: "waitedtoolong", x: 120, y: 20 }, no: { label: "scaredaway", x: 0, y: 140 } },
				{ name: "scaredaway", type: "gameover", pos: [-690, -775] },
				{ name: "waitedtoolong", type: "continue", next: "losechance" },
				{ name: "isobjectmatch", type: "decision", yes: { label: "gotmatch", x: 0, y: 130 }, no: { label: "iscannon", x: 120, y: 20 } },
				{ name: "gotmatch", type: "continue", next: "showmatch" },
				{ name: "showmatch", type: "continue", next: "prelosechance2" },
				{ name: "iscannon", type: "decision", yes: { label: "tooheavy", x: 0, y: 140 }, no: { label: "nothere", x: 120, y: 20 } },				
				{ name: "tooheavy", type: "continue", next: "prelosechance2" },
				{ name: "nothere", type: "continue", next: "prelosechance2" },
				{ name: "hasmatch", type: "decision", yes: { label: "struck", x: 0, y: 130 }, no: { label: "pickupmatch", x: 120, y: 20 } },
				{ name: "pickupmatch", type: "continue", next: "prelosechance2" },
				{ name: "struck", type: "continue", next: "burning" },
				{ name: "burning", type: "continue", next: "losechance" },
				{ name: "losechance", type: "continue", next: "ischancesleft" },
				{ name: "ischancesleft", type: "decision", yes: { label: "toolong", x: -120, y: 20 }, no: { label: "input", x: 0, y: -100 } },
				{ name: "toolong", type: "gameover", pos: [640, -1015] },
				]);
				
	f.beginSet("while");
	f.addDecisionPoint( { id: "while1", text: "While key not = Esc, continue game", left: 0, top: 200 } );
	f.addNote( { id: "note1", text: 'Start here. “While” command sets up way to quit game by pressing Esc key.', width: 200, top: f.currentTop - 60, left: f.currentLeft - 300 } );
	f.addLine( { x1: f.currentLeft - 100, y1: f.currentTop - 50, sides: "T", width: 30 } );
	f.endSet();

	f.beginSet("variables");
	f.addArrow( { x1: f.currentLeft, y1: f.currentTop + 22, height: 18, sides: "L" } );
	f.currentTop += 10;
	f.addNote( { id: "variable_text", text: "<p style='font-family: GillSans-Light'>Set variables:</p><p>Location = Balcony</p><p>Match = False</p><p>Cannon = Present</p><p>Struck = False</p><p>Object = False</p><p>Chances Left = 4</p>", width: 250, left: f.currentLeft, top: f.currentTop + 60, movePen: true, centeredX: true } );
	f.addLine( { x1: f.currentLeft - 95, y1: f.currentTop - 70, sides: "T", width: 15 } );
	f.addLine( { x1: f.currentLeft - 80, y1: f.currentTop - 128, sides: "TBL", width: 15, height: 120 } );
	f.addNote( { text: "Variables are set to initial values.", width: 150, top: f.currentTop - 80, left: f.currentLeft - 225 } );
	f.endSet();
	
	f.beginSet("intro");
	f.addArrow( { x1: f.currentLeft, y1: f.currentTop, height: 10, sides: "L" } );
	f.addOutputBox( { text: 'Display text on screen:<br/>“You are standing on the balcony of a castle turret. There is a cannon and a match. To the north you see a hoard of Fire Demons approaching. The rail on the east side of the balcony is broken.', width: 250, height: 150, left: f.currentLeft, top: f.currentTop + 30 });
	f.endSet();

	f.beginSet("input");
	f.addArrow( { x1: f.currentLeft, y1: f.currentTop, height: 10, sides: "L" } );
	// NOTE: a single line of text wasn't centering with display: table-cell; hence the kludge
	f.addOutputBox( { text: "Get input from player", width: 250, height: 50, left: f.currentLeft, top: f.currentTop + 30, kludge: true });
	f.addNote( { text: 'First of series of decisions. Command word is compared to list of valid commands: “Go,” “Take,” “Strike Match,” and “Fire Cannon.”', width: 150, top: f.currentTop - 5, left: f.currentLeft - 220 } );
	f.addLine( { x1: f.currentLeft - 215, y1: f.currentTop - 30, width: 80, height: 20, sides: "TL" } );
	f.addArrow( { x1: f.currentLeft + 9, y1: f.currentTop + 330, width: 140, height: 202, sides: "TR", head: "L", current: "ischancesleft" } );
	f.addArrow( { x1: f.currentLeft - 250, y1: f.currentTop + 300, width: 250, height: 30, sides: "B", head: "BL", current: "ischancesleft" } );
	f.addArrow( { x1: f.currentLeft - 270, y1: f.currentTop - 385 + 300, width: 245, height: 410, sides: "TL", head: "TR", current: "ischancesleft" } );
	f.endSet();
	
	f.beginSet("islegal");
	f.addArrow( { x1: f.currentLeft, y1: f.currentTop - 15, height: 37, sides: "L" } );
	f.addDecisionPoint( { text: "Is command word legal?", left: f.currentLeft, top: f.currentTop + 60 });
	f.addNote( { text: 'If command is legal, the program compares it to three of four possibilities: “Go,” “Take,” “Strike Match.” If a possibility matches, flow continues along the “yes” arrow; if not, flow follows the “no” direction to', width: 350, top: f.currentTop - 13, left: f.currentLeft + 75 } );
	f.addNote( { text: 'another decision point.', width: 200, top: f.currentTop + 63, left: f.currentLeft + 160 } );
	f.addLine( { x1: f.currentLeft + 50, y1: f.currentTop - 32, width: 28, height: 15, sides: "TR" } );
	f.addLine( { x1: f.currentLeft + 325, y1: f.currentTop - 750, width: 100, height: 735, sides: "LT" } );
	f.addLine( { x1: f.currentLeft + 325, y1: f.currentTop - 450, width: 100, sides: "T" } );
	f.addLine( { x1: f.currentLeft + 325, y1: f.currentTop - 100, width: 100, sides: "T" } );
	f.endSet();
	
	f.saveCurrentPosition();
	
	f.beginSet("tryagain");
	f.addArrow( { x1: f.currentLeft, y1: f.currentTop + 23, height: 22, sides: "L" } );
	f.addOutputBox( { text: 'Display text on screen:<br/>“I don’t recognize that command. Please try again."', width: 250, height: 75, left: f.currentLeft, top: f.currentTop + 65 });
	f.addArrow( { x1: f.currentLeft - 250, y1: f.currentTop, width: 250, height: 30, sides: "BR", head: "BL" } );
	f.addArrow( { x1: f.currentLeft - 270, y1: f.currentTop - 385, width: 245, height: 410, sides: "TL", head: "TR" } );
	f.addNote( { text: "Game loops back if command is not recognized.", width: 250, top: f.currentTop + 50, left: f.currentLeft - 160, movePen: true } );
	f.addLine( { x1: f.currentLeft - 155, y1: f.currentTop - 110, width: 20, height: 70, sides: "TL" } );
	f.addLine( { x1: f.currentLeft + 130, y1: f.currentTop - 145, width: 60, height: 20, sides: "BR" } );
	f.endSet();
	
	var y0 = f.currentTop;
	
	f.beginSet("losechance");
	f.addRectangle( { text: "Chances Left = Chances Left - 1", width: 150, left: f.currentLeft + 275, top: y0 + 200 } );
	f.addNote( { text: 'Subtract 1 from chances left.', width: 250, top: y0 + 248, left: f.currentLeft + 448 } );
	f.addLine( { x1: f.currentLeft + 425, y1: y0 + 232, width: 25, height: 13, sides: "TR" } );
	// bazb
	f.addArrow( { x1: f.currentLeft + 700, y1: y0 + 150, height: 50, sides: "L", conditional: "nomatch" } );
	f.addArrow( { x1: f.currentLeft + 950, y1: y0 + 150, height: 50, sides: "L", conditional: "notlit" } );
	f.addArrow( { x1: f.currentLeft + 1450, y1: y0 + 150, height: 50, sides: "L", conditional: "waitedtoolong" } );
	f.addArrow( { x1: f.currentLeft + 442, y1: y0 - 455, height: 672, width: 1392, sides: "BR", head: "BL", conditional: "prelosechance" } );
	
	f.addArrow( { x1: f.currentLeft + 430, y1: y0 + 217, width: 268, sides: "T", head: "L", conditional: "nomatch" } );
	f.addArrow( { x1: f.currentLeft + 430, y1: y0 + 217, width: 518, sides: "T", head: "L", conditional: "notlit" } );
	f.addArrow( { x1: f.currentLeft + 430, y1: y0 + 217, width: 1018, sides: "T", head: "L", conditional: "waitedtoolong" } );

	// argh
	f.addArrow( { x1: f.currentLeft + 442, y1: y0 - 125, height: 342, width: 1392, sides: "BR", head: "BL", conditional: "prelosechance2" } );
	
	f.endSet(f.currentLeft + 350, y0 + 225);
	
	f.beginSet("ischancesleft");
	f.addDecisionPoint( { text: "Is Chances Left = 0?", left: f.currentLeft + 150, top: y0 + 170 } );
	f.addNote( { text: 'If Chances Left = 0, game is over.', width: 150, top: y0 + 250, left: f.currentLeft + 60 } );
	f.addArrow( { x1: f.currentLeft + 75, y1: y0 + 219, width: 50, sides: "T", head: "L" } );
	f.endSet();
	
	f.beginSet("toolong");
	f.addOutputBox( { text: 'Display:<br/>"You took too long. The Fire Demonds overpower you and tear you to shreds. Game over."', width: 170, height: 120, left: f.currentLeft - 275, top: y0 + 150 } );
	f.addArrow( { x1: f.currentLeft + 105, y1: y0 + 219, width: 100, sides: "T", head: "L" } );
	f.endSet();
	
	f.restoreCurrentPosition();
	
	f.beginSet("isgo");
	f.addArrow( { x1: f.currentLeft + 75, y1: f.currentTop - 800, width: 200, height: 750, sides: "BR", head: "" } );
	f.addArrow( { x1: f.currentLeft + 275, y1: f.currentTop - 800, width: 88, sides: "T", head: "TR" } );
	xx = f.currentLeft + 450;
	yy = f.currentTop - 850;
	f.addDecisionPoint( { text: 'Is command "Go"?', left: f.currentLeft + 450, top: yy } );
	f.endSet();
	
	f.beginSet("isnorth");
	f.addDecisionPoint( { text: 'North?', left: f.currentLeft + 250, top: yy, kludge: true } );
	f.addArrow( { x1: f.currentLeft - 170, y1: yy + 50, width: 80, sides: "T", head: "TR" } );
	f.endSet(f.currentLeft, f.currentTop - 50);
	
	var x0 = f.currentLeft;
	f.beginSet("gonorth");
	f.addOutputBox( { text: 'Display:<br/>“You look over the edge. The Fire Demons are closer.”', width: 175, height: 80, left: f.currentLeft, top: yy + 150 });
	f.addArrow( { x1: f.currentLeft, y1: yy + 123, height: 10, sides: "L" } );
	f.endSet();
	
	f.currentTop = yy;
	f.beginSet("issouth");
	f.addDecisionPoint( { text: 'South?', left: f.currentLeft + 250, top: yy, kludge: true } );
	f.addArrow( { x1: f.currentLeft - 170, y1: yy + 50, width: 80, sides: "T", head: "TR" } );
	f.endSet(f.currentLeft, f.currentTop - 50);

	f.beginSet("gosouth");
	f.addOutputBox( { text: 'Display: “You are inside the turret. There is a door on the north wall.”', width: 175, height: 80, left: f.currentLeft, top: yy + 150 });
	f.addArrow( { x1: f.currentLeft, y1: yy + 123, height: 10, sides: "L" } );
	f.endSet();

	f.currentTop = yy;
	f.beginSet("iswest");
	f.addDecisionPoint( { text: 'West?', left: f.currentLeft + 250, top: yy, kludge: true } );
	f.addArrow( { x1: f.currentLeft - 170, y1: yy + 50, width: 80, sides: "T", head: "TR" } );
	f.endSet(f.currentLeft, f.currentTop - 50);

	f.beginSet("gowest");
	f.addOutputBox( { text: 'Display: “You see nothing particularly interesting.”', width: 175, height: 80, left: f.currentLeft, top: yy + 150 });
	f.addArrow( { x1: f.currentLeft, y1: yy + 123, height: 10, sides: "L" } );
	f.endSet();

	f.currentTop = yy;
	f.beginSet("iseast");
	f.addDecisionPoint( { text: 'East?', left: f.currentLeft + 250, top: yy, kludge: true } );
	f.addArrow( { x1: f.currentLeft - 170, y1: yy + 50, width: 80, sides: "T", head: "TR" } );
	f.endSet(f.currentLeft, f.currentTop - 50);

	f.beginSet("goeast");
	f.addOutputBox( { text: 'Display:<br/>“You fall off the balcony and die. Game over.”', width: 175, height: 80, left: f.currentLeft, top: yy + 150 });
	f.addNote( { text: 'This result ends game. Player loses.', width: 250, top: yy + 290, left: f.currentLeft - 110 } );
	f.addLine( { x1: f.currentLeft, y1: yy + 240, height: 45, sides: "L" } );
	f.addArrow( { x1: f.currentLeft, y1: yy + 123, height: 10, sides: "L" } );
	f.endSet();
	
	f.beginSet("nogo");
	f.addOutputBox( { text: 'Display:<br/>"You can\'t go in that direction."', width: 175, height: 80, left: f.currentLeft + 250, top: yy + 150 });
	f.addNote( { text: 'Player has entered invalid direction.', width: 100, top: yy + 70, left: f.currentLeft + 40 } );
	f.addLine( { x1: f.currentLeft + 15, y1: yy + 80, width: 20, height: 65, sides: "LT" } );
	f.addArrow( { x1: f.currentLeft - 170, y1: yy + 50, width: 170, height: 80, sides: "TR", head: "BR" } );
	f.endSet();

	f.beginSet("prelosechance");
	f.addNote( { text: "Any time the flow of the program reaches this vertical line, control loops back so the player can type another command.", width: 125, left: f.currentLeft - 10, top: yy + 630 } );
	f.addLine( { x1: f.currentLeft + 110, y1: yy + 640, width: 20, sides: "T" } );
	f.addArrow( { x1: x0, y1: yy + 230, height: 18, sides: "L" } );
	f.addArrow( { x1: x0 + 4, y1: yy + 262, width: 1130, height: 340, sides: "TR" } );
	
	f.addArrow( { x1: x0 + 250, y1: yy + 230, height: 18, sides: "L", conditional: "gosouth" });
	f.addArrow( { x1: x0 + 500, y1: yy + 230, height: 18, sides: "L", conditional: "gowest" });
	f.addArrow( { x1: x0 + 1000, y1: yy + 230, height: 18, sides: "L", conditional: "nogo" });
	
	f.endSet(f.currentLeft + 50, yy + 500);
	
	f.beginSet("prelosechance2");
	f.addArrow( { x1: xx + 250, y1: yy + 600, height: 15, width: 1115, sides: "LB", head: "BRe" } );	
//	f.beginSet("prelosechance2");
	f.addArrow( { x1: xx + 250, y1: yy + 935, height: 15, width: 1115, sides: "LB", head: "BRe" } );
	f.addArrow( { x1: xx + 500, y1: yy + 890, height: 40, sides: "L", conditional: "pickupmatch" } );
	f.addArrow( { x1: xx + 1384, y1: yy + 620, height: 316, sides: "L" } );
	f.endSet(xx + 1300, yy + 750);
	
	f.beginSet("istake");
	f.addDecisionPoint( { text: 'Is command "Take"?', left: xx, top: yy + 300 } );
	f.addArrow( { x1: xx, y1: yy + 125, height: 140, sides: "L" } );
	f.endSet();
	
	f.beginSet("isobjectmatch");
	f.addDecisionPoint( { text: 'Is object "match"?', left: xx + 250, top: yy + 300 } );
	f.addArrow( { x1: xx + 75, y1: yy + 350, width: 88, sides: "T", head: "TR" } );
	f.endSet();
	
	f.beginSet("gotmatch");
	f.addRectangle( { text: "Match = True", left: xx + 175, top: yy + 445, width: 150, kludge: true, height: 50 } );
	f.addNote( { text: 'Variable “match” is set to true.', width: 75, top: yy + 440, left: xx + 75 } );
	f.addLine( { x1: xx + 135, y1: yy + 450, width: 40, sides: "T" } );
	f.addArrow( { x1: xx + 250, y1: yy + 422, height: 8, sides: "L" } );
	f.endSet(xx + 250, yy + 480);
	
	f.beginSet("showmatch");
	f.addOutputBox( { text: "Display:<br/>\"You have the match.\"", width: 175, height: 75, left: xx + 250, top: yy + 525, kludge: true } );
	f.addArrow( { x1: xx + 250, y1: yy + 498, height: 10, sides: "L" } );
	f.endSet();
	
	f.beginSet("iscannon");
	f.addDecisionPoint( { text: 'Is object "cannon"?', left: xx + 500, top: yy + 300 } );
	f.addArrow( { x1: xx + 325, y1: yy + 350, width: 88, sides: "T", head: "TR" } );
	f.endSet();
	
	f.beginSet("tooheavy");
	f.addOutputBox( { text: "Display:<br/>\"The cannon is too heavy for you to lift.\"", width: 175, height: 75, left: xx + 500, top: yy + 450 });
	f.addArrow( { x1: xx + 500, y1: yy + 422, height: 8, sides: "L" } );
	f.addArrow( { x1: xx + 500, y1: yy + 525, height: 70, sides: "L", conditional: "prelosechance2" } );
	f.endSet();
	
	f.beginSet("nothere");
	f.addOutputBox( { text: "Display:<br/>\"That object is not here.\"", width: 175, height: 75, left: xx + 750, top: yy + 450, kludge: true });
	f.addNote( { text: 'This is program’s response if, for example, command is “Take knife” and a knife is not present.', width: 175, top: yy + 455, left: xx + 885 } );
	f.addLine( { x1: xx + 858, y1: yy + 463, width: 25, sides: "T" } );
	f.addArrow( { x1: xx + 575, y1: yy + 350, width: 175, height: 80, sides: "TR", head: "BR" } );
	f.addArrow( { x1: xx + 575 + 175, y1: yy + 525, height: 70, sides: "L", conditional: "prelosechance2" } );
	f.endSet();

	f.beginSet("isstrike");
	f.addDecisionPoint( { text: 'Is command "Strike match"?', left: xx, top: yy + 650 } );
	f.addArrow( { x1: xx, y1: yy + 125 + 300, height: 190, sides: "L" } );
	f.endSet();
	
	f.beginSet("hasmatch");
	f.addDecisionPoint( { text: 'Is Match = True?', left: xx + 250, top: yy + 650 } );
	f.addNote( { text: 'Test whether player has match.', width: 100, top: yy + 610, left: xx + 100 } );
	f.addLine( { x1: xx + 195, y1: yy + 620, width: 20, height: 46, sides: "TR" } );
	f.addArrow( { x1: xx + 75, y1: yy + 700, width: 90, sides: "T", head: "TR" } );
	f.endSet();
	
	f.beginSet("pickupmatch");
	f.addOutputBox( { text: "Display:<br/>\"You have to pick up match before you can strike it.\"", width: 175, left: xx + 500, top: yy + 790 } );
	f.addArrow( { x1: xx + 325, y1: yy + 700, width: 175, height: 70, sides: "TR", head: "BR" } );
	f.endSet();
	
	f.beginSet("struck");
	f.addRectangle( { text: "Struck = True start timer", left: xx + 175, top: yy + 795, width: 150 } );
	f.addNote( { text: 'Variable<br/>“Struck”<br/>is set to true.<br/>Timer<br/>routine<br/>simulates<br/>time it<br/>takes<br/>match to burn out.', width: 150, top: yy + 790, left: xx + 75 } );
	f.addArrow( { x1: xx + 250, y1: yy + 772, height: 8, sides: "L" } );
	f.endSet(xx + 250, yy + 820);
	
	f.beginSet("burning");
	f.addOutputBox( { text: "Display:<br/>\"The match is burning.\"", width: 175, height: 75, left: xx + 250, top: yy + 860, kludge: true } );
	f.addArrow( { x1: xx + 250, y1: yy + 772 + 63, height: 8, sides: "L" } );
	f.endSet();

	f.beginSet("firecannon");
	f.addRectangle( { text: "Command = \"Fire Cannon\"", width: 150, left: xx - 75, top: yy + 1025 } );
	f.addNote( { text: 'Because three commands have been eliminated, command must be the only possibility left.<br/>“Fire Cannon.”', width: 175, top: yy + 1070, left: xx - 120 } );
	f.addLine( { x1: xx - 116, y1: yy + 1045, width: 40, height: 20, sides: "LT" } );
	f.addArrow( { x1: xx, y1: yy + 775, height: 230, sides: "L" } );
	f.endSet(xx, yy + 1125);
	
	f.beginSet("hasmatch2");
	f.addDecisionPoint( { text: "Is Match = True?", left: xx + 250, top: yy + 1000 } );
	f.addArrow( { x1: xx + 78, y1: yy + 1048, width: 85, sides: "T", head: "TR" } );
	f.endSet();
	
	f.beginSet("nomatch");
	f.addOutputBox( { text: "Display:<br/>\"You can't light the cannon without a match.\"", left: xx + 250, top: yy + 1150, width: 175, height: 75 } );
	f.addArrow( { x1: xx + 250, y1: yy + 1122, height: 10, sides: "L" } );
	f.endSet();
	
	f.beginSet("isstruck");
	f.addDecisionPoint( { text: "Is Struck = True?", left: xx + 500, top: yy + 1000 } );
	f.addArrow( { x1: xx + 328, y1: yy + 1048, width: 85, sides: "T", head: "TR" } );
	f.endSet();

	f.beginSet("notlit");
	f.addOutputBox( { text: "Display:<br/>\"The match is not lit.\"", left: xx + 500, top: yy + 1150, width: 175, height: 75, kludge: true } );
	f.addArrow( { x1: xx + 500, y1: yy + 1122, height: 10, sides: "L" } );
	f.endSet();

	f.beginSet("istimer");
	f.addDecisionPoint( { text: "Is timer expired?", left: xx + 750, top: yy + 1000 } );
	f.addArrow( { x1: xx + 628 - 50, y1: yy + 1048, width: 85, sides: "T", head: "TR" } );
	f.endSet();
	
	f.beginSet("scaredaway");
	f.addOutputBox( { text: "Display:<br/>\"The cannon fires a ball at the Fire Demons, scaring them away.\"", left: xx + 750, top: yy + 1150, width: 175, height: 75 } );
	f.addArrow( { x1: xx + 750, y1: yy + 1122, height: 10, sides: "L" } );
	f.addNote( { text: 'Result player wants. Variables are reset and program might branch to new section of code.', width: 350, top: yy + 1310, left: xx + 680 } );
	f.addLine( { x1: xx + 683, y1: yy + 1235, height: 75, sides: "L" } );
	f.endSet();

	f.beginSet("waitedtoolong");
	f.addOutputBox( { text: "Display:<br/>\"You waited too long. The match is burned out.\"", left: xx + 1000, top: yy + 1150, width: 175, height: 75 } );
	f.addArrow( { x1: xx + 825, y1: yy + 1050, width: 175, height: 80, sides: "TR", head: "BR" } );
	f.endSet();

	
	f.begin();
	
//	f.gotoLabel("islegal");
}

function setupTransitions () {
//	$("#container").addClass("animatedTransitions");
	$("#cont").addClass("animateMotion");
	$(".set").css("-webkit-transition", "opacity 1s ease-in-out, -webkit-transform 1s ease-in-out");
	$("#input").addClass("animatedTransitions");
}

function Flowchart (params) {
	this.host = params.host;
	
	this.flow = [];
	
	this.currentSet = this.host;
	
	this.sets = [];
	this.objects = [];
	this.id = 1;
	
	this.currentLeft = 0;
	this.currentTop = 0;
	
	this.savedPosition = {};
	
	this.currentLabel = "";
	
	$("#cont").bind("click", jQuery.proxy(this, "onClickContinue"));
	$("#yes").bind("click", jQuery.proxy(this, "onClickYes"));
	$("#no").bind("click", jQuery.proxy(this, "onClickNo"));
	$("#startover").bind("click", jQuery.proxy(this, "onClickStartOver"));
}

Flowchart.prototype = {
	setFlow: function (array) {
		this.flow = array.slice();
	},
	
	begin: function () {
		for (var i = 0; i < this.flow.length; i++) {
			var thisf = this.flow[i];
			thisf.visited = false;
		}

		this.removeYesNoLabels();
		
		$("#yes").css("display", "none");
		$("#no").css("display", "none");
		
		$("#startover").css("left", "40px");
		$("#startover").css("top", "680px");
		
		this.gotoLabel(this.flow[0].name);
		
		setTimeout("setupTransitions()");
	},
	
	getCurrentFlow: function () {
		for (var i = 0; i < this.flow.length; i++) {
			if (this.flow[i].name == this.currentLabel) {
				return this.flow[i];
			}
		}
	},
	
	getCurrentSet: function () {
		for (var i = 0; i < this.sets.length; i++) {
			if (this.sets[i].name == this.currentLabel) {
				return this.sets[i];
			}
		}
	},
	
	gotoLabel: function (n) {
		var currentStep, loopingBack;
		
		if (f.currentLabel == "input" || f.currentLabel == "tryagain") {
			// SPECIAL CASE: hide all nodes after "input" when we leave it
			for (var i = 0; i < this.flow.length; i++) {
				if (this.flow[i].name == "input") {
					for (var j = i + 1; j < this.flow.length; j++) {
						this.flow[j].visited = false;
					}
					break;
				}
			}
			this.removeYesNoLabels();
		} else if (f.currentLabel == "losechance") {
			// SPECIAL CASE: hide "islegal" to make the continue button legible
			for (var i = 0; i < this.flow.length; i++) {
				if (this.flow[i].name == "islegal") {
					this.flow[i].visited = false;
					break;
				}
			}
			this.removeYesNoLabels();
		}
		
		for (var i = 0; i < this.flow.length; i++) {
			var thisf = this.flow[i];
			if (thisf.name == n) {
				$("#" + thisf.name).css("opacity", 1.0);
				//$("#" + thisf.name).fadeIn(1000);
				if (thisf.visited) {
					loopingBack = true;
				}
				thisf.visited = true;				
				currentStep = thisf;				
			} else if (thisf.visited && !loopingBack) {
				if ($("#" + thisf.name).css("opacity") != "1") {
					$("#" + thisf.name).css("opacity", 1.0);
				}
				//$("#" + thisf.name).fadeIn(1000);
			} else if (!thisf.visited) {
				$("#" + thisf.name).css("opacity", 0);
				//$("#" + thisf.name).fadeOut(1000);
				//thisf.visited = false;
			}
		}
		
		this.currentLabel = n;

		// move viewport so it centers on this element
		for (i = 0; i < this.sets.length; i++) {
			if (this.sets[i].name == n) {
				/*
				if (i > 0) 
					cy = (this.sets[i].top + this.sets[i - 1].top) * .5;
				else
					cy = this.sets[i].top * .5;
				*/
				this.cy = this.sets[i].afterTop;
				this.cx = this.sets[i].afterLeft;
				break;
			}
		}
		
		/*
		$("#container").css("left", (512 - cx) + "px");
		$("#container").css("top", (384 - cy) + "px");
		//*/
		var xx = 512 - this.cx, yy = 384 - this.cy;
		// NOTE: This seems to cause flickering (yea, possibly hardware accelerated flickering)
//		$("#container").css("-webkit-transform", "translate(" + xx + "px, " + yy + "px)");
//		$("#container").css("-webkit-transform", "translate3d(" + xx + "px, " + yy + "px, 0)");

		for (i = 0; i < this.sets.length; i++) {
			var s = this.sets[i];
			var xx = 512 - this.cx;
			var yy = 384 - this.cy;
			$("#" + s.name).css("-webkit-transform", "translate3d(" + xx + "px, " + yy + "px, 0)");
		}

		this.hideConditionalArrows();
		
		// TODO: get the continue button to fade out (it's ignoring the transition setting!)
		
		// when going from one decision to another, start the new yes/no fade from opacity 0 immediately
		
		switch (currentStep.type) {
			case "gameover":
				/*
				$("#yes").removeClass("animatedOpacityOn");
				$("#no").removeClass("animatedOpacityOn");
				$("#yes").addClass("animatedOpacityOff");
				$("#no").addClass("animatedOpacityOff");
				
				$("#yes").css("opacity", 0);
				$("#no").css("opacity", 0);
				*/
				$("#yes").fadeOut(1000);
				$("#no").fadeOut(1000);			
				
				/*
				$("#cont").removeClass("animatedOpacity");
				$("#cont").css("opacity", 0);
				*/
				$("#cont").fadeOut(1000);
				
				for (i = 0; i < this.sets.length; i++) {
					if (this.sets[i].name == n) {
						var s = this.sets[i];
						$("#startover").css("left", (s.afterLeft + currentStep.pos[0]) + "px");
						$("#startover").css("top", (s.afterTop + currentStep.pos[1]) + "px");
						break;
					}
				}
				
				break;
			case "continue":
				/*
				$("#yes").removeClass("animatedOpacityOn");
				$("#no").removeClass("animatedOpacityOn");
				$("#yes").addClass("animatedOpacityOff");
				$("#no").addClass("animatedOpacityOff");
				
				$("#yes").css("opacity", 0);
				$("#no").css("opacity", 0);
				
				$("#cont").removeClass("animatedOpacity");
				$("#cont").css("opacity", 0);
				*/
				if ($("#yes").css("display") == "block") {
					$("#yes").fadeOut(1000);
					$("#no").fadeOut(1000);
				}
				
				for (i = 0; i < this.sets.length; i++) {
					if (this.sets[i].name == n) {
						var s = this.sets[i];
						if (currentStep.next != undefined) {
							/*
							$("#cont").addClass("animatedOpacity");
							$("#cont").css("opacity", 1.0);
							*/
							$("#cont").fadeIn(1000);
						}
						break;
					}
				}
				break;
			case "decision":
				/*
				$("#cont").css("opacity", 0);
				
				$("#yes").removeClass("animatedOpacityOn");
				$("#no").removeClass("animatedOpacityOn");
				$("#yes").removeClass("animatedOpacityOff");
				$("#no").removeClass("animatedOpacityOff");
				
				$("#yes").css("opacity", 0);
				$("#no").css("opacity", 0);
				*/
				$("#cont").fadeOut(1000);
				
				for (i = 0; i < this.sets.length; i++) {
					if (this.sets[i].name == n) {
						var s = this.sets[i];
						var elemName = "#" + n + " .decision";
						
						/*
						$("#yes").css("left", (this.getObjectLeft(elemName) + currentStep.yes.x) + "px");
						$("#yes").css("top", (this.getObjectTop(elemName) + currentStep.yes.y) + "px");
						
						$("#no").css("left", (this.getObjectLeft(elemName) + currentStep.no.x) + "px");
						$("#no").css("top", (this.getObjectTop(elemName) + currentStep.no.y) + "px");
						*/
						$("#yes").css("left", (512 + (currentStep.yes.x)) + "px");
						$("#yes").css("top", (284 + (currentStep.yes.y)) + "px");
						
						$("#no").css("left", (512 + (currentStep.no.x)) + "px");
						$("#no").css("top", (284 + (currentStep.no.y)) + "px");
						break;
					}
				}
				
				/*
				$("#yes").addClass("animatedOpacityOn");
				$("#no").addClass("animatedOpacityOn");
				
				$("#yes").css("opacity", 1.0);
				$("#no").css("opacity", 1.0);
				*/
				$("#yes").fadeIn(1000);
				$("#no").fadeIn(1000);
				
				break;
		}
				
		// move the continue button to this step (even if it's not visible)
		for (i = 0; i < this.sets.length; i++) {
			if (this.sets[i].name == n) {
				var s = this.sets[i];
				$("#cont").css("left", 512 + this.cx - s.afterLeft + "px");
				$("#cont").css("top", 384 + ((s.afterTop + 50) - this.cy) + "px");
				break;
			}
		}		
	},
	
	continue: function () {
		for (var i = 0; i < this.flow.length; i++) {
			if (this.flow[i].name == this.currentLabel) {
				this.gotoLabel(this.flow[i].next);
				break;
			}
		}
	},
	
	addLabelAtObject: function (val, text) {
		var currentStep = this.getCurrentFlow();
		var currentSet = this.getCurrentSet();
		
		var id, text, pos, offset, screen;
		if (val) {
			id = "#yes";
			text = "YES";
			// find position of yes local to this set
			//offset = $("#" + currentStep.name).offset();
			offset = { left: currentSet.afterLeft, top: currentSet.afterTop };
			screen = { left: currentStep.yes.x, top: currentStep.yes.y };
//			pos = { x: base.left - offset.left, y: base.top - offset.top };
			pos = { x: screen.left + offset.left, y: screen.top + offset.top };
		} else {
			id = "#no";
			text = "NO";
			//offset = $("#" + currentStep.name).offset();
			offset = { left: currentSet.afterLeft, top: currentSet.afterTop };
			screen = { left: currentStep.no.x, top: currentStep.no.y };
			pos = { x: screen.left + offset.left, y: screen.top + offset.top };
		}
		
		var offsetx = 0, offsety = 0;
		for (var i = 0; i < this.flow.length; i++) {
			var thisf = this.flow[i];
			if (thisf.name == this.currentLabel) {
				if (val) {
					if (thisf.yes.x == 0) {
						// vertical yes
						offsetx = -35;
						offsety = -110;
					} else {
						// horizontal yes
						offsetx = -20;
						offsety = -100;
					}
				} else {
					if (thisf.no.x == 0) {
						// vertical no
						offsetx = -35;
						offsety = -110;
					} else {
						// horizontal no
						offsetx = -20;
						offsety = -100;
					}
				}
				break;
			}
		}
		
		var top = this.getObjectTop(id) - 20;
		var left = this.getObjectLeft(id);
		
		// these are screen coordinates
		var xx = pos.x + offsetx;//pos.x - currentSet.left;
		var yy = pos.y + offsety;//currentSet.top - pos.y;
		
		console.log(currentStep.yes.x + ", " + currentStep.yes.y);
		
		var s = $("#" + this.currentLabel).append("<div class='yesnolabel' style='left: " + (xx) + "px; top: " + (yy) + "px;'>" + text + "</div>");
	},
	
	removeYesNoLabels: function () {
		$(".yesnolabel").remove();
	},
	
	followYes: function () {
		this.addLabelAtObject(true);
		
		for (var i = 0; i < this.flow.length; i++) {
			if (this.flow[i].name == this.currentLabel) {
				this.gotoLabel(this.flow[i].yes.label);
				break;
			}
		}
	},
	
	followNo: function () {
		this.addLabelAtObject(false);
		
		for (var i = 0; i < this.flow.length; i++) {
			if (this.flow[i].name == this.currentLabel) {
				this.gotoLabel(this.flow[i].no.label);
				break;
			}
		}
	},
	
	hideConditionalArrows: function () {
		for (var i = 0; i < this.objects.length; i++) {
			var obj = this.objects[i];
			if (obj.type == "arrow" && obj.params.conditional) {
				var shouldBeVisible = false;
				for (var j = 0; j < this.flow.length; j++) {
					var flow = this.flow[j];
					if (flow.name == obj.params.conditional) {
						shouldBeVisible = flow.visited;
						break;
					}
				}
				$("#" + "arrow" + obj.id).css("display", shouldBeVisible ? "block" : "none");
//				console.log(obj.id + " = " + shouldBeVisible);
			}
		}
		
		for (var i = 0; i < this.objects.length; i++) {
			var obj = this.objects[i];
			if (obj.type == "arrow" && obj.params.current) {
				var shouldBeVisible = (obj.set == "#" + this.currentLabel);				
				for (var j = 0; j < this.flow.length; j++) {
					var flow = this.flow[j];
					if (flow.name == obj.params.current) {
						shouldBeVisible = shouldBeVisible && flow.visited;
						break;
					}
				}
				$("#" + "arrow" + obj.id).css("display", shouldBeVisible ? "block" : "none");
			}
		}
	},
	
	addObject: function (type, params) {
		var id = this.id;
		this.objects.push( { type: type, params: params, id: id, set: this.currentSet });
		this.id++;
		
		return id;
	},
	
	addDecisionPoint: function (params) {
		var id_number = this.addObject("decision", params);
		
		var id = "decision" + id_number;
		if (params.id != undefined) id = params.id;
		
		var s = '<div id="' + id + '" class="decision" style="';
		
		var styles = "";
		
		if (params.left != undefined) {
			styles += "left: " + params.left + "px;";
		}
		
		if (params.top != undefined) {
			styles += "top: " + params.top + "px;";
		}
		
		if (params.kludge != undefined) {
			s += styles + '"><div class="diamond"></div><p class="one-line-kludge">' + params.text + '</p></div>';
		} else {
			s += styles + '"><div class="diamond"></div><p>' + params.text + '</p></div>';
		}
		
		$(this.currentSet).append(s);
		
		if (!isNaN(this.getObjectTop("#" + id)) && !isNaN(this.getObjectHeight("#" + id)))
			this.currentTop = this.getObjectTop("#" + id) + this.getObjectHeight("#" + id);
			
		if (!isNaN(this.getObjectLeft("#" + id)))
			this.currentLeft = this.getObjectLeft("#" + id);
		
		return id;
	},
	
	addNote: function (params) {
		var id_number = this.addObject("note", params);
		
		var id = "note" + id_number;
		if (params.id != undefined) id = params.id;
		
		var s = '<div id="' + id + '" class="note" style="';
		
		var styles = "";
		
		if (params.width != undefined) {
			if (params.centeredX) {
				styles += "width: " + params.width + "px; margin-left: " + (-params.width * .5) + "px;";
			} else {
				styles += "width: " + params.width + "px;";
			}
		}

		if (params.left != undefined) {
			styles += "left: " + params.left + "px;";
		}
		
		if (params.top != undefined) {
			styles += "top: " + params.top + "px;";
		}
		
		s += styles + '"><p>' + params.text + '</p></div>';
		
		$(this.currentSet).append(s);

		if (params.movePen) {
			if (!isNaN(this.getObjectTop("#" + id)) && !isNaN(this.getObjectHeight("#" + id))) {
				this.currentTop = this.getObjectTop("#" + id) + this.getObjectHeight("#" + id);
			}
			/*
			if (!isNaN(this.getObjectLeft("#" + id)))
				this.currentLeft = this.getObjectLeft("#" + id);
			*/
		}
		
		return id;
	},
	
	addOutputBox: function (params) {
		var id_number = this.addObject("output", params);
		
		var id = "output" + id_number;
		if (params.id != undefined) id = params.id;
		
		var s = '<div id="' + id + '" class="output" style="';
		
		var styles = "";
		
		if (params.width != undefined) {
			styles += "width: " + params.width + "px; margin-left: " + (-params.width * .5 - 25) + "px;";
		}
		
		if (params.left != undefined) {
			styles += "left: " + params.left + "px;";
		}
		
		if (params.top != undefined) {
			styles += "top: " + params.top + "px;";
		}
		
		if (params.kludge) {
			s += styles + '"><div class="trapezoid" style="border-top-width: ' + params.height + 'px;"></div><p class="one-line-kludge" style="height: ' + params.height + 'px;">' + params.text + '</p></div>';
		} else {
			s += styles + '"><div class="trapezoid" style="border-top-width: ' + params.height + 'px;"></div><p style="height: ' + params.height + 'px;">' + params.text + '</p></div>';
		}
		
		$(this.currentSet).append(s);
		
		if (!isNaN(this.getObjectTop("#" + id)) && !isNaN(this.getObjectHeight("#" + id)))
			this.currentTop = this.getObjectTop("#" + id) + this.getObjectHeight("#" + id);
			
		if (!isNaN(this.getObjectLeft("#" + id)))
			this.currentLeft = this.getObjectLeft("#" + id);
		
		return id;
	},
	
	addRectangle: function (params) {
		var id_number = this.addObject("rectangle", params);
		
		var id = "rectangle" + id_number;
		if (params.id != undefined) id = params.id;
		
		var s = '<div id="' + id + '" class="rectangle" style="';
		
		var styles = "";
		
		if (params.width != undefined) {
			if (params.centeredX) {
				styles += "width: " + params.width + "px; margin-left: " + (-params.width * .5) + "px;";
			} else {
				styles += "width: " + params.width + "px;";
			}
		}

		if (params.height != undefined) {
			styles += "height: " + params.height + "px;";
		}

		if (params.left != undefined) {
			styles += "left: " + params.left + "px;";
		}
		
		if (params.top != undefined) {
			styles += "top: " + params.top + "px;";
		}
		
		if (params.kludge != undefined) {
			s += styles + '"><p class="one-line-kludge">' + params.text + '</p></div>';
		} else {		
			s += styles + '"><p>' + params.text + '</p></div>';
		}
		
		$(this.currentSet).append(s);

		return id;
	},
	
	addLine: function (params) {
		var id_number = this.addObject("line", params);
		
		var id = "line" + id_number;
		if (params.id != undefined) id = params.id;
		
		var klass = "noteline";
		if (params.klass != undefined) klass = params.klass;
		
		var styles = "", classString = klass;
		
		var x = params.x1;
		var y = params.y1;
		
		styles += "left: " + x + "px; top: " + y + "px;";
		
		if (params.width != undefined)
			styles += "width: " + params.width + "px;";
		if (params.height != undefined)
			styles += "height: " + params.height + "px;";
			
		if (params.sides.indexOf("T") != -1)
			classString += " " + klass + "-top"
		if (params.sides.indexOf("R") != -1)
			classString += " " + klass + "-right"
		if (params.sides.indexOf("B") != -1)
			classString += " " + klass + "-bottom"
		if (params.sides.indexOf("L") != -1)
			classString += " " + klass + "-left"
		
		var s = '<div id="' + id + '" class="' + classString + '" style="' + styles + '"></div>';
		
		var host = this.currentSet;
		if (params.host != undefined) host = params.host;
		
		$(host).append(s);
		
		return id;
	},

	addArrow: function (params) {
		var id_number = this.addObject("arrow", params);
		
		var id = "arrow" + id_number;
		if (params.id != undefined) id = params.id;
		
		var styles = "";
		
		var s = '<div id="' + id + '" class="arrow" style="';
		
		styles += "left: " + params.x1 + "px; top: " + params.y1 + "px;";
		
		s += styles + '"></div>';
		
		$(this.currentSet).append(s);
		
		var props = { klass: "arrowline" };
		for (var each in params) {
			props[each] = params[each];
		}
		props.x1 = 0;
		props.y1 = 0;
		
		props.host = $("#" + id);
		
		this.addLine(props);
		
		// add arrow head
		
		var head = "BR";
		if (params.head != undefined) head = params.head;
		
		var xx, yy, suffix;
		switch (head) {
			case "BR":
				xx = params.width;
				yy = params.height;
				suffix = "s";
				break;
			case "BL":
				xx = -24;
				yy = params.height - 6;
				suffix = "w";
				break;
			case "TR":
				xx = params.width;
				yy = -6;
				suffix = "e";
				break;
			case "T":
				xx = params.width - 6;
				yy = -6;
				suffix = "n";
				break;
			case "BRe":
				xx = params.width;
				yy = params.height - 6;
				suffix = "e";
				break;
			case "L":
				xx = -12;
				yy = -6;
				suffix = "w";
				break;
			case "TL":
				xx = 0;
				yy = 0;
				suffix = "w";
				break;
		}
		
		$("#" + id).append('<div class="arrow-' + suffix + '" style="left: ' + (xx) + 'px; top: ' + (yy) + 'px;"></div>');
		
		// if it's a conditional arrow, turn it off by default
//		if (params.conditional) $("#" + id).css("display", "none");
		
		return id;
	},
	
	beginSet: function (s, xx, yy) {
		if (xx == undefined) xx = this.currentLeft;
		if (yy == undefined) yy = this.currentTop;
		
		this.sets.push( { name: s, left: xx, top: yy } );
		
		$(this.host).append("<div class='set' id='" + s + "'></div>");
		
		this.currentSet = "#" + s;
	},
	
	endSet: function (xx, yy) {
		if (xx == undefined) xx = this.currentLeft;
		if (yy == undefined) yy = this.currentTop;
		
		var s = this.sets[this.sets.length - 1];
		s.afterLeft = xx;
		s.afterTop = yy;
	},
	
	getObjectLeft: function (obj) {
		return parseInt($(obj).css("left"));
	},
	
	getObjectTop: function (obj) {
		return parseInt($(obj).css("top"));
	},

	getObjectHeight: function (obj) {
		return parseInt($(obj).css("height"));
	},
	
	saveCurrentPosition: function () {
		this.savedPosition = { x: this.currentLeft, y: this.currentTop };
	},
	
	restoreCurrentPosition: function () {
		this.currentLeft = this.savedPosition.x;
		this.currentTop = this.savedPosition.y;
	},
	
	onClickContinue: function (evt) {
		this.continue();
	},
	
	onClickYes: function (evt) {
		this.followYes();
	},
	
	onClickNo: function (evt) {
		this.followNo();
	},
	
	onClickStartOver: function (evt) {
		this.begin();
	},
}
