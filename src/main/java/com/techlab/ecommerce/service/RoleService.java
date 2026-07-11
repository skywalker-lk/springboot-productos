package com.techlab.ecommerce.service;

import com.techlab.ecommerce.model.roles.RolUsuario;
import org.springframework.stereotype.Service;

@Service
public class RoleService {

  public RolUsuario[] listarRoles() {
    return RolUsuario.values();
  }

  public RolUsuario obtenerRol(String rol) {
    return RolUsuario.valueOf(rol.toUpperCase());
  }
}
