package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** DTO para restablecer contraseña con token JWT. */
@Data
public class ResetPasswordRequest {

  @NotBlank(message = "El token es obligatorio")
  private String token;

  @NotBlank(message = "La contraseña es obligatoria")
  @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
  private String password;
}
