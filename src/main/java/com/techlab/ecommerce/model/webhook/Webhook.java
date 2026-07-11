package com.techlab.ecommerce.model.webhook;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "webhooks")
@Getter
@Setter
@NoArgsConstructor
public class Webhook {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @Column(nullable = false)
  private String url;

  @Column(nullable = false)
  private String evento;

  private boolean activo = true;

  private LocalDateTime createdAt;

  public Webhook(String url, String evento) {
    this.url = url;
    this.evento = evento;
    this.createdAt = LocalDateTime.now();
  }
}
