var board;
var turn = 0;

/*var players = [
	player1 = {
		id = 1,

	}
];*/


// starting 4 player position
var position = {
	d1: 'wR', e1: 'wN', f1: 'wB', g1: 'wQ', h1: 'wK', i1: 'wB', j1: 'wN', k1: 'wR', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP', i2: 'wP', j2: 'wP', k2: 'wP',
	d14: 'bR', e14: 'bN', f14: 'bB', g14: 'bQ', h14: 'bK', i14: 'bB', j14: 'bN', k14: 'bR', d13: 'bP', e13: 'bP', f13: 'bP', g13: 'bP', h13: 'bP', i13: 'bP', j13: 'bP', k13: 'bP',
	a4: 'gR', a5: 'gN', a6: 'gB', a7: 'gQ', a8: 'gK', a9: 'gB', a10: 'gN', a11: 'gR', b4: 'gP', b5: 'gP', b6: 'gP', b7: 'gP', b8: 'gP', b9: 'gP', b10: 'gP', b11: 'gP',
	n4: 'rR', n5: 'rN', n6: 'rB', n7: 'rQ', n8: 'rK', n9: 'rB', n10: 'rN', n11: 'rR', m4: 'rP', m5: 'rP', m6: 'rP', m7: 'rP', m8: 'rP', m9: 'rP', m10: 'rP', m11: 'rP',
};

var moved_pieces = position;

function initialize() {
	var cfg = {
		draggable: true,
		position: position,
		onDragStart: onDragStart,
		onDrop: onDrop,
	};
	board = ChessBoard('board', cfg);
	updateCurrrentPlayer(turn);
}

var onDragStart = function(source, piece, position, orientation) {
	var moves = validMoves(position, source);
	if (moves.length === 0) return false;
	for (var i=0; i < moves.length; i++) {
		greySquare(moves[i]);
	}
};

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
	removeGreySquares();
	var oldPosTarget = oldPos[target] ? oldPos[target] : ' ';
	if ( (!board.validMove(source + '-' + target)) // moves are on the board
		|| (oldPos[source][0] === oldPosTarget[0]) // moves to friendly piece
		|| !(validMoves(oldPos, source).includes(target)) // is not a legal move
		) return 'snapback';

	delete moved_pieces[source];

	addMoveToMoveList(target);
	turn++;
	updateCurrrentPlayer(turn % 4);
};

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