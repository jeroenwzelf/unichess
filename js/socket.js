var onlineuser;
var connection;

function websocket_connect(server) {
	connection = new WebSocket("ws://" + server.endpoint + ":" + server.port);

	connection.onopen = function() {
		ServerListUI.setConnectedToServer(server);
	};

	connection.onmessage = function(event) { 
		messagehandler_process(event.data);
	};

	connection.onclose = function(event) {
		if (event.code === 1006)
			alert("Failed connecting to server.");
		delete onlineuser;
		ServerListUI.setDisconnectedToServer(server);
	};
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

function websocket_makeMove(move) {
	var JSONmove = '{"function":"makeMove", "argument":"' + move + '", "uniqueUsername":"' + onlineuser.uniqueUsername + '"}';
	connection.send(JSONmove);
}

function websocket_sendChat(message) {
	var JSONmessage = '{"function":"chat", "argument":"' + message + '", "uniqueUsername":"' + onlineuser.uniqueUsername + '"}';
	connection.send(JSONmessage);
}

function messagehandler_process(JSONmessage) {
	var message = JSON.parse(JSONmessage);
	switch (message.function) {
		case "assignPlayer": messagehandler_assignPlayer(message.argument); break;
		case "playerConnected": messagehandler_playerConnected(message.argument); break;
		case "playerDisconnected": messagehandler_playerDisconnected(message.player); break;
		case "gameStateChange": messagehandler_gameStateChanged(message.argument); break;
		case "makeMove": messagehandler_move(message.argument, message.player); break;
		case "chat": messagehandler_chat(message.argument, message.player); break;
		default: alert("Unsupported function: " + message.function);
	}
}

function messagehandler_assignPlayer(player) {
	onlineuser = JSON.parse(player);

	playerColor = playerState[onlineuser.color].color;
	var playerColorName = playerToString(parseInt(onlineuser.color));
	uniqueUsername = onlineuser.uniqueUsername;

	$("#serverinfolog").append('\u2705' + " You (" + onlineuser.hostname + ") connected to the server as " + uniqueUsername + "</br>");
	$("#name" + playerColorName).removeClass("loading");
	$("#move" + playerColorName).tooltip({
		title: onlineuser.uniqueUsername.split("@")[0]
	});
	$("#move" + playerColorName).data('uniqueUsername', onlineuser.uniqueUsername.split("@")[0]);
	
	$("#name" + playerColorName).text('\u2705' + " You");
	board.orientation(playerColorName);
}

function messagehandler_playerConnected(player) {
	var clientInfo = JSON.parse(player);

	// Broadcasted message about you joining the gameRoom
	if (onlineuser && clientInfo.color == onlineuser.color)
		return;

	var playerColorName = playerToString(parseInt(clientInfo.color));

	$("#serverinfolog").append('\u2705 ' + clientInfo.uniqueUsername + " connected to the server as " + playerColorName + "</br>");
	$("#name" + playerColorName).text('\u2705');
	$("#name" + playerColorName).removeClass("loading");
	$("#move" + playerColorName).tooltip({
		title: clientInfo.uniqueUsername
	});
	$("#move" + playerColorName).data('uniqueUsername', clientInfo.uniqueUsername);
}

function messagehandler_playerDisconnected(player) {
	var playerName = playerToString(parseInt(player));
	$("#name" + playerName).text('\u274E');
	$("#move" + playerName).tooltip('dispose');

	$("#serverinfolog").append('\u274E ' + playerName + " disconnected.</br>");

	if ((turn % 4) === parseInt(player)) {
		while (playerState[turn % 4].checkMate) {
			addMoveToMoveList("");
			turn++;
			updateCurrentPlayer(turn % 4);
		}
	}

	disconnect_checkmate(parseInt(player));
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
			alert("Game has ended!");
			$("#serverinfolog").append("<b>Game ended.</b></br>");
		} break;
	}
}

function messagehandler_move(move, player) {
	// Broadcasted message about the move you made
	if (player === onlineuser.color) return;

	var squares = move.split("-");
	chessboard_do_move(squares[0], squares[1]);
}

function messagehandler_joinRoom(username) {
	var JSONmove = '{"function":"joinRoom", "argument":"' + username + '"}';
	connection.send(JSONmove);	
}

function messagehandler_chat(message, player) {
	onNewChatMessage(decodeURI(message), player);
}