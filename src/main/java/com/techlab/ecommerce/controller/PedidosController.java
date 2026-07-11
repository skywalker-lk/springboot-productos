package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.config.JwtService;
import com.techlab.ecommerce.controller.dto.PedidoListResponse;
import com.techlab.ecommerce.controller.dto.PedidoRequest;
import com.techlab.ecommerce.controller.dto.PedidoUpdateRequest;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.service.PedidoService;
import com.techlab.ecommerce.service.UsuarioService;
import jakarta.validation.Valid;
import java.time.LocalDate;
// import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pedidos")
public class PedidosController {
  private final PedidoService service;
  private final JwtService jwtService;
  private final UsuarioService usuarioService;

  public PedidosController(
      PedidoService service, JwtService jwtService, UsuarioService usuarioService) {
    this.service = service;
    this.jwtService = jwtService;
    this.usuarioService = usuarioService;
  }

  @GetMapping("/mis-pedidos")
  public ResponseEntity<PedidoListResponse> misPedidos(
      @RequestHeader("Authorization") String authHeader,
      @RequestParam(defaultValue = "0") int pagina,
      @RequestParam(defaultValue = "50") int limite) {
    String token =
        authHeader != null && authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;
    int usuarioId = jwtService.extraerUsuarioId(token);
    Usuario usuario = usuarioService.obtenerPorId(usuarioId);
    Pageable pageable = PageRequest.of(pagina, limite);
    Page<Pedido> page = service.listarPorUsuario(usuario, pageable);
    return ResponseEntity.ok(new PedidoListResponse(page.getTotalElements(), page.getContent()));
  }

  @GetMapping
  public ResponseEntity<PedidoListResponse> listarPedidos(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate desde,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate hasta,
      @RequestParam(defaultValue = "0") int pagina,
      @RequestParam(defaultValue = "50") int limite) {
    Pageable pageable = PageRequest.of(pagina, limite);
    if (desde != null && hasta != null) {
      Page<Pedido> page = service.listarPorFechaPaginado(desde, hasta, pageable);
      return ResponseEntity.ok(new PedidoListResponse(page.getTotalElements(), page.getContent()));
    }
    Page<Pedido> page = service.listarPaginado(pageable);
    return ResponseEntity.ok(new PedidoListResponse(page.getTotalElements(), page.getContent()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Pedido> obtenerPedido(@PathVariable int id) {
    return ResponseEntity.ok(service.obtenerPorId(id));
  }

  @PostMapping("")
  public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody PedidoRequest request) {
    Usuario usuario = null;
    if (request.getUsuarioId() != null) {
      usuario = usuarioService.obtenerPorId(request.getUsuarioId());
    }
    Pedido pedido =
        service.crearPedido(
            request.getIdsProducto(),
            request.getCantidades(),
            request.getNombreCliente(),
            LocalDate.now(),
            usuario,
            request.getCodigoCupon());
    return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Pedido> actualizarPedido(
      @PathVariable int id, @RequestBody PedidoUpdateRequest request) {
    return ResponseEntity.ok(
        service.actualizar(id, request.getNombreCliente(), request.getEstado()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminarPedido(@PathVariable int id) {
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
