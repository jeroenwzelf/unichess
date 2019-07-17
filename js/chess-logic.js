var board;
var turn;
var selectedSquare;
var playerState;
var unmoved_pieces;
var gameEnded;

var playerColor;

function initialize() {
	init_moveList();
	turn = 0;
	gameEnded = false;
	playerState = [
		{ color: 'w', kingPos: 'h1', inCheck: false, inCheckMate: false },
		{ color: 'i', kingPos: 'n8', inCheck: false, inCheckMate: false },
		{ color: 'b', kingPos: 'h14', inCheck: false, inCheckMate: false },
		{ color: 'a', kingPos: 'a8', inCheck: false, inCheckMate: false }
	];
	// starting 4 player position
	var position = {
		d1: playerState[0].color + 'R', e1: playerState[0].color + 'N', f1: playerState[0].color + 'B', g1: playerState[0].color + 'Q', h1: playerState[0].color + 'K', i1: playerState[0].color + 'B', j1: playerState[0].color + 'N', k1: playerState[0].color + 'R', d2: playerState[0].color + 'P', e2: playerState[0].color + 'P', f2: playerState[0].color + 'P', g2: playerState[0].color + 'P', h2: playerState[0].color + 'P', i2: playerState[0].color + 'P', j2: playerState[0].color + 'P', k2: playerState[0].color + 'P',
		d14: playerState[2].color + 'R', e14: playerState[2].color + 'N', f14: playerState[2].color + 'B', g14: playerState[2].color + 'Q', h14: playerState[2].color + 'K', i14: playerState[2].color + 'B', j14: playerState[2].color + 'N', k14: playerState[2].color + 'R', d13: playerState[2].color + 'P', e13: playerState[2].color + 'P', f13: playerState[2].color + 'P', g13: playerState[2].color + 'P', h13: playerState[2].color + 'P', i13: playerState[2].color + 'P', j13: playerState[2].color + 'P', k13: playerState[2].color + 'P',
		a4: playerState[3].color + 'R', a5: playerState[3].color + 'N', a6: playerState[3].color + 'B', a7: playerState[3].color + 'Q', a8: playerState[3].color + 'K', a9: playerState[3].color + 'B', a10: playerState[3].color + 'N', a11: playerState[3].color + 'R', b4: playerState[3].color + 'P', b5: playerState[3].color + 'P', b6: playerState[3].color + 'P', b7: playerState[3].color + 'P', b8: playerState[3].color + 'P', b9: playerState[3].color + 'P', b10: playerState[3].color + 'P', b11: playerState[3].color + 'P',
		n4: playerState[1].color + 'R', n5: playerState[1].color + 'N', n6: playerState[1].color + 'B', n7: playerState[1].color + 'Q', n8: playerState[1].color + 'K', n9: playerState[1].color + 'B', n10: playerState[1].color + 'N', n11: playerState[1].color + 'R', m4: playerState[1].color + 'P', m5: playerState[1].color + 'P', m6: playerState[1].color + 'P', m7: playerState[1].color + 'P', m8: playerState[1].color + 'P', m9: playerState[1].color + 'P', m10: playerState[1].color + 'P', m11: playerState[1].color + 'P',
	};
	unmoved_pieces = position;

	var cfg = {
		draggable: true,
		position: position,
		onDragStart: onDragStart,
		onDrop: onDrop,
	};
	board = ChessBoard('board', cfg);
	updateCurrentPlayer(turn);
}

var onlineMoveDone = function(source, target) {
	var position = board.move(source + "-" + target);
	evaluateMove(source, target, position[target], position);
}

var onDragStart = function(source, piece, position, orientation) {
	if (gameEnded) return false;
	if (playerState[turn % 4].color !== piece[0]) return false;
	if (websocket_state() === 1 && playerColor !== piece[0]) return false;	// if online and its not the user's turn
	removeHighlights();
	removeGreySquares();
	
	selectedSquare = source;
	highlight(source);

	var moves = validMoves(position, source);
	for (var i in moves) greySquare(moves[i]);
};

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
	if (source !== target) {
		removeGreySquares();
		removeHighlights();
		selectedSquare = null;
	}

	var oldPosTarget = oldPos[target] ? oldPos[target] : ' ';
	if ( !(validMoves(oldPos, source).includes(target)) // is not a legal move
		) return 'snapback';

	evaluateMove(source, target, piece, newPos);
	// if online, send move to server
	if (websocket_state() === 1) {
		websocket_makeMove(source + "-" + target);
	}
};

function evaluateMove(source, target, piece, newPos) {
	if (piece[1] === 'K') {
		playerState[getPlayerByColor(piece[0])].kingPos = target;
		// castles
		if (unmoved_pieces[source]) {
			currentPieceOwner = getPlayerByColor(piece[0]);
			// kingside castle
			if (right(right(source)) === target) {
				alert("moving rook");
				board.move(right(target) + "-" + right(source));
				delete unmoved_pieces[right(target)];
			}
			// queenside castle
			else if (left(left(source)) === target) {
				alert("moving rook");
				board.move(left(left(target)) + "-" + left(source));
				delete unmoved_pieces[left(left(target))];
			}
			currentPieceOwner = null;
		}
	}
	// Pawn promotion
	else if (piece[1] === 'P') {
		switch (turn % 4) {
			case 0: {
				if (target[1] === '8') board.promoteDraggedPiece();
			} break;
			case 1: {
				if (target[0] === 'g') board.promoteDraggedPiece();
			} break;
			case 2: {
				if (target[1] === '7') board.promoteDraggedPiece();
			} break;
			case 3: {
				if (target[0] === 'h') board.promoteDraggedPiece();
			} break;
		}
	}

	delete unmoved_pieces[source];

	addMoveToMoveList(target);
	turn++;
	updateCurrentPlayer(turn % 4);

	// calculate all checks
	removeCheckHighlights();
	playerState = calculateInChecks(newPos);
	for (var state in playerState) {
		if (playerState[state].inCheck) {
			alert ("is in check");
			kingcheck(playerState[state].kingPos);
			
			var allmoves;
			for (var i in newPos) {
				allmoves += validMoves(newPos, i);
			}
			alert(JSON.stringify(allmoves));

			if (isCheckmate(newPos, playerState[state].color)) {
				alert("is also checkmate!")
				checkmate(state);
			}
		}
	}

	while (playerState[turn % 4].checkMate) {
		addMoveToMoveList("");
		turn++;
		updateCurrentPlayer(turn % 4);
	}
}

function checkmate(player) {
	if (gameEnded) return;
	playerState[player].checkMate = true;
	board.changePlayerPiecesColor(playerState[player].color, 'c');
	removeCheckHighlight(playerState[player].kingPos);
}

function getPlayerByColor(color) {
	var i = playerState.length;
	while (i--) {
		if (playerState[i].color === color) return i;
	}
}

function previousPlayer(player) {
	var prev = player - 1;
	if (prev === -1) prev = 3;
	return prev;
}

function nextPlayer(player) {
	return (player + 1) % 4;
}

function squareUp(square) {
	if (!square) return;
	var number = Number(square.substr(1, square.length));
	if (number === 14) return;
	return square[0] + (number+1);
}

function squareDown(square) {
	if (!square) return;
	var number = Number(square.substr(1, square.length));
	if (number === 1) return;
	return square[0] + (number-1);
}

function squareLeft(square) {
	if (!square || square[0] === 'a') return;
	var number = Number(square.substr(1, square.length));
	return String.fromCharCode(square.charCodeAt(square[0]) - 1) + number;
}

function squareRight(square) {
	if (!square || square[0] === 'n') return;
	var number = Number(square.substr(1, square.length));
	return String.fromCharCode(square.charCodeAt(square[0]) + 1) + number;
}

function deepCopy(thing) {
	return JSON.parse(JSON.stringify(thing));
}