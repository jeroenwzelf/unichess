function up(square) {
	switch(turn) {
		case 0: return squareUp(square);
		case 1: return squareLeft(square);
		case 2: return squareDown(square);
		case 3: return squareRight(square);
	}
}

function down(square) {
	switch(turn) {
		case 0: return squareDown(square);
		case 1: return squareRight(square);
		case 2: return squareUp(square);
		case 3: return squareLeft(square);
	}
}

function left(square) {
	switch(turn) {
		case 0: return squareLeft(square);
		case 1: return squareDown(square);
		case 2: return squareRight(square);
		case 3: return squareUp(square);
	}
}

function right(square) {
	switch(turn % 4) {
		case 0: return squareRight(square);
		case 1: return squareUp(square);
		case 2: return squareLeft(square);
		case 3: return squareDown(square);
	}
}

function validMoves(position, source) {
	if (position[source] === null) return [];
	switch (position[source][1])
	{
		case "P": return pawn(position, source);
		case "N": return pawn(position, source);
		case "Q": return pawn(position, source);
		case "B": return pawn(position, source);
		case "R": return pawn(position, source);
		case "K": return pawn(position, source);
	}
	return [];
}

function pawn(position, source) {
	var moves = [];

	var forwardMove = up(source);
	for (var i = 0; i < 2; i++) {
		if (!position[forwardMove]) moves.push(forwardMove);
		forwardMove = up(forwardMove);
	}
	return moves;
}

function knight(position, source) {

}

function queen(position, source) {
	
}

function bishop(position, source) {
	
}

function rook(position, source) {
	
}

function queen(position, source) {
	
}