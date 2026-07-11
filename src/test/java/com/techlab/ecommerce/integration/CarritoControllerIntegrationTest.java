package com.techlab.ecommerce.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.model.carrito.Carrito;
import com.techlab.ecommerce.model.pedidos.Pedido;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Tests de integración para CarritoController. Flujo completo: crear categoría → crear producto →
 * agregar al carrito → checkout.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Sql(scripts = "/clean.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class CarritoControllerIntegrationTest {

  @LocalServerPort private int port;

  private WebClient client;
  private static final String CLIENTE = "test-cliente";

  @BeforeEach
  void setUp() {
    client = WebClient.create("http://localhost:" + port);

    client
        .post()
        .uri("/categorias")
        .bodyValue(Map.of("tipo", "ALMACEN", "nombre", "Almacén", "descripcion", ""))
        .retrieve()
        .toBodilessEntity()
        .block();
  }

  private int crearProducto(String nombre, double precio, int stock) {
    @SuppressWarnings("unchecked")
    Map<String, Object> prod =
        client
            .post()
            .uri("/productos")
            .bodyValue(
                Map.of("nombre", nombre, "precio", precio, "stock", stock, "categoria", "ALMACEN"))
            .retrieve()
            .toEntity(Map.class)
            .block()
            .getBody();
    assertNotNull(prod);
    return ((Number) prod.get("_id")).intValue();
  }

  @Test
  void obtenerCarritoVacio() {
    var response =
        client.get().uri("/carrito/{cliente}", CLIENTE).retrieve().toEntity(Carrito.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Carrito carrito = response.getBody();
    assertNotNull(carrito);
    assertEquals(CLIENTE, carrito.getCliente());
    assertTrue(carrito.getItems().isEmpty());
    assertEquals(BigDecimal.ZERO, carrito.getTotal());
  }

  @Test
  void agregarProductoAlCarrito() {
    crearProducto("Arroz", 1200, 50);
    int productoId = crearProducto("Fideos", 800, 30);

    var response =
        client
            .post()
            .uri("/carrito/{cliente}/items", CLIENTE)
            .bodyValue(Map.of("productoId", productoId, "cantidad", 3))
            .retrieve()
            .toEntity(Carrito.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Carrito carrito = response.getBody();
    assertNotNull(carrito);
    assertEquals(1, carrito.getItems().size());
    assertEquals(productoId, carrito.getItems().get(0).getProducto().getId());
    assertEquals(3, carrito.getItems().get(0).getCantidad());
    assertEquals(new BigDecimal("2400.00"), carrito.getTotal());
  }

  @Test
  void actualizarCantidadEnCarrito() {
    int productoId = crearProducto("Arroz", 1200, 50);

    client
        .post()
        .uri("/carrito/{cliente}/items", CLIENTE)
        .bodyValue(Map.of("productoId", productoId, "cantidad", 2))
        .retrieve()
        .toEntity(Carrito.class)
        .block();

    var response =
        client
            .put()
            .uri("/carrito/{cliente}/items/{prodId}", CLIENTE, productoId)
            .bodyValue(Map.of("productoId", productoId, "cantidad", 5))
            .retrieve()
            .toEntity(Carrito.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Carrito carrito = response.getBody();
    assertNotNull(carrito);
    assertEquals(5, carrito.getItems().get(0).getCantidad());
    assertEquals(new BigDecimal("6000.00"), carrito.getTotal());
  }

  @Test
  void eliminarProductoDelCarrito() {
    int productoId = crearProducto("Arroz", 1200, 50);

    client
        .post()
        .uri("/carrito/{cliente}/items", CLIENTE)
        .bodyValue(Map.of("productoId", productoId, "cantidad", 2))
        .retrieve()
        .toEntity(Carrito.class)
        .block();

    client
        .delete()
        .uri("/carrito/{cliente}/items/{prodId}", CLIENTE, productoId)
        .retrieve()
        .toBodilessEntity()
        .block();

    var response =
        client.get().uri("/carrito/{cliente}", CLIENTE).retrieve().toEntity(Carrito.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Carrito carrito = response.getBody();
    assertNotNull(carrito);
    assertTrue(carrito.getItems().isEmpty());
    assertEquals(new BigDecimal("0.00"), carrito.getTotal());
  }

  @Test
  void vaciarCarrito() {
    int p1 = crearProducto("Arroz", 1200, 50);
    int p2 = crearProducto("Fideos", 800, 30);

    client
        .post()
        .uri("/carrito/{cliente}/items", CLIENTE)
        .bodyValue(Map.of("productoId", p1, "cantidad", 1))
        .retrieve()
        .toEntity(Carrito.class)
        .block();
    client
        .post()
        .uri("/carrito/{cliente}/items", CLIENTE)
        .bodyValue(Map.of("productoId", p2, "cantidad", 2))
        .retrieve()
        .toEntity(Carrito.class)
        .block();

    client.delete().uri("/carrito/{cliente}", CLIENTE).retrieve().toBodilessEntity().block();

    var response =
        client.get().uri("/carrito/{cliente}", CLIENTE).retrieve().toEntity(Carrito.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Carrito carrito = response.getBody();
    assertNotNull(carrito);
    assertTrue(carrito.getItems().isEmpty());
    assertEquals(new BigDecimal("0.00"), carrito.getTotal());
  }

  @Test
  void checkoutCompleto() {
    int productoId = crearProducto("Arroz", 1200, 50);

    client
        .post()
        .uri("/carrito/{cliente}/items", CLIENTE)
        .bodyValue(Map.of("productoId", productoId, "cantidad", 3))
        .retrieve()
        .toEntity(Carrito.class)
        .block();

    var response =
        client
            .post()
            .uri("/carrito/{cliente}/checkout", CLIENTE)
            .bodyValue(Map.of("medioPago", "EFECTIVO"))
            .retrieve()
            .toEntity(Pedido.class)
            .block();

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    Pedido pedido = response.getBody();
    assertNotNull(pedido);
    assertEquals("test-cliente", pedido.getCliente());
    assertNotNull(pedido.getLineas());
    assertEquals(1, pedido.getLineas().size());
    assertEquals(new BigDecimal("3600.00"), pedido.getTotal());
    assertEquals("EFECTIVO", pedido.getMedioPago());
  }

  @Test
  void checkoutSinMedioPagoUsaNoEspecificado() {
    int productoId = crearProducto("Arroz", 1200, 50);

    client
        .post()
        .uri("/carrito/{cliente}/items", CLIENTE)
        .bodyValue(Map.of("productoId", productoId, "cantidad", 1))
        .retrieve()
        .toEntity(Carrito.class)
        .block();

    var response =
        client
            .post()
            .uri("/carrito/{cliente}/checkout", CLIENTE)
            .bodyValue(Map.of())
            .retrieve()
            .toEntity(Pedido.class)
            .block();

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    Pedido pedido = response.getBody();
    assertNotNull(pedido);
    assertEquals("No especificado", pedido.getMedioPago());
  }
}
