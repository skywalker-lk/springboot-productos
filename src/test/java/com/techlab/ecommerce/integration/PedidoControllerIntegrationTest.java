package com.techlab.ecommerce.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.controller.dto.PedidoListResponse;
import com.techlab.ecommerce.model.pedidos.Pedido;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/** Tests de integración para PedidosController. Verifica CRUD de pedidos sobre H2 real. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Sql(scripts = "/clean.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class PedidoControllerIntegrationTest {

  @LocalServerPort private int port;

  private WebClient client;

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
  void crearPedido() {
    int p1 = crearProducto("Arroz", 1200, 50);
    int p2 = crearProducto("Fideos", 800, 30);

    var response =
        client
            .post()
            .uri("/pedidos")
            .bodyValue(
                Map.of(
                    "idsProducto", List.of(p1, p2),
                    "cantidades", List.of(2, 3),
                    "nombreCliente", "Juan Pérez"))
            .retrieve()
            .toEntity(Pedido.class)
            .block();

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    Pedido pedido = response.getBody();
    assertNotNull(pedido);
    assertEquals("Juan Pérez", pedido.getCliente());
    assertEquals("Confirmado", pedido.getEstado());
    assertNotNull(pedido.getFecha());
    assertEquals(2, pedido.getLineas().size());
    assertEquals(new BigDecimal("4800.00"), pedido.getTotal());
  }

  @Test
  void crearPedido_conClienteMostradorPorDefecto() {
    int productoId = crearProducto("Arroz", 1200, 50);

    var status =
        client
            .post()
            .uri("/pedidos")
            .bodyValue(
                Map.of(
                    "idsProducto", List.of(productoId),
                    "cantidades", List.of(1)))
            .exchangeToMono(resp -> Mono.just(resp.statusCode()))
            .block();

    assertEquals(HttpStatus.BAD_REQUEST, status);
  }

  @Test
  void listarPedidos() {
    int p1 = crearProducto("Arroz", 1200, 50);
    int p2 = crearProducto("Fideos", 800, 30);

    client
        .post()
        .uri("/pedidos")
        .bodyValue(
            Map.of("idsProducto", List.of(p1), "cantidades", List.of(2), "nombreCliente", "Cliente A"))
        .retrieve()
        .toEntity(Pedido.class)
        .block();
    client
        .post()
        .uri("/pedidos")
        .bodyValue(
            Map.of("idsProducto", List.of(p2), "cantidades", List.of(5), "nombreCliente", "Cliente B"))
        .retrieve()
        .toEntity(Pedido.class)
        .block();

    var response =
        client.get().uri("/pedidos").retrieve().toEntity(PedidoListResponse.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    PedidoListResponse body = response.getBody();
    assertNotNull(body);
    assertEquals(2, body.getPedidos().size());
  }

  @Test
  void obtenerPedidoPorId() {
    int p1 = crearProducto("Arroz", 1200, 50);
    int p2 = crearProducto("Fideos", 800, 30);

    var created =
        client
            .post()
            .uri("/pedidos")
            .bodyValue(
                Map.of(
                    "idsProducto",
                    List.of(p1, p2),
                    "cantidades",
                    List.of(1, 1),
                    "nombreCliente",
                    "Test"))
            .retrieve()
            .toEntity(Pedido.class)
            .block();
    assertNotNull(created.getBody());
    int pedidoId = created.getBody().getId();

    var response =
        client.get().uri("/pedidos/{id}", pedidoId).retrieve().toEntity(Pedido.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Pedido pedido = response.getBody();
    assertNotNull(pedido);
    assertEquals(pedidoId, pedido.getId());
    assertEquals("Test", pedido.getCliente());
    assertEquals(new BigDecimal("2000.00"), pedido.getTotal());
  }

  @Test
  void actualizarPedido() {
    int productoId = crearProducto("Arroz", 1200, 50);

    var created =
        client
            .post()
            .uri("/pedidos")
            .bodyValue(
                Map.of(
                    "idsProducto",
                    List.of(productoId),
                    "cantidades",
                    List.of(2),
                    "nombreCliente",
                    "Original"))
            .retrieve()
            .toEntity(Pedido.class)
            .block();
    assertNotNull(created.getBody());
    int pedidoId = created.getBody().getId();

    var response =
        client
            .put()
            .uri("/pedidos/{id}", pedidoId)
            .bodyValue(Map.of("nombreCliente", "Modificado", "estado", "Enviado"))
            .retrieve()
            .toEntity(Pedido.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Pedido pedido = response.getBody();
    assertNotNull(pedido);
    assertEquals("Modificado", pedido.getCliente());
    assertEquals("Enviado", pedido.getEstado());
  }

  @Test
  void eliminarPedido() {
    int productoId = crearProducto("Arroz", 1200, 50);

    var created =
        client
            .post()
            .uri("/pedidos")
            .bodyValue(
                Map.of(
                    "idsProducto",
                    List.of(productoId),
                    "cantidades",
                    List.of(1),
                    "nombreCliente",
                    "Eliminar"))
            .retrieve()
            .toEntity(Pedido.class)
            .block();
    assertNotNull(created.getBody());
    Object createdId = created.getBody().getId();

    client.delete().uri("/pedidos/{id}", createdId).retrieve().toBodilessEntity().block();

    try {
      client.get().uri("/pedidos/{id}", createdId).retrieve().toEntity(Pedido.class).block();
      fail("Debió lanzar excepción al buscar pedido eliminado");
    } catch (Exception e) {
    }
  }

  @Test
  void listarPedidosPorFecha() {
    int p1 = crearProducto("Arroz", 1200, 50);

    client
        .post()
        .uri("/pedidos")
        .bodyValue(
            Map.of("idsProducto", List.of(p1), "cantidades", List.of(1), "nombreCliente", "Test"))
        .retrieve()
        .toEntity(Pedido.class)
        .block();

    var response =
        client
            .get()
            .uri("/pedidos?desde=2024-01-01&hasta=2030-12-31")
            .retrieve()
            .toEntity(PedidoListResponse.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    PedidoListResponse body = response.getBody();
    assertNotNull(body);
    assertEquals(1, body.getPedidos().size());
  }
}
