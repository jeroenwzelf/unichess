import java.io.IOException;
import java.lang.IllegalArgumentException;

import org.java_websocket.WebSocket;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

public class MessageHandler {
	private Server server;
	private GameRoom gameRoom;
	private ObjectMapper JSONmapper = new ObjectMapper();

	public MessageHandler(Server s) {
		server = s;
		gameRoom = new GameRoom(s);
	}

	public void onMessage(WebSocket connection, String jsonmessage) throws JsonProcessingException, IllegalArgumentException, IOException {
		Message message = JSONmapper.readValue(jsonmessage, Message.class);

		switch (message.function) {
			case "joinRoom":
				onRoomJoin(connection, message.argument);
				break;
			case "getPlayerCount":
				getPlayerCount(connection);
				break;
			case "getGameState":
				getGameState(connection);
				break;
			case "makeMove":
				makeMove(message.uniqueUsername, message.argument);
				break;
			case "chat":
				chat(message.argument, message.uniqueUsername);
				break;
			default: throw new IllegalArgumentException("invalid function.");
		}
	}

	public void onRoomJoin(WebSocket connection, String username) {
		try {
			// Send already connected players
			for (var client : gameRoom.getAllPlayers())
				connection.send(JSONmapper.writeValueAsString(Message.playerConnectedResponse(client)));

			// Make the client a player
			Client player = gameRoom.newPlayer(connection, username);

			// Let the client know it has become a player
			connection.send(JSONmapper.writeValueAsString(Message.assignPlayerResponse(player)));

			// Broadcast new player to other players
			server.broadcast(JSONmapper.writeValueAsString(Message.playerConnectedResponse(player)));
		} catch (Exception ex) {
			System.out.println(ex);
			connection.close(1011, ex.toString());
		}
	}

	public void onRoomLeave(WebSocket connection) throws JsonProcessingException {
		gameRoom.removePlayer(connection);
	}

	private void getPlayerCount(WebSocket connection) throws JsonProcessingException {
		connection.send(JSONmapper.writeValueAsString(Message.getPlayerCountResponse(gameRoom.playerCount())));
	}

	private void getGameState(WebSocket connection) throws JsonProcessingException {
		Message response;
		if (gameRoom.getInProgress())
			response = Message.gameStateStartedResponse();
		else response = Message.gameStateEndedResponse();
		
		connection.send(JSONmapper.writeValueAsString(response));
	}

	private void makeMove(String uniqueUsername, String move) throws IllegalArgumentException, JsonProcessingException {
		gameRoom.makeMove(uniqueUsername, move);
	}

	private void chat(String message, String uniqueUsername) throws IllegalArgumentException, JsonProcessingException {
		server.broadcast(JSONmapper.writeValueAsString(Message.chatResponse(message, gameRoom.getPlayer(uniqueUsername))));
	}
}