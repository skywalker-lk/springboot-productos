package com.techlab.ecommerce.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** DTO para solicitar recuperación de contraseña. */
@Data
public class ForgotPasswordRequest {

  @NotBlank(message = "El correo es obligatorio")
  @Email(message = "Formato de correo inválido")
  private String correo;
}
