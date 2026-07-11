package com.techlab.ecommerce.model.carrito;

import com.techlab.ecommerce.model.productos.Producto;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "carrito_items")
@Getter
@Setter
@NoArgsConstructor
public class CarritoItem {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "producto_id", nullable = false)
  @ToString.Exclude
  private Producto producto;

  private int cantidad;

  @Column(precision = 10, scale = 2)
  private BigDecimal subtotal;

  public CarritoItem(Producto producto, int cantidad) {
    this.producto = producto;
    this.cantidad = cantidad;
    calcularSubtotal();
  }

  public void setCantidad(int cantidad) {
    this.cantidad = cantidad;
    calcularSubtotal();
  }

  private void calcularSubtotal() {
    this.subtotal = this.producto.getPrecio().multiply(BigDecimal.valueOf(this.cantidad));
  }
}
