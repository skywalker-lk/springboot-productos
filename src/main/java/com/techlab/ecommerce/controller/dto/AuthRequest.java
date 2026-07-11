package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** DTO para login y registro de usuarios. */
@Data
public class AuthRequest {

  @NotBlank(message = "El correo es obligatorio")
  @Email(message = "Formato de correo inválido")
  private String correo;

  @NotBlank(message = "La contraseña es obligatoria")
  @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
  private String password;

  // Solo para registro
  private String nombre;
  private String rol;
}
