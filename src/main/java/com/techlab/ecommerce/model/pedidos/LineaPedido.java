package com.techlab.ecommerce.model.pedidos;

import com.techlab.ecommerce.model.productos.Producto;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "lineas_pedido")
@Getter
@Setter
@NoArgsConstructor
public class LineaPedido {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "producto_id", nullable = false)
  @ToString.Exclude
  private Producto producto;

  private String descripcion;
  private int cantidad;

  @Column(precision = 10, scale = 2)
  private BigDecimal precioUnitario;

  @Column(precision = 10, scale = 2)
  private BigDecimal subtotal;

  private String estado;

  public LineaPedido(int cantidad, Producto producto) {
    this.producto = producto;
    this.descripcion = producto.getNombre();
    this.cantidad = cantidad;
    this.precioUnitario = producto.getPrecio();
    this.subtotal = BigDecimal.valueOf(cantidad).multiply(precioUnitario);
    this.estado = "Pendiente";
  }
}
