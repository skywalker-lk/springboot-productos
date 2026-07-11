package com.techlab.ecommerce.exception;

/**
 * Excepción personalizada que se lanza cuando se intenta crear un pedido con una cantidad inválida
 * (por ejemplo, cero o negativa).
 *
 * <p>Hereda de RuntimeException (no chequeada) para mantener la consistencia con las demás
 * excepciones del dominio.
 */
public class CantidadInvalidaException extends RuntimeException {

  public CantidadInvalidaException(String mensaje) {
    super(mensaje);
  }
}
