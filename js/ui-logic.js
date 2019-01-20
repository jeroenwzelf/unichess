function addMoveToMoveList(move) {
	var player = turn % 4;
	if (player === 0) {
		var html = 
		'<div class="row">' +
			'<span class="cell primary" data-label="Move">' + turn / 4 + '</span>' +
			'<span class="cell" data-label="White"></span>' +
			'<span class="cell" data-label="Red"></span>' +
			'<span class="cell" data-label="Black"></span>' +
			'<span class="cell" data-label="Green"></span>' +
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

function playerToString(player) {
	switch (player) {
		case 0: return 'White';
		case 1: return 'Red';
		case 2: return 'Black';
		case 3: return 'Green';
	}
}