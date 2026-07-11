package com.techlab.ecommerce.controller.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cada producto en una actualización masiva. Solo id es obligatorio; precio y stock son
 * opcionales.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizacionMasivaRequest {

  private int id;
  private BigDecimal precio; // null = no actualizar
  private Integer stock; // null = no actualizar
}
