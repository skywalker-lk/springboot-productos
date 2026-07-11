package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteRequest {

  @NotNull(message = "El ID del producto es obligatorio")
  @Min(value = 1, message = "El ID del producto debe ser mayor que cero")
  private Integer productoId;

  @NotNull(message = "El nuevo stock es obligatorio")
  @Min(value = 0, message = "El stock no puede ser negativo")
  private Integer nuevoStock;

  @NotBlank(message = "El motivo del ajuste es obligatorio")
  private String motivo;
}
