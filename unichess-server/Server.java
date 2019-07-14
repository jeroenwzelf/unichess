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

public class Server extends WebSocketServer {
	private MessageHandler messageHandler = new MessageHandler(this);
	private HashMap<WebSocket, String> connections = new HashMap();

	public static void main(String args[]) throws InterruptedException, IOException {
		int port = 8887; // 843 flash policy port
		try {
			port = Integer.parseInt(args[0]);
		} catch (Exception ex) { }

		Server s = new Server(port);
		System.out.println("Starting server on port: " + s.getPort());
		s.start();

		BufferedReader sysin = new BufferedReader(new InputStreamReader(System.in));
		while (true) {
			String in = sysin.readLine();
			s.broadcast(in);
			if (in.equals("exit")) {
				s.stop(1000);
				break;
			}
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
			conn.send("Welcome to the server. You are player " + messageHandler.onNewConnection(connections.get(conn)) + "!");
		} catch (IllegalStateException ex) {
			conn.send(ex.toString());
		}
	}

	@Override
	public void onClose(WebSocket conn, int code, String reason, boolean remote) {
		String hostname = connections.get(conn);
		connections.remove(conn);

		messageHandler.onCloseConnection(hostname);
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