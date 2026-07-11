package com.techlab.ecommerce.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {

  private final Set<String> blacklist = ConcurrentHashMap.newKeySet();

  public void invalidar(String token) {
    blacklist.add(token);
  }

  public boolean estaBlacklisted(String token) {
    return blacklist.contains(token);
  }
}
