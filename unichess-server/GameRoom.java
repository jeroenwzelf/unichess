import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.TimeoutException;

import org.java_websocket.WebSocket;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

public class GameRoom {
	private Server server;

	private Client players[] = new Client[4];
	private ClientFactory clientFactory = new ClientFactory();

	private ObjectMapper JSONmapper = new ObjectMapper();

	private boolean inProgress = false;
	private int turn = 0;

	public GameRoom(Server s) {
		server = s;
	}

	public Client newPlayer(WebSocket connection, String username) throws RuntimeException, TimeoutException, IOException {
		for (int i=0; i<4; ++i) {
			if (players[i] != null)
				continue;

			players[i] = clientFactory.createClient(connection, username);
			players[i].setColor(i);
			System.out.println(players[i].getUniqueUsername() + " (" + players[i].getHostname() + ") joined.");

			// If 4th player connected
			if (i == 3) startGame();
			return players[i];
		}
		throw new RuntimeException("Room of " + getClass() + " is already full!");
	}

	public void removePlayer(WebSocket connection) throws JsonProcessingException {
		Client player = getPlayer(connection);
		if (player == null)
			return;

		clientFactory.invalidateUniqueId(player.getId());
		server.broadcast(JSONmapper.writeValueAsString(Message.playerDisconnectedResponse(player)));
		System.out.println(player.getUniqueUsername() + " left.");
		players[player.getColor()] = null;

		// If there is either 1 or no player in the room, end the game
		if (playerCount() < 2)
			endGame();
	}

	public void makeMove(String uniqueUsername, String move) throws RuntimeException, JsonProcessingException {
		if (!inProgress)
			throw new RuntimeException("Game is not in progress.");

		Client player = getPlayer(uniqueUsername);

		if (player == null)
			throw new RuntimeException("You are not playing the game.");

		if (player.getColor() != turn % 4)
			throw new RuntimeException("It is not your turn.");

		if (!isValidMove(move))
			throw new RuntimeException("Argument does not contain valid squares.");

		server.broadcast(JSONmapper.writeValueAsString(Message.makeMoveResponse(move, player.getColor())));
		nextTurn();
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

	public Client getPlayer(String uniqueUsername) {
		for (int i=0; i<4; ++i)
			if (players[i] != null && players[i].equals(uniqueUsername))
				return players[i];
		return null;
	}

	public Client getPlayer(WebSocket connection) {
		for (int i=0; i<4; ++i)
			if (players[i] != null && players[i]._connection == connection)
				return players[i];
		return null;
	}

	public List<Client> getAllPlayers() {
		List<Client> playerList = new ArrayList<Client>();

		for (Client client : players)
			if (client != null) playerList.add(client);

		return playerList;
	}

	public int playerCount() {
		int count = 0;
		for (Client client : players)
			if (client != null) ++count;

		return count;
	}

	public boolean getInProgress() {
		return inProgress;
	}

	private void startGame() {
		if (inProgress) return;
		System.out.println("Starting game...");
		inProgress = true;

		try {
			server.broadcast(JSONmapper.writeValueAsString(Message.gameStateStartedResponse()));
		} catch (Exception e) {
			System.out.println(e);
		}
	}

	private void endGame() {
		if (!inProgress) return;
		System.out.println("Game has ended!");
		inProgress = false;

		try {
			server.broadcast(JSONmapper.writeValueAsString(Message.gameStateEndedResponse()));
		} catch (Exception e) {
			System.out.println(e);
		}
	}
}