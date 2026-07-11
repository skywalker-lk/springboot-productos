package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class PrecioUpdateRequest {

  @NotNull(message = "El id del producto es obligatorio")
  @NotNull(message = "El id del producto debe ser mayor que cero")
  private Integer id;

  @NotNull(message = "El precio nuevo es obligatorio")
  @DecimalMin(value = "0.01", message = "El precio debe ser mayor que cero")
  private BigDecimal precioNuevo;
}
