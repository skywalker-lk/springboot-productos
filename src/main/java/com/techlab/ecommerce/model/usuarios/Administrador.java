package com.techlab.ecommerce.model.usuarios;

import com.techlab.ecommerce.model.roles.RolUsuario;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("ADMIN")
@NoArgsConstructor
public class Administrador extends Usuario {

  public Administrador(
      String nombre,
      String apellido,
      String email,
      String password,
      String telefono,
      RolUsuario rol) {
    super(nombre, apellido, email, password, telefono, rol);
  }
}
