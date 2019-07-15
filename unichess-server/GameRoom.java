import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;

public class GameRoom {
	private Server server;
	private String players[] = new String[4];
	private ObjectMapper JSONmapper = new ObjectMapper();

	boolean inProgress = false;
	int turn = 0;

	public GameRoom(Server s) {
		server = s;
	}

	public void removePlayer(String hostname) {
		int player = playerWithHostname(hostname);
		if (player == -1)
			return;

		players[player] = null;

		// If there is either 1 or no player in the room, end the game
		if (playerCount() < 2)
			endGame();
	}

	public int newPlayer(String hostname) throws IllegalStateException {
		for (int i=0; i<4; ++i) {
			if (players[i] == null) {
				players[i] = new String(hostname);

				if (i == 3) startGame();
				return i;
			}
		}
		throw new IllegalStateException("Room is already full!");
	}

	public boolean moveRequest(String hostname, String move) throws Exception {
		if (!inProgress)
			throw new Exception("Game is not in progress.");

		if (playerWithHostname(hostname) != turn % 4)
			throw new Exception("It is not your turn.");

		if (!isValidMove(move))
			throw new Exception("Argument does not contain valid squares.");

		nextTurn();
		return true;
	}

	private void nextTurn() {
		while (players[(++turn) % 4] == null);
	}

	private boolean isValidMove(String move) throws IllegalArgumentException {
		if (!move.contains("-"))
			throw new IllegalArgumentException(move + " does not contain '-'.");

		String[] squares = move.split("-");

		if (squares.length != 2)
			throw new IllegalArgumentException(move + " is not in the form of 'square-square'");

		return isValidSquare(squares[0]) && isValidSquare(squares[1]);
	}

	private boolean isValidSquare(String square) {
		if (!square.matches("^[a-n](1[0-4]|[1-9])$"))	// [a-n][1-14]
			return false;

		if (square.matches("[a-c|l-n](1[2-4]|[1-3])$"))	// corners
			return false;

		return true;
	}

	public int playerWithHostname(String hostname) {
		for (int i=0; i<4; ++i) {
			if (players[i] != null && players[i].equals(hostname))
				return i;
		}
		return -1;
	}

	private int playerCount() {
		int count = 0;
		for (int i=0; i<4; ++i)
			if (players[i] != null) ++count;
		return count;
	}

	private void startGame() {
		if (inProgress) return;
		inProgress = true;

		try {
			Message message = new Message();
			message.function = "gameStateChange";
			message.argument = "started";
			server.broadcast(JSONmapper.writeValueAsString(message));
		} catch (Exception e) {
			System.out.println(e);
		}
	}

	private void endGame() {
		if (!inProgress) return;
		inProgress = false;

		try {
			Message message = new Message();
			message.function = "gameStateChange";
			message.argument = "ended";
			server.broadcast(JSONmapper.writeValueAsString(message));
		} catch (Exception e) {
			System.out.println(e);
		}
	}
}