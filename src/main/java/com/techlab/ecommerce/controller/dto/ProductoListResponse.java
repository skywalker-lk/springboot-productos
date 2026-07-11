package com.techlab.ecommerce.controller.dto;

import com.techlab.ecommerce.model.productos.Producto;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** DTO para la respuesta paginada de productos. El frontend espera: { total, productos } */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProductoListResponse {

  private long total;
  private List<Producto> productos;
}
