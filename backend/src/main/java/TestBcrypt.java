import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        boolean matches = encoder.matches("kpkk7584", "$2a$10$Xm3tLz0v30zO.i8Q.u6r3u7uH3/k/v0F8b9z333/Qj79P0293J6oW");
        System.out.println("DOES MATCH: " + matches);
    }
}
