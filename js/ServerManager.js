/* UI */

var ServerListUI = {
	addServer: function(server) {
		$('#serverList').append(
			"<li id=server" + server.port + ">" +
			"	<div>" +
			"		<span id=server_status" + server.port + " class='fa fa-circle'></span>" +
			"		<h2 style='margin: 0'>Unitron Server @" + server.port +"</h2>" +
			"		<p id=server_playerCount" + server.port +">--</p>" +
			"		<p>&nbsp;/ 4 &nbsp;</p>" +
			"		<button id=server_button" + server.port + " href='javascript:void(0);' class=connectbutton disabled>Connect</button>" +
			"	</div>" +
			"</li>"
		);

		$('#server_button' + server.port).click(function(e) {
			var username = $('#username');
			if (!username.val() || username.val().length >= 18) {
				username.tooltip({
					title: "Please input a username first (max 18 characters)"
				}).mouseover();
			}
			else {
				if (OnlineGameServer.state() === 1) OnlineGameServer.disconnect();
				else OnlineGameServer.connect(server);
			}
		});
	},

	removeServer: function(server) {
		$('#server' + server.port).remove();
	},

	setServerStatus: function(server, color) {
		$('#server_status' + server.port).css("color", color);
	},

	setServerPlayerCount: function(server, playerCount) {
		$('#server_playerCount' + server.port).text(playerCount);
	},

	setServerButtonDisabled: function(server, disabled) {
		$('#server_button' + server.port).prop('disabled', disabled);
	},

	setServerButtonDisconnect: function(server) {
		$('#server_button' + server.port).val('Disconnect');
	},

	setServerButtonConnect: function(server) {
		$('#server_button' + server.port).val('Connect');
	},

	setConnectedToServer: function(server) {
		ServerManager.clean();
		ServerManager.add_server(server);

		$('#username').prop('disabled', true);
		$("#serverinfowaitingforplayers").show();

		$("#server_button" + server.port).text("Disconnect");

		$("#serverconnectbutton").text("Disconnect");
		$('#socketconnectionbutton').css("color", "green");
		$('#socketconnectiontext').text("connected");

		WebSocketMessageHandler.joinRoom($('#username').val());
		initialize();
		gameEnded = true;
		$("#serverinfoconnected").text('\u2705' + "  Connected to Unitron Server @" + server.port);
		for (var i=0; i<4; ++i) $("#name" + playerToString(i)).addClass("loading");
		this.setServerButtonDisconnect(server);

		$('#chatwindowpanel').removeClass("chatClosed");
	},

	setDisconnectedToServer: function() {
		ServerManager.initialize();

		$('#username').prop('disabled', false);
		clearChatMessages();

		$("#serverconnectbutton").text("Connect");
		$('#socketconnectionbutton').css("color", "red");
		$('#socketconnectiontext').text("not connected");

		$("#serverinfolog").empty();
		$("#serverinfoconnected").empty();
		$("#serverinfowaitingforplayers").hide();


		$('#chatwindowpanel').addClass("chatClosed");
	}
}

/* Logic */

function Server(endpoint, port) {
	this.endpoint = endpoint;
	this.port = port;
	this.websocket = {};

	this.start_peeking_loop = function(_this) {
		return function() {
			if (_this.websocket && _this.websocket.readyState === 1) {
				_this.websocket.send('{"function":"getPlayerCount"}');
				_this.websocket.send('{"function":"getGameState"}');
				setTimeout(function() { _this.start_peeking_loop(); }, 1000);
			}
		}
	}(this);

	this.init_websocket = function(_this) {
		return function() {
			_this.websocket = new WebSocket("ws://" + _this.endpoint + ":" + _this.port);
			ServerListUI.setServerStatus(_this, "orange");

			_this.websocket.onopen = function() {
				ServerManager.serverGotConnection(_this);
			};

			_this.websocket.onmessage = function(event) {
				var message = JSON.parse(event.data);
				switch(message.function) {
					case "getPlayerCount":
						ServerManager.serverPlayerCountUpdate(_this, message.player);
						break;
					case "gameStateChange":
						ServerManager.serverGameStateUpdate(_this, message.argument);
						break;
				}
			};

			_this.websocket.onclose = function(event) {
				ServerManager.serverLostConnection(_this, event);
			};
		}
	}(this);

	websocket = this.init_websocket();
	return this;
}

var ServerManager = {
	servers: [],

	initialize: function() {
		ServerManager.clean();

		ServerManager.add_server(new Server("116.203.95.75", 8887));
		ServerManager.add_server(new Server("116.203.95.75", 8889));
	},

	clean: function() {
		while (ServerManager.servers.length > 0)
			ServerManager.remove_server(ServerManager.servers[0]);
	},

	add_server: function(server) {
		ServerManager.servers.push(server);
		ServerListUI.addServer(server);
	},

	remove_server: function(server) {
		server.websocket.close();
		ServerManager.servers.splice(ServerManager.servers.indexOf(server), 1);
		ServerListUI.removeServer(server);
	},

	serverGotConnection: function(server) {
		ServerListUI.setServerStatus(server, "green");
		server.start_peeking_loop();
	},

	serverLostConnection: function(server) {
		ServerListUI.setServerStatus(server, "red");
		setTimeout(function() { server.init_websocket(); }, 2000);
	},

	serverPlayerCountUpdate: function(server, playerCount) {
		ServerListUI.setServerPlayerCount(server, playerCount);
	},

	serverGameStateUpdate: function(server, gameState) {
		switch (gameState) {
			case "started": 
				ServerListUI.setServerButtonDisabled(server, true);
				break;
			case "ended":
				ServerListUI.setServerButtonDisabled(server, false);
				break;
		}
	}
};