var board;
var turn = 0;


var position = {
	d1: 'wR',
	e1: 'wB',
	f1: 'wN',
	g1: 'wQ',
	h1: 'wK',
	i1: 'wN',
	j1: 'wB',
	k1: 'wR',
	d2: 'wP',
	e2: 'wP',
	f2: 'wP',
	g2: 'wP',
	h2: 'wP',
	i2: 'wP',
	j2: 'wP',
	k2: 'wP',

	d14: 'bR',
	e14: 'bB',
	f14: 'bN',
	g14: 'bQ',
	h14: 'bK',
	i14: 'bN',
	j14: 'bB',
	k14: 'bR',
	d13: 'bP',
	e13: 'bP',
	f13: 'bP',
	g13: 'bP',
	h13: 'bP',
	i13: 'bP',
	j13: 'bP',
	k13: 'bP',

	a4: 'gR',
	a5: 'gB',
	a6: 'gN',
	a7: 'gQ',
	a8: 'gK',
	a9: 'gN',
	a10: 'gB',
	a11: 'gR',
	b4: 'gP',
	b5: 'gP',
	b6: 'gP',
	b7: 'gP',
	b8: 'gP',
	b9: 'gP',
	b10: 'gP',
	b11: 'gP',

	n4: 'rR',
	n5: 'rB',
	n6: 'rN',
	n7: 'rQ',
	n8: 'rK',
	n9: 'rN',
	n10: 'rB',
	n11: 'rR',
	m4: 'rP',
	m5: 'rP',
	m6: 'rP',
	m7: 'rP',
	m8: 'rP',
	m9: 'rP',
	m10: 'rP',
	m11: 'rP',
};

function initialize() {
	var cfg = {
		draggable: true,
		position: position,
		onDragStart: onDragStart,
		onDrop: onDrop,
	};
	board = ChessBoard('board', cfg);
}

var onDragStart = function(source, piece, position, orientation) {
	switch (turn % 4) {
		case 0: if (piece.search(/^w/) === -1) return false; break;
		case 1: if (piece.search(/^r/) === -1) return false; break;
		case 2: if (piece.search(/^b/) === -1) return false; break;
		case 3: if (piece.search(/^g/) === -1) return false; break;
	}
};

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
	var oldPosTarget = oldPos[target] ? oldPos[target] : ' ';
	if ( (!board.validMove(source + '-' + target)) // moves are on the board
		|| (oldPos[source][0] === oldPosTarget[0]) // moves to friendly piece
		|| !(validMoves(oldPos, source).includes(target))
		) return 'snapback';
	addMoveToMoveList(target);
	turn++;
};


function squareUp(square) {
	var number = Number(square.substr(1, square.length));
	if (!square || number === 14) return;
	return square[0] + (Number(square[1])+1);
}

function squareDown(square) {
	var number = Number(square.substr(1, square.length));
	if (!square || number === 1) return;
	return square[0] + (number-1);
}

function squareLeft(square) {
	var number = Number(square.substr(1, square.length));
	if (!square || square[0] === 'a') return;
	return String.fromCharCode(square.charCodeAt(square[0]) - 1) + number;
}

function squareRight(square) {
	var number = Number(square.substr(1, square.length));
	if (!square || square[1] === 'n') return;
	return String.fromCharCode(square.charCodeAt(square[0]) + 1) + number;
}