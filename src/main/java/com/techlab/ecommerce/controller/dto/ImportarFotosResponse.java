package com.techlab.ecommerce.controller.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Respuesta de la importación masiva de fotos. Cada archivo se matchea con un producto por nombre
 * (sin extensión).
 */
@Getter
@Setter
@NoArgsConstructor
public class ImportarFotosResponse {

  private int total;
  private int asignadas;
  private List<ErrorFoto> errores = new ArrayList<>();

  public ImportarFotosResponse(int total, int asignadas, List<ErrorFoto> errores) {
    this.total = total;
    this.asignadas = asignadas;
    this.errores = errores;
  }

  public void addError(String archivo, String motivo) {
    errores.add(new ErrorFoto(archivo, motivo));
  }

  @Getter
  @Setter
  @NoArgsConstructor
  public static class ErrorFoto {
    private String archivo;
    private String motivo;

    public ErrorFoto(String archivo, String motivo) {
      this.archivo = archivo;
      this.motivo = motivo;
    }
  }
}
