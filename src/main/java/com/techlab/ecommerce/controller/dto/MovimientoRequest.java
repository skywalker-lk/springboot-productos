package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovimientoRequest {

  @NotNull(message = "El ID del producto es obligatorio")
  @Min(value = 1, message = "El ID del producto debe ser mayor que cero")
  private Integer productoId;

  @NotNull(message = "La cantidad es obligatoria")
  @Min(value = 1, message = "La cantidad debe ser mayor que cero")
  private Integer cantidad;

  @NotBlank(message = "El motivo es obligatorio")
  private String motivo;
}
