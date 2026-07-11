package com.techlab.ecommerce.controller.dto;

import lombok.Data;

@Data
public class PedidoUpdateRequest {
  private String nombreCliente;
  private String estado;
}
