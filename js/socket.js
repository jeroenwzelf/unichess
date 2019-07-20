var endpoint = "116.203.95.75";
var port = "8887";

var onlineuser;

var polling;
var peekconnection;
var connection;

function websocket_start_peek() {
	websocket_stop_peek();

	if (peekconnection) peekconnection.close();
	peekconnection = new WebSocket("ws://" + endpoint + ":" + port);
	
	peekconnection.onopen = function() {
		polling = true;
		$('#serverconnectionbutton').css("color", "orange");
		continuous_peek();
	};

	peekconnection.onclose = function(event) {
		polling = false;
		if (event.code === 1006)
			$('#serverconnectionbutton').css("color", "red");
		else $('#serverconnectionbutton').css("color", "orange");
		$('#serverplayercount').text("--");
		$('#serverconnectbutton').prop('disabled', false);
	};

	peekconnection.onmessage = function(event) { 
		$('#serverconnectionbutton').css("color", "green");
		var message = JSON.parse(event.data);
		switch (message.function) {
			case "getPlayerCount": {
				if (message.player < 4) $('#serverconnectbutton').prop('disabled', false);
				else $('#serverconnectbutton').prop('disabled', true);
				$('#serverplayercount').text(message.player);
			} break;
			case "getGameState": {
				var connectbutton = $('#serverconnectbutton');
				switch (message.argument) {
					case "started":
						if (!onlineuser) {
							connectbutton.prop('disabled', true);
							connectbutton.tooltip({
								title: "A game is still in progress!"
							});
						}
						break;
					case "ended":
						connectbutton.prop('disabled', false);
						connectbutton.tooltip('dispose');
						break;
				}
			} break;
		}
	};
}

function continuous_peek() {
	if (peekconnection) {
		peekconnection.send('{"function":"getPlayerCount"}');
		peekconnection.send('{"function":"getGameState"}');
	}
	if (polling)
		setTimeout(function() { continuous_peek(); }, 1000);
}

function websocket_stop_peek() {
	if (peekconnection)
		peekconnection.close();
}

function websocket_connect() {
	connection = new WebSocket("ws://" + endpoint + ":" + port);

	connection.onopen = function() {
		messagehandler_joinRoom($('#username').val());
		initialize();
		gameEnded = true;
		$("#serverinfoconnected").text('\u2705' + "  Connected to Unitron Server #1");
		socket_set_status_connected(true);

		for (var i=0; i<4; ++i) $("#name" + playerToString(i)).addClass("loading");
	};

	connection.onmessage = function(event) { 
		messagehandler_process(event.data);
	};

	connection.onclose = function(event) {
		if (event.code === 1006)
			alert("Failed connecting to server.");
		socket_set_status_connected(false);
		delete onlineuser;

		$('#chatwindowpanel').addClass("chatClosed");
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
	var JSONmove = '{"function":"makeMove", "argument":"' + move + '", "uniqueUsername":"' + onlineuser.uniqueUsername + '" }';
	connection.send(JSONmove);
}

function messagehandler_process(JSONmessage) {
	var message = JSON.parse(JSONmessage);
	switch (message.function) {
		case "assignPlayer": messagehandler_assignPlayer(message.argument); break;
		case "playerConnected": messagehandler_playerConnected(message.argument); break;
		case "playerDisconnected": messagehandler_playerDisconnected(message.player); break;
		case "gameStateChange": messagehandler_gameStateChanged(message.argument); break;
		case "makeMove": messagehandler_move(message.argument, message.player); break;
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
	
	$("#name" + playerColorName).text('\u2705' + " You");
	board.orientation(playerColorName);

	$('#chatwindowpanel').removeClass("chatClosed");
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
	onlineMoveDone(squares[0], squares[1]);
}

function messagehandler_joinRoom(username) {
	var JSONmove = '{"function":"joinRoom", "argument":"' + username + '"}';
	connection.send(JSONmove);	
}