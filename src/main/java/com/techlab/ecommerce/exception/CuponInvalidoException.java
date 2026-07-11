package com.techlab.ecommerce.exception;

public class CuponInvalidoException extends RuntimeException {
  public CuponInvalidoException(String mensaje) {
    super(mensaje);
  }
}
