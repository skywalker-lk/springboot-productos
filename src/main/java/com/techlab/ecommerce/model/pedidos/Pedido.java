package com.techlab.ecommerce.model.pedidos;

import static java.math.RoundingMode.HALF_UP;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.techlab.ecommerce.model.usuarios.Usuario;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer id;

  private LocalDate fecha;
  private String cliente;
  private String estado;

  @Column(precision = 10, scale = 2)
  private BigDecimal total;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "pedido_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<LineaPedido> lineas = new ArrayList<>();

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "usuario_id")
  @ToString.Exclude
  @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler", "pedidos", "carritos"})
  private Usuario usuario;

  private String medioPago;

  @Column(precision = 10, scale = 2)
  private BigDecimal descuentoAplicado;

  @Column(length = 50)
  private String codigoCupon;

  public Pedido(String cliente, List<LineaPedido> lineas) {
    this(cliente, lineas, LocalDate.now());
  }

  public Pedido(String cliente, List<LineaPedido> lineas, LocalDate fecha) {
    this.fecha = fecha;
    this.cliente = (cliente == null || cliente.trim().isEmpty()) ? "Mostrador" : cliente;
    this.estado = "Confirmado";
    this.lineas = new ArrayList<>(lineas);
    this.total = calcularTotal();
    this.medioPago = "No especificado";
  }

  public BigDecimal calcularTotal() {
    BigDecimal subtotal =
        lineas.stream().map(LineaPedido::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    if (descuentoAplicado != null && descuentoAplicado.compareTo(BigDecimal.ZERO) > 0) {
      subtotal = subtotal.subtract(descuentoAplicado);
      if (subtotal.compareTo(BigDecimal.ZERO) < 0) subtotal = BigDecimal.ZERO;
    }
    return subtotal.setScale(2, HALF_UP);
  }

  // Setters con lógica custom

  public void setCliente(String cliente) {
    this.cliente = (cliente == null || cliente.trim().isEmpty()) ? "Mostrador" : cliente.trim();
  }

  public void setEstado(String estado) {
    if (estado != null && !estado.trim().isEmpty()) this.estado = estado.trim();
  }

  public void setMedioPago(String medioPago) {
    if (medioPago != null && !medioPago.trim().isEmpty()) this.medioPago = medioPago.trim();
  }
}
