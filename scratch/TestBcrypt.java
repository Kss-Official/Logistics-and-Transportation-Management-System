import org.springframework.security.crypto.bcrypt.BCrypt;

public class TestBcrypt {
    public static void main(String[] args) {
        String managerHash = BCrypt.hashpw("Manager@2026!", BCrypt.gensalt(10));
        String adminHash = BCrypt.hashpw("Admin@PrimeRoute2026!", BCrypt.gensalt(10));
        String driverHash = BCrypt.hashpw("Driver@2026!", BCrypt.gensalt(10));
        String customerHash = BCrypt.hashpw("Customer@123", BCrypt.gensalt(10));

        System.out.println("MANAGER_HASH:" + managerHash);
        System.out.println("ADMIN_HASH:" + adminHash);
        System.out.println("DRIVER_HASH:" + driverHash);
        System.out.println("CUSTOMER_HASH:" + customerHash);
    }
}
