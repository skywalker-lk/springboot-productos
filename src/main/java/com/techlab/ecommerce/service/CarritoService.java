package com.techlab.ecommerce.service;

import com.techlab.ecommerce.exception.CantidadInvalidaException;
import com.techlab.ecommerce.exception.StockInsuficienteException;
import com.techlab.ecommerce.model.carrito.Carrito;
import com.techlab.ecommerce.model.carrito.CarritoItem;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.CarritoRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CarritoService {

  private final CarritoRepository carritoRepository;
  private final ProductoService productoService;
  private final PedidoService pedidoService;

  public CarritoService(
      CarritoRepository carritoRepository,
      ProductoService productoService,
      PedidoService pedidoService) {
    this.carritoRepository = carritoRepository;
    this.productoService = productoService;
    this.pedidoService = pedidoService;
  }

  public Carrito obtenerCarrito(String cliente) {
    String key = validarCliente(cliente);
    return carritoRepository
        .findByCliente(key)
        .orElseGet(() -> carritoRepository.save(new Carrito(key)));
  }

  @Transactional
  public Carrito agregarProducto(String cliente, int productoId, int cantidad) {
    String key = validarCliente(cliente);
    validarCantidad(cantidad);

    Producto producto = productoService.obtenerPorId(productoId);
    Carrito carrito = obtenerCarrito(key);

    // Calcular la cantidad total que quedaría en el carrito para este producto
    int cantidadActual =
        carrito.getItems().stream()
            .filter(item -> item.getProducto().getId() == productoId)
            .mapToInt(CarritoItem::getCantidad)
            .sum();
    int cantidadTotal = cantidadActual + cantidad;

    if (cantidadTotal > producto.getStock()) {
      throw new StockInsuficienteException(
          "Stock insuficiente para '"
              + producto.getNombre()
              + "'. Disponible: "
              + producto.getStock()
              + ", solicitado: "
              + cantidadTotal);
    }

    carrito.getItems().stream()
        .filter(item -> item.getProducto().getId() == productoId)
        .findFirst()
        .ifPresentOrElse(
            item -> item.setCantidad(item.getCantidad() + cantidad),
            () -> carrito.agregarItem(new CarritoItem(producto, cantidad)));

    carrito.calcularTotal();
    return carritoRepository.save(carrito);
  }

  @Transactional
  public Carrito actualizarCantidad(String cliente, int productoId, int cantidad) {
    String key = validarCliente(cliente);
    Carrito carrito = obtenerCarrito(key);
    validarCantidad(cantidad);

    Producto producto = productoService.obtenerPorId(productoId);

    if (cantidad > producto.getStock()) {
      throw new StockInsuficienteException(
          "Stock insuficiente para '"
              + producto.getNombre()
              + "'. Disponible: "
              + producto.getStock()
              + ", solicitado: "
              + cantidad);
    }

    CarritoItem item =
        carrito.getItems().stream()
            .filter(i -> i.getProducto().getId() == productoId)
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("El producto no está en el carrito."));

    item.setCantidad(cantidad);
    carrito.calcularTotal();
    return carritoRepository.save(carrito);
  }

  @Transactional
  public void eliminarProducto(String cliente, int productoId) {
    String key = validarCliente(cliente);
    Carrito carrito = obtenerCarrito(key);
    carrito.getItems().removeIf(item -> item.getProducto().getId() == productoId);
    carrito.calcularTotal();
    carritoRepository.save(carrito);
  }

  @Transactional
  public void vaciarCarrito(String cliente) {
    String key = validarCliente(cliente);
    Carrito carrito = obtenerCarrito(key);
    carrito.vaciar();
    carritoRepository.save(carrito);
  }

  @Transactional
  public Pedido checkout(String cliente, String medioPago) {
    String key = validarCliente(cliente);
    Carrito carrito = obtenerCarrito(key);

    if (carrito.getItems().isEmpty()) {
      throw new IllegalArgumentException("El carrito está vacío.");
    }

    List<Integer> idsProducto =
        carrito.getItems().stream()
            .map(item -> item.getProducto().getId())
            .collect(Collectors.toList());

    List<Integer> cantidades =
        carrito.getItems().stream().map(CarritoItem::getCantidad).collect(Collectors.toList());

    Pedido pedido = pedidoService.crearPedido(idsProducto, cantidades, cliente);
    if (medioPago != null && !medioPago.trim().isEmpty()) {
      pedido.setMedioPago(medioPago.trim());
    }
    vaciarCarrito(key);
    return pedido;
  }

  private String validarCliente(String cliente) {
    if (cliente == null || cliente.trim().isEmpty()) {
      throw new IllegalArgumentException("El nombre del cliente es obligatorio.");
    }
    return cliente.trim();
  }

  private void validarCantidad(int cantidad) {
    if (cantidad <= 0) {
      throw new CantidadInvalidaException("La cantidad debe ser mayor a cero.");
    }
  }
}
