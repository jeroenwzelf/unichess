function up(square) {
	switch(turn % 4) {
		case 0: return squareUp(square);
		case 1: return squareLeft(square);
		case 2: return squareDown(square);
		case 3: return squareRight(square);
	}
}

function down(square) {
	switch(turn % 4) {
		case 0: return squareDown(square);
		case 1: return squareRight(square);
		case 2: return squareUp(square);
		case 3: return squareLeft(square);
	}
}

function left(square) {
	switch(turn % 4) {
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
	var moves = [];

	// there has to be a piece at source
	var piece = position[source];
	if (piece !== null) {
		// piece has to be from current player
		switch (turn % 4) {
			case 0: if (piece.search(/^w/) === -1) return moves; break;
			case 1: if (piece.search(/^r/) === -1) return moves; break;
			case 2: if (piece.search(/^b/) === -1) return moves; break;
			case 3: if (piece.search(/^g/) === -1) return moves; break;
		}

		// valid moves for specific pieces
		switch (piece[1]) {
			case "P": moves.push.apply(moves, pawn(position, source)); break;
			case "N": moves.push.apply(moves, knight(position, source)); break;
			case "K": moves.push.apply(moves, king(position, source)); break;
			case "Q":
			case "B": moves.push.apply(moves, bishop(position, source)); if (piece[1] === "B") break;
			case "R": moves.push.apply(moves, rook(position, source)); break;
		}

		var i = moves.length;
		while (i--) {
			var target = position[moves[i]];
			// remove moves that go out of bounds
			if (!board.validMove(source + '-' + moves[i])) moves.splice(i, 1);
			// remove moves that go to friendlies
			else if (typeof target !== 'undefined' && target[0] === piece[0]) moves.splice(i, 1);
		}
	}
	return moves;
}

function isEnemy(square) {
	if (!square) return;
	switch (turn % 4) {
		case 0: if (square[0] === 'w') return false; break;
		case 1: if (square[0] === 'r') return false; break;
		case 2: if (square[0] === 'b') return false; break;
		case 3: if (square[0] === 'g') return false; break;
	}
	return true;
}

function pawn(position, source) {
	var moves = [];

	// pawn forward
	var forwardMove = up(source);
	if (!position[forwardMove]) moves.push(forwardMove);
	// pawn double forward on first move
	if (moved_pieces[source]) {
		var doubleForwardMove = up(forwardMove);
		if (!position[doubleForwardMove]) moves.push(doubleForwardMove);
	}

	// take enemy on the left
	var takeLeft = left(forwardMove);
	if (isEnemy(position[takeLeft])) moves.push(takeLeft);
	// take enemy on the right
	var takeRight = right(forwardMove);
	if (isEnemy(position[takeRight])) moves.push(takeRight);

	// en passent
	return moves;
}

function knight(position, source) {
	var moves = [];

	var upMove = up(source);
	moves.push(left(left(upMove)));
	moves.push(right(right(upMove)));

	var upupMove = up(upMove);
	moves.push(left(upupMove));
	moves.push(right(upupMove));

	var downMove = down(source);
	moves.push(left(left(downMove)));
	moves.push(right(right(downMove)));

	var downdownMove = down(downMove);
	moves.push(left(downdownMove));
	moves.push(right(downdownMove));	

	return moves;
}

function king(position, source) {
	var moves = [];
	
	var upMove = up(source);
	moves.push(upMove);
	moves.push(left(upMove));
	moves.push(right(upMove));

	var downMove = down(source);
	moves.push(left(downMove));
	moves.push(right(downMove));

	moves.push(left(source));
	moves.push(right(source));

	return moves;
}

function bishop(position, source) {
	var moves = [];

	var foundEnemy = false;
	var upMove = up(left(source));
	while (!foundEnemy && typeof upMove !== 'undefined' && (typeof position[upMove] === 'undefined' || isEnemy(position[upMove]))) {
		if (isEnemy(position[upMove])) foundEnemy = true;
		moves.push(upMove);
		upMove = up(left(upMove));
	}

	foundEnemy = false;
	var downMove = down(right(source));
	while (!foundEnemy && typeof downMove !== 'undefined' && (typeof position[downMove] === 'undefined' || isEnemy(position[downMove]))) {
		if (isEnemy(position[downMove])) foundEnemy = true;
		moves.push(downMove);
		downMove = down(right(downMove));
	}

	foundEnemy = false;
	var leftMove = left(down(source));
	while (!foundEnemy && typeof leftMove !== 'undefined' && (typeof position[leftMove] === 'undefined' || isEnemy(position[leftMove]))) {
		if (isEnemy(position[leftMove])) foundEnemy = true;
		moves.push(leftMove);
		leftMove = left(down(leftMove));
	}

	foundEnemy = false;
	var rightMove = right(up(source));
	while (!foundEnemy && typeof rightMove !== 'undefined' && (typeof position[rightMove] === 'undefined' || isEnemy(position[rightMove]))) {
		if (isEnemy(position[rightMove])) foundEnemy = true;
		moves.push(rightMove);
		rightMove = right(up(rightMove));
	}	

	return moves;
}

function rook(position, source) {
	var moves = [];
	
	var foundEnemy = false;
	var upMove = up(source);
	while (!foundEnemy && typeof upMove !== 'undefined' && (typeof position[upMove] === 'undefined' || isEnemy(position[upMove]))) {
		if (isEnemy(position[upMove])) foundEnemy = true;
		moves.push(upMove);
		upMove = up(upMove);
	}

	foundEnemy = false;
	var downMove = down(source);
	while (!foundEnemy && typeof downMove !== 'undefined' && (typeof position[downMove] === 'undefined' || isEnemy(position[downMove]))) {
		if (isEnemy(position[downMove])) foundEnemy = true;
		moves.push(downMove);
		downMove = down(downMove);
	}

	foundEnemy = false;
	var leftMove = left(source);
	while (!foundEnemy && typeof leftMove !== 'undefined' && (typeof position[leftMove] === 'undefined' || isEnemy(position[leftMove]))) {
		if (isEnemy(position[leftMove])) foundEnemy = true;
		moves.push(leftMove);
		leftMove = left(leftMove);
	}

	foundEnemy = false;
	var rightMove = right(source);
	while (!foundEnemy && typeof rightMove !== 'undefined' && (typeof position[rightMove] === 'undefined' || isEnemy(position[rightMove]))) {
		if (isEnemy(position[rightMove])) foundEnemy = true;
		moves.push(rightMove);
		rightMove = right(rightMove);
	}

	return moves;
}