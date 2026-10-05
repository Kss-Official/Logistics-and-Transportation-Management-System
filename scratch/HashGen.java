import java.security.SecureRandom;
import java.util.Base64;

public class HashGen {
    public static void main(String[] args) {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        System.out.println("BCrypt for Gudi@450: " + encoder.encode("Gudi@450"));
    }
}
