package com.techlab.ecommerce.model.productos;

import com.techlab.ecommerce.model.categorias.Categoria;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Subclase de Producto para categoria comida. */
@Entity
@DiscriminatorValue("COMIDA")
@Getter
@Setter
@NoArgsConstructor
public class Comida extends Producto {

  private double peso;
  private String subCategoria;
  private String marca;
  private LocalDate fechaVencimiento;

  public Comida(String nombre, BigDecimal precio, int stock, Categoria categoria, double peso) {
    super(nombre, precio, stock, categoria);
    this.peso = peso;
  }

  @Override
  public String toString() {
    return super.toString()
        + " | Peso: "
        + peso
        + " gramos"
        + (marca != null ? " | Marca: " + marca : "");
  }
}
