package com.techlab.ecommerce.controller.dto;

public class NotificacionDTO {

  private String tipo;
  private String titulo;
  private String mensaje;
  private String link;

  public NotificacionDTO() {}

  public NotificacionDTO(String tipo, String titulo, String mensaje) {
    this(tipo, titulo, mensaje, null);
  }

  public NotificacionDTO(String tipo, String titulo, String mensaje, String link) {
    this.tipo = tipo;
    this.titulo = titulo;
    this.mensaje = mensaje;
    this.link = link;
  }

  public String getTipo() {
    return tipo;
  }

  public void setTipo(String tipo) {
    this.tipo = tipo;
  }

  public String getTitulo() {
    return titulo;
  }

  public void setTitulo(String titulo) {
    this.titulo = titulo;
  }

  public String getMensaje() {
    return mensaje;
  }

  public void setMensaje(String mensaje) {
    this.mensaje = mensaje;
  }

  public String getLink() {
    return link;
  }

  public void setLink(String link) {
    this.link = link;
  }
}
