var connection;

function websocket_connect(endpoint) {
	if ("WebSocket" in window) {
		connection = new WebSocket("ws://" + endpoint);

		connection.onopen = function() {
			initialize();
			gameEnded = true;
			$("#serverinfoconnected").text('\u2705' + "  Connected to " + connection.url);
			socket_set_status_connected(true);

			for (var i=0; i<4; ++i) $("#name" + playerToString(i)).addClass("loading");
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
	for (var i=0; i<4; ++i) {
		$("#name" + playerToString(i)).removeClass("loading");
		$("#name" + playerToString(i)).text('\u274E');
		$("#move" + playerToString(i)).tooltip('dispose');
	}
	gameEnded = true;
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
		case "assignPlayer": messagehandler_assignPlayer(message.argument); break;
		case "playerConnected": messagehandler_playerConnected(message.argument); break;
		case "playersConnected": messagehandler_playersConnected(message.argument); break;
		case "playerDisconnected": messagehandler_playerDisconnected(message.argument); break;
		case "gameStateChange": messagehandler_gameStateChanged(message.argument); break;
		case "move": messagehandler_move(message.argument); break;
		default: alert("Unsupported function: " + message.function);
	}
}

function messagehandler_assignPlayer(player) {
	var playerName = playerToString(parseInt(player));
	
	playerColor = playerState[player].color;
	$("#name" + playerName).text('\u2705' + " You");
	board.orientation(playerName);

	$("#serverinfolog").append('\u2705' + " You connected to the server as " + playerName + "</br>");
	$("#name" + playerName).removeClass("loading");
	$("#move" + playerName).tooltip({
		title: document.getElementById('localipaddress').textContent
	});
}

function messagehandler_playerConnected(player) {
	var connection = player.split("-");
	if (playerColor === playerState[connection[0]].color) return;	// when a user joins, he gets a broadcast message too
	alert(player);

	var connectionColor = playerToString(parseInt(connection[0]));
	var connectionHostname = connection[1];

	$("#serverinfolog").append('\u2705 ' + connectionHostname + " connected to the server as " + connectionColor + "</br>");
	$("#name" + connectionColor).text('\u2705');
	$("#name" + connectionColor).removeClass("loading");
	$("#move" + connectionColor).tooltip({
		title: connectionHostname
	});
}

function messagehandler_playersConnected(players) {
	var playerList = JSON.parse(players);
	for (var i=0; i<4; ++i) {
		if (playerList[i]) messagehandler_playerConnected(i + "-" + playerList[i]);
	}
}

function messagehandler_playerDisconnected(player) {
	var playerName = playerToString(parseInt(player));
	$("#name" + playerName).text('\u274E');
	$("#move" + playerName).tooltip('dispose');

	$("#serverinfolog").append('\u274E ' + playerName + " disconnected.</br>");
}

function messagehandler_gameStateChanged(state) {
	switch (state) {
		case "started": { 
			gameEnded = false;
			$("#serverinfolog").append("<b>Game started!</b></br>");
			$("#serverinfowaitingforplayers").hide();
		} break;
		case "ended": {
			gameEnded = true;
			$("#serverinfolog").append("<b>Game ended.</b></br>");
		} break;
	}
}

function messagehandler_move(move) {
	var squares = move.split("-");

	// Check if move was done by yourself (after doing a move, it gets broadcasted to yourself too)
	var cell = $('#table div:last-child span[data-label="' + playerToString(getPlayerByColor(playerColor)) + '"]');
	if (cell.html() !== squares[1])
		onlineMoveDone(squares[0], squares[1]);
}