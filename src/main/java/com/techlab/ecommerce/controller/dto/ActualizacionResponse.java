package com.techlab.ecommerce.controller.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Respuesta de una actualización masiva. */
@Getter
@Setter
@NoArgsConstructor
public class ActualizacionResponse {

  private int total;
  private int actualizados;
  private List<ErrorActualizacion> errores = new ArrayList<>();

  public ActualizacionResponse(int total, int actualizados, List<ErrorActualizacion> errores) {
    this.total = total;
    this.actualizados = actualizados;
    this.errores = errores;
  }

  public void addError(int fila, String mensaje) {
    errores.add(new ErrorActualizacion(fila, mensaje));
  }

  @Getter
  @Setter
  @NoArgsConstructor
  public static class ErrorActualizacion {
    private int fila;
    private String mensaje;

    public ErrorActualizacion(int fila, String mensaje) {
      this.fila = fila;
      this.mensaje = mensaje;
    }
  }
}
