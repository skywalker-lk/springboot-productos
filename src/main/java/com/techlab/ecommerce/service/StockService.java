package com.techlab.ecommerce.service;

import static com.techlab.ecommerce.model.stock.TipoMovimiento.*;

import com.techlab.ecommerce.config.CurrentUser;
import com.techlab.ecommerce.exception.StockInsuficienteException;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.model.stock.MovimientoStock;
import com.techlab.ecommerce.model.stock.TipoMovimiento;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.repository.MovimientoStockRepository;
import com.techlab.ecommerce.repository.ProductoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para gestionar el stock de productos y registrar todos los movimientos (ingresos,
 * egresos, ajustes) con trazabilidad.
 *
 * <p>Es el único responsable de modificar el stock de un producto. Ningún otro service debe llamar
 * a producto.setStock() directamente.
 */
@Service
public class StockService {

  private final MovimientoStockRepository movimientoRepository;
  private final ProductoRepository productoRepository;
  private final NotificacionService notificacionService;
  private final AuditoriaService auditoriaService;
  private final WebhookService webhookService;

  public StockService(
      MovimientoStockRepository movimientoRepository,
      ProductoRepository productoRepository,
      NotificacionService notificacionService,
      AuditoriaService auditoriaService,
      WebhookService webhookService) {
    this.movimientoRepository = movimientoRepository;
    this.productoRepository = productoRepository;
    this.notificacionService = notificacionService;
    this.auditoriaService = auditoriaService;
    this.webhookService = webhookService;
  }

  /** Lee el producto con bloqueo pesimista para evitar race conditions en stock */
  private Producto obtenerProductoConLock(int productoId) {
    return productoRepository
        .findByIdConLock(productoId)
        .orElseThrow(() -> new RuntimeException("No se encontró un producto con id " + productoId));
  }

  @Transactional
  public MovimientoStock registrarIngreso(
      int productoId, int cantidad, String motivo, Usuario usuario) {
    Producto p = obtenerProductoConLock(productoId);
    int anterior = p.getStock();
    p.setStock(anterior + cantidad);
    MovimientoStock mov =
        guardarMovimiento(p, INGRESO, cantidad, anterior, p.getStock(), motivo, usuario, null);
    CurrentUser.UserInfo userInfo = CurrentUser.get();
    auditoriaService.registrar(
        "INGRESO_STOCK",
        p.getNombre() + ": +" + cantidad + " (stock: " + p.getStock() + ")",
        userInfo != null ? userInfo.getId() : null,
        userInfo != null ? userInfo.getNombre() : null,
        userInfo != null ? userInfo.getEndpoint() : null);
    return mov;
  }

  @Transactional
  public MovimientoStock registrarEgreso(
      int productoId, int cantidad, String motivo, Usuario usuario, Integer pedidoId) {
    Producto p = obtenerProductoConLock(productoId);
    if (p.getStock() < cantidad) {
      throw new StockInsuficienteException(
          "Stock insuficiente para '"
              + p.getNombre()
              + "'. Disponible: "
              + p.getStock()
              + ", solicitado: "
              + cantidad);
    }
    int anterior = p.getStock();
    p.setStock(anterior - cantidad);
    MovimientoStock mov =
        guardarMovimiento(p, EGRESO, -cantidad, anterior, p.getStock(), motivo, usuario, pedidoId);
    CurrentUser.UserInfo userInfo = CurrentUser.get();
    auditoriaService.registrar(
        "EGRESO_STOCK",
        p.getNombre() + ": -" + cantidad + " (stock: " + p.getStock() + ")",
        userInfo != null ? userInfo.getId() : null,
        userInfo != null ? userInfo.getNombre() : null,
        userInfo != null ? userInfo.getEndpoint() : null);
    verificarStockBajo(p);
    return mov;
  }

  @Transactional
  public MovimientoStock registrarAjuste(
      int productoId, int nuevoStock, String motivo, Usuario usuario) {
    Producto p = obtenerProductoConLock(productoId);
    int anterior = p.getStock();
    int diferencia = nuevoStock - anterior;
    p.setStock(nuevoStock);
    MovimientoStock mov =
        guardarMovimiento(p, AJUSTE, diferencia, anterior, nuevoStock, motivo, usuario, null);
    CurrentUser.UserInfo userInfo = CurrentUser.get();
    auditoriaService.registrar(
        "AJUSTE_STOCK",
        p.getNombre() + ": " + anterior + " → " + nuevoStock,
        userInfo != null ? userInfo.getId() : null,
        userInfo != null ? userInfo.getNombre() : null,
        userInfo != null ? userInfo.getEndpoint() : null);
    verificarStockBajo(p);
    return mov;
  }

  public List<MovimientoStock> movimientosDelProducto(int productoId) {
    return movimientoRepository.findByProductoIdOrderByFechaDesc(productoId);
  }

  public Page<MovimientoStock> movimientosDelProductoPaginado(int productoId, Pageable pageable) {
    return movimientoRepository.findByProductoIdOrderByFechaDesc(productoId, pageable);
  }

  public List<MovimientoStock> movimientosPorPeriodo(LocalDate desde, LocalDate hasta) {
    LocalDateTime inicio = desde.atStartOfDay();
    LocalDateTime fin = hasta.atTime(23, 59, 59);
    return movimientoRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
  }

  public Page<MovimientoStock> movimientosPorPeriodoPaginado(
      LocalDate desde, LocalDate hasta, Pageable pageable) {
    LocalDateTime inicio = desde.atStartOfDay();
    LocalDateTime fin = hasta.atTime(23, 59, 59);
    return movimientoRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin, pageable);
  }

  public List<MovimientoStock> todosLosMovimientos() {
    return movimientoRepository.findAll();
  }

  public Page<MovimientoStock> todosLosMovimientosPaginado(Pageable pageable) {
    return movimientoRepository.findAll(pageable);
  }

  private void verificarStockBajo(Producto p) {
    if (p.getStock() <= 5) {
      notificacionService.stockBajo(p.getNombre(), p.getStock());
      webhookService.disparar(
          "STOCK_BAJO",
          Map.of(
              "productoId", p.getId(),
              "producto", p.getNombre(),
              "stock", p.getStock()));
    }
  }

  // --- Privados ---

  private MovimientoStock guardarMovimiento(
      Producto producto,
      TipoMovimiento tipo,
      int cantidad,
      int stockAnterior,
      int stockPosterior,
      String motivo,
      Usuario usuario,
      Integer pedidoId) {
    MovimientoStock movimiento =
        new MovimientoStock(
            producto, tipo, cantidad, stockAnterior, stockPosterior, motivo, usuario, pedidoId);
    return movimientoRepository.save(movimiento);
  }
}
