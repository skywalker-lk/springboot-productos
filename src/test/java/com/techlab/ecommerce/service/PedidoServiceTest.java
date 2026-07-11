package com.techlab.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.techlab.ecommerce.exception.StockInsuficienteException;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.PedidoRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

  @Mock private PedidoRepository pedidoRepository;

  @Mock private ProductoService productoService;

  @Mock private StockService stockService;

  @Mock private CuponService cuponService;

  @Mock private NotificacionService notificacionService;

  @Mock private AuditoriaService auditoriaService;

  @Mock private WebhookService webhookService;

  @InjectMocks private PedidoService pedidoService;

  private Producto cafe;
  private Producto yerba;

  @BeforeEach
  void setUp() {
    cafe =
        new Producto(
            "Café molido", BigDecimal.valueOf(4500), 10, new Categoria("BEBIDAS", "Bebidas", ""));
    cafe.setId(1);
    yerba =
        new Producto(
            "Yerba mate", BigDecimal.valueOf(3200), 5, new Categoria("BEBIDAS", "Bebidas", ""));
    yerba.setId(2);
  }

  @Test
  void crearPedido_debeDescontarStockSiHayDisponible() {
    when(productoService.obtenerPorId(1)).thenReturn(cafe);
    when(productoService.obtenerPorId(2)).thenReturn(yerba);
    when(pedidoRepository.save(any()))
        .thenAnswer(
            inv -> {
              Pedido p = inv.getArgument(0);
              p.setId(1);
              return p;
            });

    Pedido pedido = pedidoService.crearPedido(List.of(1, 2), List.of(2, 1), "Cliente Test");

    assertEquals("Cliente Test", pedido.getCliente());
    assertEquals(2, pedido.getLineas().size());
    verify(stockService, times(2))
        .registrarEgreso(anyInt(), anyInt(), anyString(), isNull(), anyInt());
  }

  @Test
  void crearPedido_conStockInsuficiente_lanzaExcepcion() {
    Producto cafe =
        new Producto(
            "Café molido", BigDecimal.valueOf(4500), 10, new Categoria("BEBIDAS", "Bebidas", ""));
    cafe.setId(1);

    when(productoService.obtenerPorId(1)).thenReturn(cafe);

    assertThrows(
        StockInsuficienteException.class,
        () -> pedidoService.crearPedido(List.of(1, 2), List.of(11, 1), "Cliente Test"));
  }

  @Test
  void crearPedido_conListasDistintasTamanos_lanzaIllegalArgumentException() {
    assertThrows(
        IllegalArgumentException.class,
        () -> pedidoService.crearPedido(List.of(1, 2), List.of(1), "Cliente Test"));
  }

  @Test
  void obtenerPorId_existente_retornaPedido() {
    Pedido pedido = new Pedido("Cliente Test", List.of());
    pedido.setId(10);

    when(pedidoRepository.findById(10)).thenReturn(Optional.of(pedido));

    assertEquals(10, pedidoService.obtenerPorId(10).getId());
  }
}
