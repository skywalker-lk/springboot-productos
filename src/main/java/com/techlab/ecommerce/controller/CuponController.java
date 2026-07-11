package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.CuponListResponse;
import com.techlab.ecommerce.controller.dto.CuponRequest;
import com.techlab.ecommerce.controller.dto.ValidarCuponRequest;
import com.techlab.ecommerce.controller.dto.ValidarCuponResponse;
import com.techlab.ecommerce.model.cupon.Cupon;
import com.techlab.ecommerce.service.CuponService;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cupones")
public class CuponController {

  private final CuponService service;

  public CuponController(CuponService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<CuponListResponse> listarTodos(
      @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "50") int limite) {
    Pageable pageable = PageRequest.of(pagina, limite);
    Page<Cupon> page = service.listarPaginado(pageable);
    return ResponseEntity.ok(new CuponListResponse(page.getTotalElements(), page.getContent()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Cupon> obtenerPorId(@PathVariable Integer id) {
    return ResponseEntity.ok(service.obtenerPorId(id));
  }

  @PostMapping
  public ResponseEntity<Cupon> crear(@RequestBody CuponRequest request) {
    Cupon cupon = new Cupon();
    cupon.setCodigo(request.getCodigo());
    cupon.setTipo(request.getTipo());
    cupon.setValorDescuento(request.getValorDescuento());
    cupon.setMontoMinimo(request.getMontoMinimo());
    cupon.setFechaExpiracion(request.getFechaExpiracion());
    cupon.setUsosMaximos(request.getUsosMaximos());
    cupon.setActivo(request.getActivo() != null ? request.getActivo() : true);
    return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(cupon));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Cupon> actualizar(
      @PathVariable Integer id, @RequestBody CuponRequest request) {
    Cupon datos = new Cupon();
    datos.setCodigo(request.getCodigo());
    datos.setTipo(request.getTipo());
    datos.setValorDescuento(request.getValorDescuento());
    datos.setMontoMinimo(request.getMontoMinimo());
    datos.setFechaExpiracion(request.getFechaExpiracion());
    datos.setUsosMaximos(request.getUsosMaximos());
    datos.setActivo(request.getActivo());
    return ResponseEntity.ok(service.actualizar(id, datos));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/validar")
  public ResponseEntity<ValidarCuponResponse> validar(@RequestBody ValidarCuponRequest request) {
    try {
      BigDecimal descuento = service.aplicarCupon(request.getCodigo(), request.getMontoPedido());
      BigDecimal totalFinal = request.getMontoPedido().subtract(descuento);
      return ResponseEntity.ok(
          new ValidarCuponResponse(request.getCodigo(), descuento, totalFinal));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
          .body(new ValidarCuponResponse(request.getCodigo(), e.getMessage()));
    }
  }
}
