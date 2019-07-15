import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;

public class MessageHandler {
	private Server server;
	private GameRoom gameRoom;
	private ObjectMapper JSONmapper = new ObjectMapper();

	public MessageHandler(Server s) {
		server = s;
		gameRoom = new GameRoom(s);
	}

	public String[] getAllPlayers() {
		return gameRoom.getAllPlayers();
	}

	public int onNewConnection(String hostname) {
		return gameRoom.newPlayer(hostname);
	}

	public void onCloseConnection(String hostname) throws Exception {
		Message response = new Message();
		response.function = "playerDisconnected";
		response.argument = String.valueOf(gameRoom.playerWithHostname(hostname));

		gameRoom.removePlayer(hostname);
		server.broadcast(JSONmapper.writeValueAsString(response));
	}

	public void onMessage(String hostname, String jsonmessage) throws Exception {
		Message message = JSONmapper.readValue(jsonmessage, Message.class);

		switch (message.function) {
			case "move":
				functionMove(hostname, message.argument);
				server.broadcast(jsonmessage);	// Let other players know a move has been made
				break;
			case "serverInfo":
				functionServerInfo(hostname, message.argument);
				break;
			default: throw new IllegalArgumentException("invalid function.");
		}
	}

	private void functionMove(String hostname, String argument) throws Exception {
		if (!gameRoom.moveRequest(hostname, argument))
			throw new Exception("The move was invalid.");
	}

	private void functionServerInfo(String hostname, String argument) throws Exception {

	}
}