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

	public int onNewConnection(String hostname) {
		return gameRoom.newPlayer(hostname);
	}

	public void onCloseConnection(String hostname) {
		gameRoom.removePlayer(hostname);
	}

	public void onMessage(String hostname, String jsonmessage) throws Exception {
		Message message = JSONmapper.readValue(jsonmessage, Message.class);

		switch (message.function) {
			case "move":
				functionMove(hostname, message.argument);
				server.broadcast(jsonmessage);	// Let other players know a move has been made
				break;
			default: throw new IllegalArgumentException("invalid function.");
		}
	}

	private void functionMove(String hostname, String argument) throws Exception {
		if (!gameRoom.moveRequest(hostname, argument))
			throw new Exception("The move was invalid.");
	}
}