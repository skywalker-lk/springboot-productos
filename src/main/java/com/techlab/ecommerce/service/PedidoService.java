package com.techlab.ecommerce.service;

import com.techlab.ecommerce.config.CurrentUser;
import com.techlab.ecommerce.exception.CantidadInvalidaException;
import com.techlab.ecommerce.exception.PedidoNoEncontradoException;
import com.techlab.ecommerce.exception.StockInsuficienteException;
import com.techlab.ecommerce.model.pedidos.LineaPedido;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.repository.PedidoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Capa de servicio para la gestión de pedidos.
 *
 * <p>Depende de ProductoService para obtener productos y StockService para descontar stock. Delega
 * persistencia a PedidoRepository.
 */
@Service
public class PedidoService {

  private final PedidoRepository pedidoRepository;
  private final ProductoService productoService;
  private final StockService stockService;
  private final CuponService cuponService;
  private final NotificacionService notificacionService;
  private final AuditoriaService auditoriaService;
  private final WebhookService webhookService;

  public PedidoService(
      PedidoRepository pedidoRepository,
      ProductoService productoService,
      StockService stockService,
      CuponService cuponService,
      NotificacionService notificacionService,
      AuditoriaService auditoriaService,
      WebhookService webhookService) {
    this.pedidoRepository = pedidoRepository;
    this.productoService = productoService;
    this.stockService = stockService;
    this.cuponService = cuponService;
    this.notificacionService = notificacionService;
    this.auditoriaService = auditoriaService;
    this.webhookService = webhookService;
  }

  // ----------------------------------------------------------------
  // Operaciones del CRUD
  // ----------------------------------------------------------------

  @Transactional
  public Pedido crearPedido(
      List<Integer> idsProducto, List<Integer> cantidades, String nombreCliente) {
    return crearPedido(idsProducto, cantidades, nombreCliente, LocalDate.now(), null);
  }

  @Transactional
  public Pedido crearPedido(
      List<Integer> idsProducto, List<Integer> cantidades, String nombreCliente, LocalDate fecha) {
    return crearPedido(idsProducto, cantidades, nombreCliente, fecha, null);
  }

  @Transactional
  public Pedido crearPedido(
      List<Integer> idsProducto,
      List<Integer> cantidades,
      String nombreCliente,
      LocalDate fecha,
      Usuario usuario) {
    return crearPedido(idsProducto, cantidades, nombreCliente, fecha, usuario, null);
  }

  @Transactional
  public Pedido crearPedido(
      List<Integer> idsProducto,
      List<Integer> cantidades,
      String nombreCliente,
      LocalDate fecha,
      Usuario usuario,
      String codigoCupon) {
    validarEntradaPedido(idsProducto, cantidades, nombreCliente);

    Map<Integer, Integer> cantidadesPorProducto = consolidarCantidades(idsProducto, cantidades);
    List<LineaPedido> lineas = new ArrayList<>();

    // Primera pasada: validar stock y construir líneas
    BigDecimal subtotal = BigDecimal.ZERO;
    for (Map.Entry<Integer, Integer> entrada : cantidadesPorProducto.entrySet()) {
      int productoId = entrada.getKey();
      int cantidad = entrada.getValue();

      Producto producto = this.productoService.obtenerPorId(productoId);

      if (producto.getStock() < cantidad) {
        throw new StockInsuficienteException(
            "Stock insuficiente para '"
                + producto.getNombre()
                + "'. Disponible: "
                + producto.getStock()
                + ", solicitado: "
                + cantidad);
      }

      LineaPedido linea = new LineaPedido(cantidad, producto);

      if (producto.getDescuentoCantidad() > 0
          && cantidad >= producto.getDescuentoCantidad()
          && producto.getDescuentoPorcentaje() > 0) {
        BigDecimal descPct = BigDecimal.valueOf(1 - producto.getDescuentoPorcentaje() / 100.0);
        linea.setPrecioUnitario(
            linea
                .getPrecioUnitario()
                .multiply(descPct)
                .setScale(2, java.math.RoundingMode.HALF_UP));
        linea.setSubtotal(
            linea
                .getPrecioUnitario()
                .multiply(BigDecimal.valueOf(cantidad))
                .setScale(2, java.math.RoundingMode.HALF_UP));
      }

      lineas.add(linea);
      subtotal = subtotal.add(linea.getSubtotal());
    }

    // Aplicar cupón si se envió
    BigDecimal descuento = null;
    if (codigoCupon != null && !codigoCupon.isBlank()) {
      descuento = cuponService.aplicarCupon(codigoCupon, subtotal);
    }

    // Persistimos el pedido primero para tener su ID
    Pedido pedido = new Pedido(nombreCliente, lineas, fecha);
    pedido.setUsuario(usuario);
    pedido.setDescuentoAplicado(descuento);
    pedido.setCodigoCupon(codigoCupon);
    pedido = pedidoRepository.save(pedido);

    // Segunda pasada: descontar stock via StockService
    final Integer pedidoId = pedido.getId();
    for (LineaPedido linea : lineas) {
      Producto p = linea.getProducto();
      stockService.registrarEgreso(
          p.getId(), linea.getCantidad(), "Venta - Pedido #" + pedidoId, null, pedidoId);
    }

    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "CREAR_PEDIDO",
        "Pedido #" + pedido.getId() + " — " + pedido.getCliente() + " ($" + pedido.getTotal() + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    notificacionService.pedidoConfirmado(
        pedido.getId(), pedido.getCliente(), pedido.getTotal().doubleValue());
    webhookService.disparar(
        "PEDIDO_CREADO",
        Map.of(
            "pedidoId", pedido.getId(),
            "cliente", pedido.getCliente(),
            "total", pedido.getTotal(),
            "lineas", pedido.getLineas().size()));

    return pedido;
  }

  private void validarEntradaPedido(
      List<Integer> idsProducto, List<Integer> cantidades, String nombreCliente) {
    if (idsProducto == null || cantidades == null) {
      throw new IllegalArgumentException("Los productos y las cantidades son obligatorios.");
    }

    if (idsProducto.size() != cantidades.size()) {
      throw new IllegalArgumentException(
          "La cantidad de productos debe coincidir con la cantidad de cantidades.");
    }

    if (idsProducto.isEmpty()) {
      throw new IllegalArgumentException("Debe enviar al menos un producto en el pedido.");
    }

    if (nombreCliente == null || nombreCliente.trim().isEmpty()) {
      throw new IllegalArgumentException("El nombre del cliente no puede quedar vacío.");
    }

    for (int i = 0; i < idsProducto.size(); i++) {
      Integer productoId = idsProducto.get(i);
      Integer cantidad = cantidades.get(i);

      if (productoId == null || productoId <= 0) {
        throw new IllegalArgumentException("El id del producto debe ser mayor que cero.");
      }

      if (cantidad == null || cantidad <= 0) {
        throw new CantidadInvalidaException("La cantidad debe ser mayor a cero.");
      }
    }
  }

  private Map<Integer, Integer> consolidarCantidades(
      List<Integer> idsProducto, List<Integer> cantidades) {
    Map<Integer, Integer> acumulador = new LinkedHashMap<>();
    for (int i = 0; i < idsProducto.size(); i++) {
      int productoId = idsProducto.get(i);
      int cantidad = cantidades.get(i);
      acumulador.merge(productoId, cantidad, (existente, actual) -> existente + actual);
    }
    return acumulador;
  }

  public List<Pedido> listarTodos() {
    return pedidoRepository.findAll();
  }

  public Page<Pedido> listarPaginado(Pageable pageable) {
    return pedidoRepository.findAll(pageable);
  }

  public List<Pedido> listarPorFecha(LocalDate desde, LocalDate hasta) {
    return pedidoRepository.findByFechaBetween(desde, hasta);
  }

  public Page<Pedido> listarPorFechaPaginado(LocalDate desde, LocalDate hasta, Pageable pageable) {
    return pedidoRepository.findByFechaBetween(desde, hasta, pageable);
  }

  public Page<Pedido> listarPorUsuario(Usuario usuario, Pageable pageable) {
    return pedidoRepository.findByUsuario(usuario, pageable);
  }

  public Pedido obtenerPorId(int id) {
    return pedidoRepository
        .findById(id)
        .orElseThrow(
            () -> new PedidoNoEncontradoException("No se encontró un pedido con id " + id));
  }

  @Transactional
  public Pedido actualizar(int id, String nombreCliente, String estado) {
    Pedido pedido = obtenerPorId(id);

    if (nombreCliente != null && !nombreCliente.trim().isEmpty()) {
      pedido.setCliente(nombreCliente);
    }

    if (estado != null && !estado.trim().isEmpty()) {
      pedido.setEstado(estado);
    }

    Pedido updated = pedidoRepository.save(pedido);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ACTUALIZAR_PEDIDO",
        "Pedido #" + id + " → " + updated.getEstado(),
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    return updated;
  }

  @Transactional
  public void eliminar(int id) {
    Pedido pedido = obtenerPorId(id);
    pedidoRepository.delete(pedido);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ELIMINAR_PEDIDO",
        "Pedido #" + id + " — " + pedido.getCliente(),
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
  }

  public int obtenerCantidad() {
    return (int) pedidoRepository.count();
  }
}
