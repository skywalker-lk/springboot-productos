package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoriaRequest {

  @NotBlank(message = "El tipo de categoría no puede quedar vacío")
  private String tipo;

  @NotBlank(message = "El nombre de la categoría no puede quedar vacío")
  private String nombre;

  private String descripcion;

  private String categoria;
}
