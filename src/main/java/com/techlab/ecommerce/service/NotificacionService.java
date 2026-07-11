package com.techlab.ecommerce.service;

import com.techlab.ecommerce.controller.dto.NotificacionDTO;
import java.io.IOException;
import java.util.List;
// import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class NotificacionService {

  private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);
  private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

  public SseEmitter crearEmitter() {
    SseEmitter emitter = new SseEmitter(0L);
    emitters.add(emitter);

    emitter.onCompletion(() -> emitters.remove(emitter));
    emitter.onTimeout(() -> emitters.remove(emitter));
    emitter.onError(e -> emitters.remove(emitter));

    return emitter;
  }

  public void enviar(NotificacionDTO notificacion) {
    for (SseEmitter emitter : emitters) {
      try {
        emitter.send(SseEmitter.event().name("notificacion").data(notificacion));
      } catch (IOException e) {
        emitter.completeWithError(e);
        emitters.remove(emitter);
      }
    }
  }

  public void stockBajo(String productoNombre, int stockActual) {
    enviar(
        new NotificacionDTO(
            "stock_bajo", "Stock Bajo", productoNombre + " — Stock: " + stockActual, "/stock"));
    log.warn("Stock bajo: {} (quedan {})", productoNombre, stockActual);
  }

  public void pedidoConfirmado(int pedidoId, String cliente, double total) {
    enviar(
        new NotificacionDTO(
            "pedido_confirmado",
            "Pedido Confirmado",
            "Pedido #" + pedidoId + " — " + cliente + " ($" + String.format("%.2f", total) + ")",
            "/pedidos"));
  }

  public void nuevoContacto(int contactoId, String nombre, String email) {
    enviar(
        new NotificacionDTO(
            "nuevo_contacto", "Nueva Consulta", nombre + " (" + email + ")", "/contacto"));
  }
}
