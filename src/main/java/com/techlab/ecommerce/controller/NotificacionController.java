package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.service.NotificacionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

  private final NotificacionService service;

  public NotificacionController(NotificacionService service) {
    this.service = service;
  }

  @GetMapping(value = "/suscripcion", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter suscribir() {
    return service.crearEmitter();
  }
}
