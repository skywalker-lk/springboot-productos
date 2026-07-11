package com.techlab.ecommerce.controller.dto;

import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.model.usuarios.Usuario;
import lombok.Data;

/**
 * DTO público de usuario (sin password). Mapea la entidad Usuario al formato que espera el
 * frontend.
 *
 * <p>Mapa de roles: VENTAS → vendedor GERENTE → gerente ANALISTA → analista ADMINISTRADOR →
 * administrador CLIENTE → cliente INVENTORISTA → inventorista USUARIO_CARGA → usuario_carga
 */
@Data
public class UsuarioDTO {

  private String uid;
  private String nombre;
  private String correo;
  private String telefono;
  private String rol;
  private boolean estado;
  private boolean google;

  public static UsuarioDTO fromEntity(Usuario u) {
    UsuarioDTO dto = new UsuarioDTO();
    dto.uid = String.valueOf(u.getIdentificador());
    dto.nombre = u.getNombre() + " " + u.getApellido();
    dto.correo = u.getEmail();
    dto.telefono = u.getTelefono();
    dto.rol = mapearRol(u.getRol());
    dto.estado = true;
    dto.google = false;
    return dto;
  }

  /** Convierte el nombre del enum backend al string que usa el frontend. */
  public static String mapearRol(RolUsuario rol) {
    if (rol == null) return "vendedor";
    return switch (rol) {
      case VENTAS -> "vendedor";
      case GERENTE -> "gerente";
      case ANALISTA -> "analista";
      case ADMINISTRADOR -> "administrador";
      case CLIENTE -> "cliente";
      case INVENTORISTA -> "inventorista";
      case USUARIO_CARGA -> "usuario_carga";
    };
  }

  /** Convierte el string del frontend al enum del backend. */
  public static RolUsuario desmapearRol(String rolFrontend) {
    if (rolFrontend == null) return RolUsuario.VENTAS;
    return switch (rolFrontend.toLowerCase()) {
      case "vendedor" -> RolUsuario.VENTAS;
      case "gerente" -> RolUsuario.GERENTE;
      case "analista" -> RolUsuario.ANALISTA;
      case "administrador" -> RolUsuario.ADMINISTRADOR;
      case "cliente" -> RolUsuario.CLIENTE;
      case "inventorista" -> RolUsuario.INVENTORISTA;
      case "usuario_carga" -> RolUsuario.USUARIO_CARGA;
      default -> RolUsuario.VENTAS;
    };
  }
}
