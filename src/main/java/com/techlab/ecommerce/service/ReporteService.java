package com.techlab.ecommerce.service;

// import com.techlab.ecommerce.exception.PedidoNoEncontradoException;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.pedidos.LineaPedido;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Servicio para generar reportes del negocio. Ofrece métricas como stock crítico, valorización
 * total, rotación de productos por categoría, etc.
 */
@Service
public class ReporteService {

  private final ProductoService productoService;
  private final PedidoService pedidoService;

  public ReporteService(ProductoService productoService, PedidoService pedidoService) {
    this.productoService = productoService;
    this.pedidoService = pedidoService;
  }

  /** Productos con stock por debajo del umbral. */
  public List<Producto> stockCritico(int umbral) {
    return productoService.listarTodos().stream()
        .filter(p -> p.getStock() <= umbral)
        .collect(Collectors.toList());
  }

  /** Valorización total del inventario (precio × stock de cada producto). */
  public BigDecimal valorizacionTotal() {
    return productoService.listarTodos().stream()
        .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getStock())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  /** Pedidos realizados en un período. */
  public List<Pedido> pedidosPorPeriodo(LocalDate desde, LocalDate hasta) {
    return pedidoService.listarTodos().stream()
        .filter(p -> !p.getFecha().isBefore(desde) && !p.getFecha().isAfter(hasta))
        .sorted(Comparator.comparing(Pedido::getFecha).reversed())
        .collect(Collectors.toList());
  }

  /**
   * Productos más vendidos en un período. Retorna lista de mapas: [{ producto, cantidadVendida },
   * ...] ordenado descendente.
   */
  public List<Map<String, Object>> productosMasVendidos(LocalDate desde, LocalDate hasta) {
    Map<Integer, Integer> ventas = new LinkedHashMap<>();
    Map<Integer, Producto> productos = new HashMap<>();

    for (Pedido pedido : pedidoService.listarTodos()) {
      if (pedido.getFecha().isBefore(desde) || pedido.getFecha().isAfter(hasta)) {
        continue;
      }
      for (LineaPedido linea : pedido.getLineas()) {
        Producto p = linea.getProducto();
        ventas.merge(p.getId(), linea.getCantidad(), Integer::sum);
        productos.put(p.getId(), p);
      }
    }

    return ventas.entrySet().stream()
        .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
        .map(
            entry -> {
              Map<String, Object> item = new LinkedHashMap<>();
              Producto p = productos.get(entry.getKey());
              item.put("producto", p.getNombre());
              item.put("productoId", p.getId());
              item.put("categoria", p.getCategoria().getNombre());
              item.put("cantidadVendida", entry.getValue());
              return item;
            })
        .collect(Collectors.toList());
  }

  /** Rotación por categoría: cuántas unidades se vendieron de cada categoría. */
  public Map<String, Integer> rotacionPorCategoria(LocalDate desde, LocalDate hasta) {
    Map<String, Integer> rotacion = new LinkedHashMap<>();

    for (Pedido pedido : pedidoService.listarTodos()) {
      if (pedido.getFecha().isBefore(desde) || pedido.getFecha().isAfter(hasta)) {
        continue;
      }
      for (LineaPedido linea : pedido.getLineas()) {
        String cat = linea.getProducto().getCategoria().getNombre();
        rotacion.merge(cat, linea.getCantidad(), Integer::sum);
      }
    }

    // Ordenar descendente por cantidad
    return rotacion.entrySet().stream()
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .collect(
            Collectors.toMap(
                Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
  }

  /** Productos filtrados (para exportar lo que se ve en pantalla). */
  public List<Producto> productosConFiltros(
      String q,
      Categoria categoria,
      Double precioMin,
      Double precioMax,
      Integer stockMin,
      Integer stockMax) {
    if (q == null
        && categoria == null
        && precioMin == null
        && precioMax == null
        && stockMin == null
        && stockMax == null) {
      return productoService.listarTodos();
    }
    return productoService.buscarConFiltros(q, categoria, precioMin, precioMax, stockMin, stockMax);
  }

  /** Resumen general para dashboard. */
  public Map<String, Object> resumenGeneral() {
    List<Producto> todos = productoService.listarTodos();
    long stockCritico = todos.stream().filter(p -> p.getStock() <= 5).count();
    BigDecimal valorizacion =
        todos.stream()
            .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getStock())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    Map<String, Object> resumen = new LinkedHashMap<>();
    resumen.put("totalProductos", todos.size());
    resumen.put("totalPedidos", pedidoService.obtenerCantidad());
    resumen.put("stockCritico", stockCritico);
    resumen.put("valorizacionTotal", valorizacion);
    return resumen;
  }
}
