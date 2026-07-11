package com.techlab.ecommerce.controller.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Respuesta de una importación masiva. */
@Getter
@Setter
@NoArgsConstructor
public class ImportacionResponse {

  private int total;
  private int creados;
  private List<ErrorImportacion> errores = new ArrayList<>();

  public ImportacionResponse(int total, int creados, List<ErrorImportacion> errores) {
    this.total = total;
    this.creados = creados;
    this.errores = errores;
  }

  public void addError(int fila, String mensaje) {
    errores.add(new ErrorImportacion(fila, mensaje));
  }

  @Getter
  @Setter
  @NoArgsConstructor
  public static class ErrorImportacion {
    private int fila;
    private String mensaje;

    public ErrorImportacion(int fila, String mensaje) {
      this.fila = fila;
      this.mensaje = mensaje;
    }
  }
}
