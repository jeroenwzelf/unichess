var OnlineGameServer = {
	connect: function(server) {
		OnlineGameServer.websocket = new WebSocket("ws://" + server.endpoint + ":" + server.port);

		OnlineGameServer.websocket.onopen = function() {
			ServerListUI.setConnectedToServer(server);
		};

		OnlineGameServer.websocket.onmessage = function(event) { 
			WebSocketMessageHandler.process(event.data);
		};

		OnlineGameServer.websocket.onclose = function(event) {
			if (event.code === 1006)
				alert("Failed connecting to server.");
			delete OnlineGameServer.onlineuser;
			ServerListUI.setDisconnectedToServer(server);
		};
	},

	disconnect: function() {
		if (!OnlineGameServer.websocket) return;
		OnlineGameServer.websocket.close();
		for (var i=0; i<4; ++i) {
			$("#name" + playerToString(i)).removeClass("loading");
			$("#name" + playerToString(i)).text('\u274E');
			$("#move" + playerToString(i)).tooltip('dispose');
		}
		gameEnded = true;
		delete OnlineGameServer.websocket;
	},

	state: function() {
		if (!OnlineGameServer.websocket) return;
		return OnlineGameServer.websocket.readyState;
	},

	makeMove: function(move) {
		if (!OnlineGameServer.websocket) return;
		var JSONmove = '{"function":"makeMove", "argument":"' + move + '", "uniqueUsername":"' + OnlineGameServer.onlineuser.uniqueUsername + '"}';
		OnlineGameServer.websocket.send(JSONmove);
	},

	sendChat: function(message) {
		if (!OnlineGameServer.websocket) return;
		var JSONmessage = '{"function":"chat", "argument":"' + message + '", "uniqueUsername":"' + OnlineGameServer.onlineuser.uniqueUsername + '"}';
		OnlineGameServer.websocket.send(JSONmessage);
	}
};

var WebSocketMessageHandler = {
	process: function(JSONmessage) {
		var message = JSON.parse(JSONmessage);
		switch (message.function) {
			case "assignPlayer": WebSocketMessageHandler.assignPlayer(message.argument); break;
			case "playerConnected": WebSocketMessageHandler.playerConnected(message.argument); break;
			case "playerDisconnected": WebSocketMessageHandler.playerDisconnected(message.player); break;
			case "gameStateChange": WebSocketMessageHandler.gameStateChanged(message.argument); break;
			case "makeMove": WebSocketMessageHandler.move(message.argument, message.player); break;
			case "chat": WebSocketMessageHandler.chat(message.argument, message.player); break;
			default: alert("Unsupported function: " + message.function);
		}
	},

	assignPlayer: function(player) {
		OnlineGameServer.onlineuser = JSON.parse(player);

		playerColor = playerState[OnlineGameServer.onlineuser.color].color;
		var playerColorName = playerToString(parseInt(OnlineGameServer.onlineuser.color));
		uniqueUsername = OnlineGameServer.onlineuser.uniqueUsername;

		$("#serverinfolog").append('\u2705' + " You (" + OnlineGameServer.onlineuser.hostname + ") connected to the server as " + uniqueUsername + "</br>");
		$("#name" + playerColorName).removeClass("loading");
		$("#move" + playerColorName).tooltip({
			title: OnlineGameServer.onlineuser.uniqueUsername.split("@")[0]
		});
		$("#move" + playerColorName).data('uniqueUsername', OnlineGameServer.onlineuser.uniqueUsername.split("@")[0]);
		
		$("#name" + playerColorName).text('\u2705' + " You");
		board.orientation(playerColorName);
	},

	playerConnected: function(player) {
		var clientInfo = JSON.parse(player);

		// Broadcasted message about you joining the gameRoom
		if (OnlineGameServer.onlineuser && clientInfo.color == OnlineGameServer.onlineuser.color)
			return;

		var playerColorName = playerToString(parseInt(clientInfo.color));

		$("#serverinfolog").append('\u2705 ' + clientInfo.uniqueUsername + " connected to the server as " + playerColorName + "</br>");
		$("#name" + playerColorName).text('\u2705');
		$("#name" + playerColorName).removeClass("loading");
		$("#move" + playerColorName).tooltip({
			title: clientInfo.uniqueUsername
		});
		$("#move" + playerColorName).data('uniqueUsername', clientInfo.uniqueUsername);
	},

	playerDisconnected: function(player) {
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
	},

	gameStateChanged: function(state) {
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
	},

	move: function(move, player) {
		// Broadcasted message about the move you made
		if (player === OnlineGameServer.onlineuser.color) return;

		var squares = move.split("-");
		chessboard_do_move(squares[0], squares[1]);
	},

	joinRoom: function(username) {
		var JSONmove = '{"function":"joinRoom", "argument":"' + username + '"}';
		OnlineGameServer.websocket.send(JSONmove);
	},

	chat: function(message, player) {
		onNewChatMessage(decodeURI(message), player);
	}
};