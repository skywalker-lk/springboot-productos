package com.techlab.ecommerce.controller.dto;

import com.techlab.ecommerce.model.pedidos.Pedido;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoListResponse {
  private long total;
  private List<Pedido> pedidos;
}
