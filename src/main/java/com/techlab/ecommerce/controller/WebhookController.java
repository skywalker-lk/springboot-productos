package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.model.webhook.Webhook;
import com.techlab.ecommerce.service.WebhookService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
public class WebhookController {

  private final WebhookService service;

  public WebhookController(WebhookService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<List<Webhook>> listar() {
    return ResponseEntity.ok(service.listar());
  }

  @PostMapping("")
  public ResponseEntity<Webhook> crear(@RequestBody Map<String, String> body) {
    return ResponseEntity.ok(service.crear(body.get("url"), body.get("evento")));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Webhook> actualizar(
      @PathVariable int id, @RequestBody Map<String, Object> body) {
    return ResponseEntity.ok(
        service.actualizar(
            id,
            (String) body.getOrDefault("url", ""),
            (String) body.getOrDefault("evento", ""),
            body.containsKey("activo") ? (Boolean) body.get("activo") : true));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable int id) {
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
