var connection;

function websocket_connect(endpoint) {
	if ("WebSocket" in window) {
		connection = new WebSocket("ws://" + endpoint);

		connection.onopen = function() {
			initialize();
			socket_set_status_connected(true);
		};

		connection.onmessage = function(event) { 
			messagehandler_process(event.data);
		};

		connection.onclose = function(event) {
			if (event.code === 1006)
				alert("Connecting to websocket failed.");
			socket_set_status_connected(false);
		};
	}
	else alert('WebSocket is not supported on this browser!');
}

function websocket_disconnect() {
	connection.close();
}

function websocket_state() {
	if (connection == null) return 0;
	return connection.readyState;
}

function websocket_move(move) {
	var JSONmove = '{"function":"move", "argument":"' + move + '"}';
	connection.send(JSONmove);
}

function messagehandler_process(JSONmessage) {
	var message = JSON.parse(JSONmessage);
	switch (message.function) {
		case "newPlayer": messagehandler_newPlayer(message.argument); break;
		case "move": messagehandler_move(message.argument); break;
		default: alert("Unsupported function: " + message.function);
	}
}

function messagehandler_newPlayer(player) {
	playerColor = playerState[player].color;
}

function messagehandler_move(move) {
	var squares = move.split("-");

	// Check if move was done by yourself
	var cell = $('#table div:last-child span[data-label="' + playerToString(getPlayerByColor(playerColor)) + '"]');
	if (cell.html() !== squares[1])
		onlineMoveDone(squares[0], squares[1]);
}