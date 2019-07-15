import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

// Generate your own keystore with
//		keytool -genkey -keyalg RSA -validity 3650 -keystore "keystore.jks" -storepass "storepassword" -keypass "keypassword" -alias "default" -dname "CN=127.0.0.1, OU=MyOrgUnit, O=MyOrg, L=MyCity, S=MyRegion, C=MyCountry"
public class SSLgenerator {
	private static String STORETYPE = "JKS";
	private static String KEYSTORE = "keystore.jks";
	private static String STOREPASSWORD = "storepassword";
	private static String KEYPASSWORD = "keypassword";

	public static SSLContext generate() throws Exception {
		System.out.println("a");
		KeyStore ks = KeyStore.getInstance(STORETYPE);
		File kf = new File(KEYSTORE);
		ks.load(new FileInputStream(kf), STOREPASSWORD.toCharArray());

		System.out.println("b");

		KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
		kmf.init(ks, STOREPASSWORD.toCharArray());
		TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
		tmf.init(ks);

		System.out.println("c");

		SSLContext sslContext = null;
		sslContext = SSLContext.getInstance("TLS");
		sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

		return sslContext;
	}
}