package com.techlab.ecommerce.controller.dto;

import java.math.BigDecimal;
import lombok.Data;

/** DTO para cada producto en una importación masiva. */
@Data
public class ImportacionProductoRequest {

  private String nombre;
  private BigDecimal precio;
  private int stock;
  private String categoria;
}
