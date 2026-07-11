package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.CarritoItemRequest;
import com.techlab.ecommerce.controller.dto.CheckoutRequest;
import com.techlab.ecommerce.model.carrito.Carrito;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.service.CarritoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/carrito")
@Validated
public class CarritoController {

  private final CarritoService service;

  public CarritoController(CarritoService service) {
    this.service = service;
  }

  @GetMapping("/{cliente}")
  public ResponseEntity<Carrito> obtenerCarrito(@PathVariable String cliente) {
    return ResponseEntity.ok(service.obtenerCarrito(cliente));
  }

  @PostMapping("/{cliente}/items")
  public ResponseEntity<Carrito> agregarProducto(
      @PathVariable String cliente, @Valid @RequestBody CarritoItemRequest request) {
    return ResponseEntity.ok(
        service.agregarProducto(cliente, request.getProductoId(), request.getCantidad()));
  }

  @PutMapping("/{cliente}/items/{productoId}")
  public ResponseEntity<Carrito> actualizarCantidad(
      @PathVariable String cliente,
      @PathVariable int productoId,
      @Valid @RequestBody CarritoItemRequest request) {
    return ResponseEntity.ok(
        service.actualizarCantidad(cliente, productoId, request.getCantidad()));
  }

  @DeleteMapping("/{cliente}/items/{productoId}")
  public ResponseEntity<Void> eliminarProducto(
      @PathVariable String cliente, @PathVariable int productoId) {
    service.eliminarProducto(cliente, productoId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{cliente}")
  public ResponseEntity<Void> vaciarCarrito(@PathVariable String cliente) {
    service.vaciarCarrito(cliente);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{cliente}/checkout")
  public ResponseEntity<Pedido> checkout(
      @PathVariable String cliente, @RequestBody CheckoutRequest request) {
    Pedido pedido = service.checkout(cliente, request == null ? null : request.getMedioPago());
    return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
  }
}
