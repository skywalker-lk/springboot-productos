package com.techlab.ecommerce.controller.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ValidarCuponRequest {
  private String codigo;
  private BigDecimal montoPedido;
}
