package com.techlab.ecommerce.controller.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ValidarCuponResponse {
  private String codigo;
  private BigDecimal descuento;
  private BigDecimal totalFinal;
  private boolean valido = true;
  private String mensaje;

  public ValidarCuponResponse(String codigo, BigDecimal descuento, BigDecimal totalFinal) {
    this.codigo = codigo;
    this.descuento = descuento;
    this.totalFinal = totalFinal;
  }

  public ValidarCuponResponse(String codigo, String mensaje) {
    this.codigo = codigo;
    this.valido = false;
    this.mensaje = mensaje;
  }
}
