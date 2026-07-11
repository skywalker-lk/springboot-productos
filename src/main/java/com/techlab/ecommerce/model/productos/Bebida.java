package com.techlab.ecommerce.model.productos;

import com.techlab.ecommerce.model.categorias.Categoria;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Subclase de Producto para categoria bebidas. */
@Entity
@DiscriminatorValue("BEBIDA")
@Getter
@Setter
@NoArgsConstructor
public class Bebida extends Producto {

  private float litros;
  private String subCategoria;
  private String marca;
  private LocalDate fechaVencimiento;

  public Bebida(String nombre, BigDecimal precio, int stock, Categoria categoria, float litros) {
    super(nombre, precio, stock, categoria);
    this.litros = litros;
  }

  @Override
  public String toString() {
    return super.toString()
        + " | Litros: "
        + litros
        + " lts"
        + (marca != null ? " | Marca: " + marca : "");
  }
}
