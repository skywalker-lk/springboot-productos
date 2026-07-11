package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CarritoItemRequest {

  @NotNull(message = "El id del producto es obligatorio")
  @Min(value = 1, message = "El id del producto debe ser mayor que cero")
  private Integer productoId;

  @NotNull(message = "La cantidad es obligatoria")
  @Min(value = 1, message = "La cantidad debe ser mayor que cero")
  private Integer cantidad;
}
