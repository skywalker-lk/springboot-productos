package com.techlab.ecommerce.model.usuarios;

import com.techlab.ecommerce.model.carrito.Carrito;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.roles.RolUsuario;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Entidad base para usuarios. Usa SINGLE_TABLE con discriminador para las subclases Cliente y
 * Administrador. Implementa {@link UserDetails} para integrarse con Spring Security.
 */
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public class Usuario implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Integer identificador;

  @Column(nullable = false)
  private String nombre;

  @Column(nullable = false)
  private String apellido;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  private String telefono;

  @Enumerated(EnumType.STRING)
  private RolUsuario rol;

  /** Hash SHA-256 del último token de reset. Se limpia al usar el token. */
  @Column(nullable = true, length = 64)
  private String resetTokenHash;

  @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<Pedido> pedidos = new ArrayList<>();

  @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<Carrito> carritos = new ArrayList<>();

  public Usuario(
      String nombre,
      String apellido,
      String email,
      String password,
      String telefono,
      RolUsuario rol) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.password = password;
    this.telefono = telefono;
    this.rol = rol;
  }

  // ─── UserDetails ───────────────────────────────────────────────

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
