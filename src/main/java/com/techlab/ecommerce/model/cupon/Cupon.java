package com.techlab.ecommerce.model.cupon;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cupones")
@Getter
@Setter
@NoArgsConstructor
public class Cupon {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @Column(nullable = false, unique = true, length = 50)
  private String codigo;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TipoDescuento tipo;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal valorDescuento;

  @Column(precision = 10, scale = 2)
  private BigDecimal montoMinimo;

  private LocalDate fechaExpiracion;

  @Column(nullable = false)
  private Integer usosMaximos;

  @Column(nullable = false)
  private Integer usosActuales = 0;

  @Column(nullable = false)
  private Boolean activo = true;

  @Column(nullable = false)
  private LocalDate createdAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDate.now();
    if (this.usosActuales == null) this.usosActuales = 0;
    if (this.activo == null) this.activo = true;
  }

  public Cupon(String codigo, TipoDescuento tipo, BigDecimal valorDescuento, Integer usosMaximos) {
    this.codigo = codigo;
    this.tipo = tipo;
    this.valorDescuento = valorDescuento;
    this.usosMaximos = usosMaximos;
  }

  public boolean isExpirado() {
    return fechaExpiracion != null && LocalDate.now().isAfter(fechaExpiracion);
  }

  public boolean isAgotado() {
    return usosActuales >= usosMaximos;
  }

  public BigDecimal calcularDescuento(BigDecimal montoPedido) {
    if (tipo == TipoDescuento.PORCENTAJE) {
      return montoPedido.multiply(valorDescuento).divide(BigDecimal.valueOf(100));
    }
    return valorDescuento.compareTo(montoPedido) > 0 ? montoPedido : valorDescuento;
  }
}
