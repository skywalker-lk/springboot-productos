package com.techlab.ecommerce.model.contacto;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contactos")
@Getter
@Setter
@NoArgsConstructor
public class Contacto {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @Column(nullable = false)
  private String nombre;

  @Column(nullable = false)
  private String email;

  private String telefono;

  @Column(nullable = false, length = 2000)
  private String mensaje;

  private boolean leido = false;

  private LocalDateTime createdAt;

  public Contacto(String nombre, String email, String telefono, String mensaje) {
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.mensaje = mensaje;
    this.createdAt = LocalDateTime.now();
  }
}
