package com.techlab.ecommerce.exception;

public class TokenExpiradoException extends RuntimeException {

  public TokenExpiradoException(String message) {
    super(message);
  }
}
