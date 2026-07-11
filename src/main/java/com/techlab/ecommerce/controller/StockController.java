package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.AjusteRequest;
import com.techlab.ecommerce.controller.dto.MovimientoRequest;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.model.stock.MovimientoStock;
import com.techlab.ecommerce.service.ProductoService;
import com.techlab.ecommerce.service.StockService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock")
public class StockController {

  private final StockService stockService;
  private final ProductoService productoService;

  public StockController(StockService stockService, ProductoService productoService) {
    this.stockService = stockService;
    this.productoService = productoService;
  }

  /** Stock general: listado de todos los productos con su stock actual. */
  @GetMapping("/productos")
  public ResponseEntity<List<Producto>> stockGeneral() {
    return ResponseEntity.ok(productoService.listarTodos());
  }

  /** Stock de un producto específico + su historial de movimientos. */
  @GetMapping("/productos/{id}")
  public ResponseEntity<Map<String, Object>> stockProducto(@PathVariable int id) {
    Producto p = productoService.obtenerPorId(id);
    List<MovimientoStock> movs = stockService.movimientosDelProducto(id);
    return ResponseEntity.ok(
        Map.of(
            "producto", p,
            "movimientos", movs));
  }

  /** Registrar ingreso de stock. */
  @PostMapping("/ingreso")
  public ResponseEntity<MovimientoStock> registrarIngreso(
      @Valid @RequestBody MovimientoRequest request) {
    MovimientoStock movimiento =
        stockService.registrarIngreso(
            request.getProductoId(),
            request.getCantidad(),
            request.getMotivo(),
            null // usuario: pendiente de autenticación
            );
    return ResponseEntity.status(201).body(movimiento);
  }

  /** Registrar ajuste de stock (setea un valor exacto). */
  @PostMapping("/ajuste")
  public ResponseEntity<MovimientoStock> registrarAjuste(
      @Valid @RequestBody AjusteRequest request) {
    MovimientoStock movimiento =
        stockService.registrarAjuste(
            request.getProductoId(),
            request.getNuevoStock(),
            request.getMotivo(),
            null // usuario: pendiente de autenticación
            );
    return ResponseEntity.status(201).body(movimiento);
  }

  /**
   * Consultar movimientos con filtros opcionales. GET /stock/movimientos?productoId=1 GET
   * /stock/movimientos?desde=2026-01-01&hasta=2026-06-01 GET /stock/movimientos (todos)
   */
  @GetMapping("/movimientos")
  public ResponseEntity<List<MovimientoStock>> listarMovimientos(
      @RequestParam(required = false) Integer productoId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate desde,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate hasta,
      @RequestParam(defaultValue = "0") int pagina,
      @RequestParam(defaultValue = "50") int limite) {

    Pageable pageable = PageRequest.of(pagina, limite);
    if (productoId != null) {
      Page<MovimientoStock> page =
          stockService.movimientosDelProductoPaginado(productoId, pageable);
      return ResponseEntity.ok(page.getContent());
    }
    if (desde != null && hasta != null) {
      Page<MovimientoStock> page =
          stockService.movimientosPorPeriodoPaginado(desde, hasta, pageable);
      return ResponseEntity.ok(page.getContent());
    }
    Page<MovimientoStock> page = stockService.todosLosMovimientosPaginado(pageable);
    return ResponseEntity.ok(page.getContent());
  }
}
