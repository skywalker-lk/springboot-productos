package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lombok.Data;

@Data
public class PedidoRequest {
  @NotNull(message = "El nombre del cliente es obligatorio")
  private String nombreCliente;

  @NotEmpty(message = "Debe enviar al menos un producto en el pedido")
  private List<@Positive(message = "El id del producto debe ser mayor que cero") Integer>
      idsProducto;

  @NotEmpty(message = "Debe enviar cantidades para el pedido")
  private List<@Positive(message = "La cantidad debe ser mayor que cero") Integer> cantidades;

  private Integer usuarioId;

  private String codigoCupon;
}
