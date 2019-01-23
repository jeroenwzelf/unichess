function addMoveToMoveList(move) {
	var player = turn % 4;
	if (player === 0) {
		var html = 
		'<div class="row">' +
			'<span class="cell primary" data-label="Move">' + turn / 4 + '</span>' +
			'<span class="cell" data-label="' + playerToString(0) + '"></span>' +
			'<span class="cell" data-label="' + playerToString(1) + '"></span>' +
			'<span class="cell" data-label="' + playerToString(2) + '"></span>' +
			'<span class="cell" data-label="' + playerToString(3) + '"></span>' +
		'</div>';
		$('#table').append(html);

	}
	var cell = $('#table div:last-child span[data-label="' + playerToString(player) + '"]');
	var html = cell.html();
	html = html.substring(0, html.length - 7);
	html += move + '</span>';
	cell.empty();
	cell.append(html);
}

function updateCurrrentPlayer(player) {
	var previousCell = $('#move' + playerToString(previousPlayer(player)));
	var cell = $('#move' + playerToString(player));

	previousCell.css("background-color", "");
	cell.css("background-color", "#666");
}

var removeHighlights = function() {
	$('#board .square-55d63').removeClass('highlight-' + (turn % 4));
}

var highlight = function(square) {
	var squareEl = $('#board .square-' + square);
	squareEl.addClass('highlight-' + (turn % 4));
}

var kingcheck = function(square) {
	var squareEl = $('#board .square-' + square);
	squareEl.addClass('highlight-king');
}

var removeKingCheck = function(square) {
	var squareEl = $('#board .square-' + square);
	squareEl.removeClass('highlight-king');	
}

var removeGreySquares = function() {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
  var squareEl = $('#board .square-' + square);

  var background = '#c0ad90';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#906c4f';
  }

  squareEl.css('background', background);
};

function playerToString(player) {
	switch (player) {
		case 0: return 'White';
		case 1: return 'Red';
		case 2: return 'Black';
		case 3: return 'Green';
	}
}