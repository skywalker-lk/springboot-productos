package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioRequest {
  @NotBlank(message = "El nombre es obligatorio")
  private String nombre;

  @NotBlank(message = "El apellido es obligatorio")
  private String apellido;

  @NotBlank(message = "El email es obligatorio")
  @Email(message = "El email debe tener un formato válido")
  private String email;

  private String password;

  @NotBlank(message = "El teléfono es obligatorio")
  private String telefono;

  @NotBlank(message = "El rol es obligatorio")
  private String rol;
}
