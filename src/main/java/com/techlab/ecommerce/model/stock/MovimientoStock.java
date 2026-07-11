package com.techlab.ecommerce.model.stock;

import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.model.usuarios.Usuario;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "movimientos_stock")
@Getter
@Setter
@NoArgsConstructor
public class MovimientoStock {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "producto_id", nullable = false)
  @ToString.Exclude
  private Producto producto;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id")
  @ToString.Exclude
  private Usuario usuario;

  @Enumerated(EnumType.STRING)
  private TipoMovimiento tipo;

  private int cantidad;
  private int stockAnterior;
  private int stockPosterior;
  private String motivo;
  private Integer pedidoId;
  private LocalDateTime fecha;

  public MovimientoStock(
      Producto producto,
      TipoMovimiento tipo,
      int cantidad,
      int stockAnterior,
      int stockPosterior,
      String motivo,
      Usuario usuario,
      Integer pedidoId) {
    this.producto = producto;
    this.tipo = tipo;
    this.cantidad = cantidad;
    this.stockAnterior = stockAnterior;
    this.stockPosterior = stockPosterior;
    this.motivo = motivo;
    this.usuario = usuario;
    this.pedidoId = pedidoId;
    this.fecha = LocalDateTime.now();
  }
}
