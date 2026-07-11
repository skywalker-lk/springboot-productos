package com.techlab.ecommerce.model.auditoria;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auditoria")
@Getter
@Setter
@NoArgsConstructor
public class Auditoria {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  private String accion;

  @Column(length = 500)
  private String detalle;

  private Integer usuarioId;

  private String usuarioNombre;

  private String endpoint;

  private LocalDateTime timestamp;

  public Auditoria(
      String accion, String detalle, Integer usuarioId, String usuarioNombre, String endpoint) {
    this.accion = accion;
    this.detalle = detalle;
    this.usuarioId = usuarioId;
    this.usuarioNombre = usuarioNombre;
    this.endpoint = endpoint;
    this.timestamp = LocalDateTime.now();
  }
}
