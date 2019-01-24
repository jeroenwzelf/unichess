var currentPieceOwner;

function up(square) {
	switch(currentPieceOwner) {
		case 0: return squareUp(square);
		case 1: return squareLeft(square);
		case 2: return squareDown(square);
		case 3: return squareRight(square);
	}
}

function down(square) {
	switch(currentPieceOwner) {
		case 0: return squareDown(square);
		case 1: return squareRight(square);
		case 2: return squareUp(square);
		case 3: return squareLeft(square);
	}
}

function left(square) {
	switch(currentPieceOwner) {
		case 0: return squareLeft(square);
		case 1: return squareDown(square);
		case 2: return squareRight(square);
		case 3: return squareUp(square);
	}
}

function right(square) {
	switch(currentPieceOwner) {
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
	if (typeof piece !== 'undefined') {
		// valid moves for specific pieces
		moves = validMovesForPiece(position, source);
		var i = moves.length;
		while (i--) {
			var target = position[moves[i]];
			if (	(!board.validMove(source + '-' + moves[i]))	// remove moves that go out of bounds
				||  (typeof target !== 'undefined' && target[0] === piece[0]) // remove moves that go to friendlies
				||  (!preventsCheck(position, source, moves[i])) // remove moves that don't prevent the check
				) moves.splice(i, 1);
		}
	}
	return moves;
}

function isCheckmate(position, color) {
	for (var i in position) {
		if (validMoves(position, position[i]).length > 0) return false;
	}
	return true;
}

function isEnemyOf(piece, enemy) {
	if (!enemy || !piece) return;
	return (enemy[0] !== piece[0]);
}

function calculateInChecks(position) {
	var newPlayerState = deepCopy(playerState);
	for (var state in newPlayerState)
		newPlayerState[state].inCheck = false;
	// search for checks
	for (var square in position) {
		var moves = validMovesForPiece(position, square);
		var i = moves.length;
		while (i--) {
			var move = moves[i];
			// check if this move would take any king
			for (var player = 0; player < 4; player++) {
				var attackingPiece = position[square];
				var king = position[newPlayerState[player].kingPos];
				if (attackingPiece[0] !== king[0] && position[move] === king) {
					newPlayerState[player].inCheck = true;
				}
			}
		}
	}
	return deepCopy(newPlayerState);
}

function preventsCheck(position, source, target) {
	// do move
	var newPos = deepCopy(position);
	delete newPos[source];
	newPos[target] = position[source];
	var oldMovedPieces = deepCopy(moved_pieces);
	var oldPlayerState = deepCopy(playerState);
	if (position[source][1] === 'K') playerState[getPlayerByColor(position[source][0])].kingPos = target;

	// check if this results in being checked
	var newPlayerState = calculateInChecks(newPos);

	// revert to old state
	moved_pieces = deepCopy(oldMovedPieces);
	playerState = deepCopy(oldPlayerState);
	return (!newPlayerState[turn % 4].inCheck);
}

function validMovesForPiece(position, source) {
	var moves = [];
	var piece = position[source];
	currentPieceOwner = getPlayerByColor(piece[0]);
	switch (piece[1]) {
		case "P": moves.push.apply(moves, pawn(position, source)); break;
		case "N": moves.push.apply(moves, knight(position, source)); break;
		case "K": moves.push.apply(moves, king(position, source)); break;
		case "Q":
		case "B": moves.push.apply(moves, bishop(position, source)); if (piece[1] === "B") break;
		case "R": moves.push.apply(moves, rook(position, source)); break;
	}
	currentPieceOwner = null;
	return moves;
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
	if (isEnemyOf(position[source], position[takeLeft])) moves.push(takeLeft);
	// take enemy on the right
	var takeRight = right(forwardMove);
	if (isEnemyOf(position[source], position[takeRight])) moves.push(takeRight);

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
	moves.push(downMove);
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
	while (!foundEnemy && typeof upMove !== 'undefined' && (typeof position[upMove] === 'undefined' || isEnemyOf(position[source], position[upMove]))) {
		if (isEnemyOf(position[source], position[upMove])) foundEnemy = true;
		moves.push(upMove);
		upMove = up(left(upMove));
	}

	foundEnemy = false;
	var downMove = down(right(source));
	while (!foundEnemy && typeof downMove !== 'undefined' && (typeof position[downMove] === 'undefined' || isEnemyOf(position[source], position[downMove]))) {
		if (isEnemyOf(position[source], position[downMove])) foundEnemy = true;
		moves.push(downMove);
		downMove = down(right(downMove));
	}

	foundEnemy = false;
	var leftMove = left(down(source));
	while (!foundEnemy && typeof leftMove !== 'undefined' && (typeof position[leftMove] === 'undefined' || isEnemyOf(position[source], position[leftMove]))) {
		if (isEnemyOf(position[source], position[leftMove])) foundEnemy = true;
		moves.push(leftMove);
		leftMove = left(down(leftMove));
	}

	foundEnemy = false;
	var rightMove = right(up(source));
	while (!foundEnemy && typeof rightMove !== 'undefined' && (typeof position[rightMove] === 'undefined' || isEnemyOf(position[source], position[rightMove]))) {
		if (isEnemyOf(position[source], position[rightMove])) foundEnemy = true;
		moves.push(rightMove);
		rightMove = right(up(rightMove));
	}	

	return moves;
}

function rook(position, source) {
	var moves = [];
	
	var foundEnemy = false;
	var upMove = up(source);
	while (!foundEnemy && typeof upMove !== 'undefined' && (typeof position[upMove] === 'undefined' || isEnemyOf(position[source], position[upMove]))) {
		if (isEnemyOf(position[source], position[upMove])) foundEnemy = true;
		moves.push(upMove);
		upMove = up(upMove);
	}

	foundEnemy = false;
	var downMove = down(source);
	while (!foundEnemy && typeof downMove !== 'undefined' && (typeof position[downMove] === 'undefined' || isEnemyOf(position[source], position[downMove]))) {
		if (isEnemyOf(position[source], position[downMove])) foundEnemy = true;
		moves.push(downMove);
		downMove = down(downMove);
	}

	foundEnemy = false;
	var leftMove = left(source);
	while (!foundEnemy && typeof leftMove !== 'undefined' && (typeof position[leftMove] === 'undefined' || isEnemyOf(position[source], position[leftMove]))) {
		if (isEnemyOf(position[source], position[leftMove])) foundEnemy = true;
		moves.push(leftMove);
		leftMove = left(leftMove);
	}

	foundEnemy = false;
	var rightMove = right(source);
	while (!foundEnemy && typeof rightMove !== 'undefined' && (typeof position[rightMove] === 'undefined' || isEnemyOf(position[source], position[rightMove]))) {
		if (isEnemyOf(position[source], position[rightMove])) foundEnemy = true;
		moves.push(rightMove);
		rightMove = right(rightMove);
	}

	return moves;
}