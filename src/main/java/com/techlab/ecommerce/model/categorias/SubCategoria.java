package com.techlab.ecommerce.model.categorias;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "subcategorias")
@Getter
@Setter
@NoArgsConstructor
public class SubCategoria {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @Column(nullable = false, unique = true)
  private String nombre;

  private String descripcion;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_categoria")
  @ToString.Exclude
  private Categoria categoria;

  public SubCategoria(String nombre, String descripcion, Categoria categoria) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
  }
}
