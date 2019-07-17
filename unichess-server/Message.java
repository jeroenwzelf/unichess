import java.io.IOException;

public class Message {
	public String function;
	public String argument;

	public String uniqueUsername;
	public int player;

	public Message(String _function, String _argument, String _uniqueUsername, int _player) {
		function = _function;
		argument = _argument;
		uniqueUsername = _uniqueUsername;
		player = _player;
	}

	public Message(String _function, String _argument) {
		this(_function, _argument, null, 0);
	}

	public Message(String _function, String _argument, String _uniqueUsername) {
		this(_function, _argument, _uniqueUsername, 0);
	}

	public Message(String _function, String _argument, int _player) {
		this(_function, _argument, null, _player);
	}

	public Message(String _function) {
		this(_function, null, null, 0);
	}

	public Message() {
		this(null, null, null, 0);
	}

	public static Message makeMoveResponse(String move, int player) {
		return new Message("makeMove", move, player);
	}

	public static Message playerDisconnectedResponse(int player) {
		return new Message("playerDisconnected", null, player);
	}

	public static Message playerConnectedResponse(Client player) throws IOException {
		return new Message("playerConnected", player.toJSONString());
	}

	public static Message assignPlayerResponse(Client player) throws IOException {
		return new Message("assignPlayer", player.toJSONStringUnique());
	}

	public static Message getPlayerCountResponse(int playerCount) {
		return new Message("getPlayerCount", null, playerCount);
	}

	public static Message gameStateStartedResponse() {
		return new Message("gameStateChange", "started");
	}

	public static Message gameStateEndedResponse() {
		return new Message("gameStateChange", "ended");
	}
}