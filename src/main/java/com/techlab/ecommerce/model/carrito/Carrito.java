package com.techlab.ecommerce.model.carrito;

import com.techlab.ecommerce.model.usuarios.Usuario;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "carritos")
@Getter
@Setter
@NoArgsConstructor
public class Carrito {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  @Column(nullable = false, unique = true)
  private String cliente;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "carrito_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<CarritoItem> items = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id")
  @ToString.Exclude
  private Usuario usuario;

  @Column(precision = 10, scale = 2)
  private BigDecimal total;

  public Carrito(String cliente) {
    this.cliente = cliente;
    calcularTotal();
  }

  public void agregarItem(CarritoItem item) {
    this.items.add(item);
    calcularTotal();
  }

  public void vaciar() {
    this.items.clear();
    calcularTotal();
  }

  public void calcularTotal() {
    this.total =
        this.items.stream().map(CarritoItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
