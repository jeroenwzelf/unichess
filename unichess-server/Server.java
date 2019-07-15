import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.util.HashMap;

import org.java_websocket.WebSocket;
import org.java_websocket.WebSocketImpl;
import org.java_websocket.framing.Framedata;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.java_websocket.server.DefaultSSLWebSocketServerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

public class Server extends WebSocketServer {
	private MessageHandler messageHandler = new MessageHandler(this);
	private HashMap<WebSocket, String> connections = new HashMap<WebSocket, String>();
	private ObjectMapper JSONmapper = new ObjectMapper();

	public static void main(String args[]) throws InterruptedException, IOException {
		int port = 8887; // 843 flash policy port
		try {
			System.out.println("q");
			if (args.length > 0) port = Integer.parseInt(args[0]);

			System.out.println("p");
			Server s = new Server(port);
			s.setWebSocketFactory(new DefaultSSLWebSocketServerFactory(SSLgenerator.generate()));

			System.out.println("Starting server on port: " + s.getPort());
			s.start();
		} catch (Exception ex) {
			System.out.println(ex);
		}
	}

	public Server(int port) throws UnknownHostException {
		super(new InetSocketAddress(port));
	}

	public Server(InetSocketAddress address) {
		super(address);
	}

	@Override
	public void onOpen(WebSocket conn, ClientHandshake handshake) {
		connections.put(conn, conn.getRemoteSocketAddress().getAddress().getHostAddress());
		System.out.println(connections.get(conn) + " entered the room!");

		try {
			Message response = new Message();
			response.function = "assignPlayer";
			response.argument = String.valueOf(messageHandler.onNewConnection(connections.get(conn)));

			conn.send(JSONmapper.writeValueAsString(response));

			response.function = "playerConnected";
			response.argument = response.argument.concat("-" + connections.get(conn));
			broadcast(JSONmapper.writeValueAsString(response));
		} catch (Exception ex) {
			conn.send(ex.toString());
		}
	}

	@Override
	public void onClose(WebSocket conn, int code, String reason, boolean remote) {
		String hostname = connections.get(conn);
		connections.remove(conn);

		try {
			messageHandler.onCloseConnection(hostname);
		} catch (Exception ex) {
			System.out.println(ex.toString());
		}
		System.out.println(hostname + " has left the room!");
	}

	@Override
	public void onMessage(WebSocket conn, String message) {
		String hostname = conn.getRemoteSocketAddress().getAddress().getHostAddress();
		System.out.println(hostname + ": " + message);
		try {
			messageHandler.onMessage(hostname, message);
		} catch (Exception ex) {
			System.out.println(ex);
			conn.send(ex.toString());
		}
	}

	@Override
	public void onMessage(WebSocket conn, ByteBuffer message) {
		//broadcast(message.array());
		//System.out.println(conn + ": " + message);
	}

	@Override
	public void onError(WebSocket conn, Exception ex) {
		ex.printStackTrace();
		if (conn != null) {
			// some errors like port binding failed may not be assignable to a specific websocket
			System.out.println(connections.get(conn) + ": " + ex);
		}
	}

	@Override
	public void onStart() {
		System.out.println("Server started!");
		setConnectionLostTimeout(100);
	}
}