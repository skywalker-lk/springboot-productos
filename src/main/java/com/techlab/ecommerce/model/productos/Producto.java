package com.techlab.ecommerce.model.productos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.techlab.ecommerce.model.categorias.Categoria;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Modelo de dominio: representa un producto del catálogo. Entidad base para la herencia con Comida
 * y Bebida (SINGLE_TABLE).
 */
@Entity
@Table(name = "productos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_producto", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public class Producto {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @Column(nullable = false)
  private String nombre;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal precio;

  @Column(precision = 10, scale = 2)
  private BigDecimal precioBase;

  private Integer porcentajeIVA = 21;

  private Integer descuentoCantidad = 0;

  private Integer descuentoPorcentaje = 0;

  @Column(nullable = false)
  private Integer stock;

  @Column(name = "img")
  private String img;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_categoria")
  @ToString.Exclude
  private Categoria categoria;

  public Producto(String nombre, BigDecimal precio, int stock, Categoria categoria) {
    this.nombre = nombre;
    this.precio = precio;
    this.precioBase = precio;
    this.stock = stock;
    this.categoria = categoria;
  }

  public BigDecimal getPrecioBase() {
    return precioBase;
  }

  public Integer getPorcentajeIVA() {
    return porcentajeIVA != null ? porcentajeIVA : 21;
  }

  public void setPorcentajeIVA(Integer iva) {
    this.porcentajeIVA = (iva != null && iva >= 0) ? iva : 21;
    if (precioBase != null) {
      this.precio =
          precioBase
              .multiply(BigDecimal.valueOf(1 + this.porcentajeIVA / 100.0))
              .setScale(2, java.math.RoundingMode.HALF_UP);
    }
  }

  public void setPrecioBase(BigDecimal base) {
    this.precioBase = base;
    if (base != null && porcentajeIVA != null) {
      this.precio =
          base.multiply(BigDecimal.valueOf(1 + porcentajeIVA / 100.0))
              .setScale(2, java.math.RoundingMode.HALF_UP);
    }
  }

  @JsonProperty("_id")
  public Integer getId() {
    return id;
  }

  @Override
  public String toString() {
    return "ID: "
        + id
        + " | "
        + nombre
        + " | $"
        + (precio != null ? precio.toPlainString() : "0")
        + " | Base: $"
        + (precioBase != null ? precioBase.toPlainString() : "0")
        + " | IVA: "
        + getPorcentajeIVA()
        + "%"
        + " | Stock: "
        + stock
        + " | Categoría: "
        + (categoria != null ? categoria.getNombre() : "sin categoría");
  }
}
