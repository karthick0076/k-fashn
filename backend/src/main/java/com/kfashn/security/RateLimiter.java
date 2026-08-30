package com.kfashn.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiter {
    private final ConcurrentHashMap<String, Integer> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lockouts = new ConcurrentHashMap<>();

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    public boolean isAllowed(String key) {
        if (lockouts.containsKey(key)) {
            if (System.currentTimeMillis() - lockouts.get(key) > LOCKOUT_DURATION) {
                lockouts.remove(key);
                attempts.remove(key);
                return true;
            }
            return false;
        }
        return true;
    }

    public void recordFailedAttempt(String key) {
        int currentAttempts = attempts.getOrDefault(key, 0) + 1;
        attempts.put(key, currentAttempts);
        if (currentAttempts >= MAX_ATTEMPTS) {
            lockouts.put(key, System.currentTimeMillis());
        }
    }

    public void recordSuccessfulAttempt(String key) {
        attempts.remove(key);
        lockouts.remove(key);
    }
}
