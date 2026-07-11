package com.techlab.ecommerce.controller.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** DTO para la respuesta de listado de categorías. El frontend espera: { total, categorias } */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaListResponse {

  private int total;
  private List<CategoriaDTO> categorias;
}
