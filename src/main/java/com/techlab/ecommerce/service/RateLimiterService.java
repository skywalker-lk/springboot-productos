package com.techlab.ecommerce.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class RateLimiterService {

  private final Map<String, AttemptWindow> store = new ConcurrentHashMap<>();

  private static final int MAX_ATTEMPTS = 3;
  private static final Duration WINDOW = Duration.ofMinutes(15);

  public boolean isAllowed(String key) {
    Instant now = Instant.now();
    AttemptWindow current = store.get(key);

    if (current == null || current.windowEnd().isBefore(now)) {
      store.put(key, new AttemptWindow(1, now.plus(WINDOW)));
      return true;
    }

    if (current.count() >= MAX_ATTEMPTS) {
      return false;
    }

    store.put(key, new AttemptWindow(current.count() + 1, current.windowEnd()));
    return true;
  }

  public void reset(String key) {
    store.remove(key);
  }

  private record AttemptWindow(int count, Instant windowEnd) {}
}
