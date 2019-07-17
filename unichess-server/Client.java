import java.io.IOException;

import org.java_websocket.WebSocket;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

public class Client {
	public WebSocket _connection;
	private String _username;
	private String _id;
	private int _color;

	private ObjectMapper JSONmapper = new ObjectMapper();

	public Client(WebSocket connection, String username, String id) {
		_connection = connection;
		_username = username;
		_id = id;
	}

	public String getHostname() throws IOException {
		if (!_connection.isOpen())
			throw new IOException("WebSocket hostname is not available.");

		return _connection.getRemoteSocketAddress().getAddress().getHostAddress();
	}

	public String getUsername() {
		return _username;
	}

	public String getUniqueUsername() {
		return _username + "@" + _id;
	}

	public int getColor() {
		return _color;
	}

	public void setColor(int color) {
		_color = color;
	}

	public String getId() {
		return _id;
	}

	public boolean equals(String user) {
		return user.equals(getUniqueUsername());
	}

	public String toJSONString() throws IOException, JsonProcessingException {
		ClientResource clientResource = new ClientResource(getHostname(), getUniqueUsername(), _color);
		return JSONmapper.writeValueAsString(clientResource);
	}
}