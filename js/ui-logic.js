function init_moveList() {
	var moveList = $('#MovesDiv');
	moveList.empty();
	var html = '<div id="table">' +
					'<div class="header-row row HideOnMicroWidth">' +
						'<span class="cell primary">' +
							'<img src="img/chesspieces/wikipedia/wK.png" class="HideOnSmallWidth" style="width: 100%; visibility: hidden;"></img>' +
							'<span>#</span>' +
						'</span>' +
						'<span class="cell" id="moveWhite">' +
							'<img src="img/chesspieces/wikipedia/wK.png" style="width: 100%;"></img>' +
							'<span class="HideOnSmallWidth">White</span>' +
						'</span>' +
						'<span class="cell" id="moveIvory">' +
							'<img src="img/chesspieces/wikipedia/iK.png" style="width: 100%;"></img>' +
							'<span class="HideOnSmallWidth">Ivory</span>' +
						'</span>' +
						'<span class="cell" id="moveBlack">' +
							'<img src="img/chesspieces/wikipedia/bK.png" style="width: 100%;"></img>' +
							'<span class="HideOnSmallWidth">Black</span>' +
						'</span>' +
						'<span class="cell" id="moveOak">' +
							'<img src="img/chesspieces/wikipedia/aK.png" style="width: 100%;"></img>' +
							'<span class="HideOnSmallWidth">Oak</span>' +
						'</span>' +
					'</div>' +
					'<div class="row HideOnSmallWidth">' +
						'<span class="cell primary"></span>' +
						'<span class="cell" id="nameWhite" style="padding:0;"></span>' +
						'<span class="cell" id="nameIvory" style="padding:0;"></span>' +
						'<span class="cell" id="nameBlack" style="padding:0;"></span>' +
						'<span class="cell" id="nameOak" style="padding:0;"></span>' +
					'</div>'
				'</div>';
	moveList.append(html);
	$('#move' + playerToString(turn%4)).css("background-color", "");
}

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

function updateCurrentPlayer(player) {
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
	squareEl.addClass('highlight-check');
}

var removeCheckHighlights = function() {
	$('#board .square-55d63').removeClass('highlight-check');
}

var removeCheckHighlight = function(square) {
	$('#board .square-' + square).removeClass('highlight-check');
}

var removeGreySquares = function() {
  $('#board .square-55d63').css('background', '');
  $('.available-move-square').removeClass('available-move-square');
};

var greySquare = function(square) {
  var squareEl = $('#board .square-' + square);

  squareEl.addClass('available-move-square');

  var background = '#c0ad90';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#906c4f';
  }

  squareEl.css('background', background);
};

function playerToString(player) {
	switch (player) {
		case 0: return 'White';
		case 1: return 'Ivory';
		case 2: return 'Black';
		case 3: return 'Oak';
	}
}