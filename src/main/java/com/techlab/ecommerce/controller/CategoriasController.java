package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.CategoriaDTO;
import com.techlab.ecommerce.controller.dto.CategoriaListResponse;
import com.techlab.ecommerce.controller.dto.CategoriaRequest;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.categorias.SubCategoria;
import com.techlab.ecommerce.service.CategoriaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categorias")
public class CategoriasController {

  private final CategoriaService service;

  public CategoriasController(CategoriaService service) {
    this.service = service;
  }

  // ─── CRUD Categorías ──────────────────────────────────────────

  @GetMapping
  public ResponseEntity<CategoriaListResponse> listarCategorias() {
    List<CategoriaDTO> dtos = service.listarCategorias().stream().map(CategoriaDTO::new).toList();
    return ResponseEntity.ok(new CategoriaListResponse(dtos.size(), dtos));
  }

  @GetMapping("/{tipo}")
  public ResponseEntity<CategoriaDTO> obtenerPorTipo(@PathVariable String tipo) {
    return ResponseEntity.ok(new CategoriaDTO(service.obtenerCategoriaPorTipo(tipo)));
  }

  @PostMapping
  public ResponseEntity<CategoriaDTO> crearCategoria(@Valid @RequestBody CategoriaRequest request) {
    Categoria c =
        service.crearCategoria(request.getTipo(), request.getNombre(), request.getDescripcion());
    return ResponseEntity.status(201).body(new CategoriaDTO(c));
  }

  @PutMapping("/{id}")
  public ResponseEntity<CategoriaDTO> actualizarCategoria(
      @PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
    Categoria c =
        service.actualizarCategoria(
            id, request.getTipo(), request.getNombre(), request.getDescripcion());
    return ResponseEntity.ok(new CategoriaDTO(c));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
    service.eliminarCategoria(id);
    return ResponseEntity.noContent().build();
  }

  // ─── Subcategorías ────────────────────────────────────────────

  @GetMapping("/subcategorias")
  public ResponseEntity<List<SubCategoria>> listarSubCategorias() {
    return ResponseEntity.ok(service.listarTodas());
  }

  @GetMapping("/{tipo}/subcategorias")
  public ResponseEntity<List<SubCategoria>> obtenerPorCategoria(@PathVariable String tipo) {
    Categoria c = service.obtenerCategoriaPorTipo(tipo);
    return ResponseEntity.ok(service.obtenerPorCategoria(c));
  }

  @GetMapping("/subcategorias/{nombre}")
  public ResponseEntity<SubCategoria> obtenerSubCategoria(@PathVariable String nombre) {
    return ResponseEntity.ok(service.buscarSubCategoriaPorNombre(nombre));
  }

  @PostMapping("/subcategorias")
  public ResponseEntity<Void> agregarSubCategoria(@Valid @RequestBody CategoriaRequest request) {
    Categoria c = service.obtenerCategoriaPorTipo(request.getCategoria());
    service.agregarSubCategoria(request.getNombre(), request.getDescripcion(), c);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/subcategorias/{nombre}")
  public ResponseEntity<Void> eliminarSubCategoria(@PathVariable String nombre) {
    service.eliminarSubCategoria(nombre);
    return ResponseEntity.noContent().build();
  }
}
