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
	private ObjectMapper JSONmapper = new ObjectMapper();

	public static void main(String args[]) throws InterruptedException, IOException {
		int port = 8887; // 843 flash policy port
		try {
			if (args.length > 0) port = Integer.parseInt(args[0]);

			Server s = new Server(port);
			//s.setWebSocketFactory(new DefaultSSLWebSocketServerFactory(SSLgenerator.generate()));

			System.out.println("Starting server on port: " + s.getPort());
			s.start();
		} catch (Exception ex) {
			ex.printStackTrace();
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
	}

	@Override
	public void onClose(WebSocket conn, int code, String reason, boolean remote) {
		try {
			messageHandler.onRoomLeave(conn);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	@Override
	public void onMessage(WebSocket conn, ByteBuffer message) { }

	@Override
	public void onMessage(WebSocket conn, String message) {
		try {
			messageHandler.onMessage(conn, message);
		} catch (Exception ex) {
			ex.printStackTrace();
			conn.send(ex.toString());
		}
	}

	@Override
	public void onError(WebSocket conn, Exception ex) {
		ex.printStackTrace();
		if (conn != null) {
			// some errors like port binding failed may not be assignable to a specific websocket
		}
	}

	@Override
	public void onStart() {
		System.out.println("Server started!");
		setConnectionLostTimeout(100);
	}
}