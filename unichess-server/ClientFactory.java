import java.io.Serializable;
import java.util.concurrent.TimeoutException;
import java.util.Random;
import java.util.Set;
import java.util.HashSet;

import org.java_websocket.WebSocket;

public class ClientFactory implements Serializable {
	private Set<String> uniqueIds = new HashSet<String>();

	public Client createClient(WebSocket connection, String username) throws TimeoutException {
		return new Client(connection, username, generateUniqueId());
	}
	
	/* -- Random id generation using base62 -- */

	private Random random = new Random();
	private char[] base62chars = 
		("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").toCharArray();

	private String generateBase62Id() {
		var sb = new StringBuilder(8);
		for (int i=0; i<8; ++i)
			sb.append(base62chars[random.nextInt(62)]);

		return sb.toString();
	}

	private String generateUniqueId() throws TimeoutException {
		for (int i=0; i<65536; ++i) {
			String id = generateBase62Id();

			if (uniqueIds.add(id))
				return id;
		}

		throw new TimeoutException(getClass().toString() + " took too long to generate a unique id.");
	}

	public void invalidateUniqueId(String id) {
		uniqueIds.remove(id);
	}
}