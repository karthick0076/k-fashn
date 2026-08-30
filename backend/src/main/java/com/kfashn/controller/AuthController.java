package com.kfashn.controller;

import com.kfashn.entity.User;
import com.kfashn.repository.UserRepository;
import com.kfashn.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.kfashn.security.RateLimiter rateLimiter;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletResponse response) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (!rateLimiter.isAllowed(email)) {
            return ResponseEntity.status(429).body(Map.of("success", false, "message", "Too many failed attempts. Try again later."));
        }

        // Temporary block to simulate signup if normal user doesn't exist
        // (The admin account will be inserted via Flyway, we won't auto-create the admin here anymore)
        if (!email.equals("kfashn84@gmail.com") && userRepository.findByEmail(email).isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setRole("ROLE_USER");
            userRepository.save(newUser);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            
            User user = userRepository.findByEmail(email).get();
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole());

            ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true)
                    .secure(true) // required for SameSite=None
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("None")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            Map<String, Object> respBody = new HashMap<>();
            respBody.put("success", true);
            respBody.put("role", user.getRole().replace("ROLE_", "").toLowerCase());
            respBody.put("email", email);

            rateLimiter.recordSuccessfulAttempt(email);
            return ResponseEntity.ok(respBody);
            
        } catch (Exception e) {
            rateLimiter.recordFailedAttempt(email);
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
