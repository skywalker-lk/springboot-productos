package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.model.auditoria.Auditoria;
import com.techlab.ecommerce.service.AuditoriaService;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

  private final AuditoriaService service;

  public AuditoriaController(AuditoriaService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<Map<String, Object>> listar(
      @RequestParam(defaultValue = "0") int pagina,
      @RequestParam(defaultValue = "100") int limite) {
    Pageable pageable = PageRequest.of(pagina, limite);
    Page<Auditoria> page = service.listar(pageable);
    return ResponseEntity.ok(Map.of("total", page.getTotalElements(), "logs", page.getContent()));
  }
}
