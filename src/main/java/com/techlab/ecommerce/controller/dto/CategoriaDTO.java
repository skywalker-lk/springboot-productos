package com.techlab.ecommerce.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.techlab.ecommerce.model.categorias.Categoria;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * DTO para exponer las categorías como objetos { _id, nombre, descripcion, id }. El frontend espera
 * { _id, nombre } mínimo.
 */
@Getter
@NoArgsConstructor
public class CategoriaDTO {

  @JsonProperty("_id")
  private String tipo;

  private String nombre;
  private String descripcion;
  private Long id;

  public CategoriaDTO(Categoria categoria) {
    this.id = categoria.getId();
    this.tipo = categoria.getTipo();
    this.nombre = categoria.getNombre();
    this.descripcion = categoria.getDescripcion();
  }
}
