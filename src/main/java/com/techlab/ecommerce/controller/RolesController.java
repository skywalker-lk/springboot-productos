package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/roles")
public class RolesController {

  private final RoleService service;

  public RolesController(RoleService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<RolUsuario[]> listarRoles() {
    return ResponseEntity.ok(service.listarRoles());
  }

  @GetMapping("/{rol}")
  public ResponseEntity<RolUsuario> obtenerRol(@PathVariable String rol) {
    return ResponseEntity.ok(service.obtenerRol(rol));
  }
}
