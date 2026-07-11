package com.techlab.ecommerce.model.categorias;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.techlab.ecommerce.model.productos.Producto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Categoría de productos. Entidad que reemplaza el antiguo enum Categoria. Cada producto se
 * relaciona con una categoría vía @ManyToOne.
 */
@Entity
@Table(name = "categorias")
@Getter
@Setter
@NoArgsConstructor
public class Categoria {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String tipo;

  @NotBlank(message = "El nombre de la categoría no puede estar vacío")
  @Column(nullable = false)
  private String nombre;

  @Column(length = 500)
  private String descripcion;

  @JsonIgnore
  @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<Producto> productos = new ArrayList<>();

  @JsonIgnore
  @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<SubCategoria> subCategorias = new ArrayList<>();

  public Categoria(String tipo, String nombre, String descripcion) {
    this.tipo = tipo;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  @JsonProperty("_id")
  public String getTipo() {
    return tipo;
  }
}
