package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.model.contacto.Contacto;
import com.techlab.ecommerce.service.ContactoService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contacto")
public class ContactoController {

  private final ContactoService service;

  public ContactoController(ContactoService service) {
    this.service = service;
  }

  @PostMapping("")
  public ResponseEntity<Map<String, String>> enviarConsulta(@RequestBody Map<String, String> body) {
    String nombre = body.get("nombre");
    String email = body.get("email");
    String telefono = body.get("telefono");
    String mensaje = body.get("mensaje");

    if (nombre == null
        || nombre.isBlank()
        || email == null
        || email.isBlank()
        || mensaje == null
        || mensaje.isBlank()) {
      return ResponseEntity.badRequest()
          .body(Map.of("msg", "nombre, email y mensaje son obligatorios"));
    }

    service.guardar(nombre, email, telefono, mensaje);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of("msg", "Consulta enviada correctamente"));
  }

  @GetMapping
  public ResponseEntity<List<Contacto>> listarTodas() {
    return ResponseEntity.ok(service.listarTodos());
  }

  @PutMapping("/{id}/leido")
  public ResponseEntity<Void> marcarLeido(@PathVariable int id) {
    service.marcarLeido(id);
    return ResponseEntity.ok().build();
  }
}
