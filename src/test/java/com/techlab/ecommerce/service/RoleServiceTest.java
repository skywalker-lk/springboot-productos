package com.techlab.ecommerce.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.techlab.ecommerce.model.roles.RolUsuario;
import org.junit.jupiter.api.Test;

class RoleServiceTest {

  @Test
  void listarRoles_devuelveTodosLosRolesDefinidos() {
    RoleService service = new RoleService();

    assertArrayEquals(RolUsuario.values(), service.listarRoles());
  }

  @Test
  void obtenerRol_conNombreMinuscula_devuelveRolCorrespondiente() {
    RoleService service = new RoleService();

    RolUsuario rol = service.obtenerRol("cliente");

    assertEquals(RolUsuario.CLIENTE, rol);
  }

  @Test
  void obtenerRol_invalido_lanzaIllegalArgumentException() {
    RoleService service = new RoleService();

    assertThrows(IllegalArgumentException.class, () -> service.obtenerRol("noExiste"));
  }
}
