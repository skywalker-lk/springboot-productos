package com.techlab.ecommerce.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.controller.dto.CategoriaDTO;
import com.techlab.ecommerce.controller.dto.CategoriaRequest;
import com.techlab.ecommerce.controller.dto.ProductoListResponse;
import com.techlab.ecommerce.model.productos.Producto;
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

/**
 * Tests de integración para ProductoController. Cada test arranca con datos limpios (clean.sql)
 * sobre H2 real.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Sql(scripts = "/clean.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class ProductoControllerIntegrationTest {

  @LocalServerPort private int port;

  private WebClient client;

  @BeforeEach
  void setUp() {
    client = WebClient.create("http://localhost:" + port);

    CategoriaRequest req = new CategoriaRequest();
    req.setTipo("ALMACEN");
    req.setNombre("Almacén");
    req.setDescripcion("Productos de almacén");
    client.post().uri("/categorias").bodyValue(req).retrieve().toEntity(CategoriaDTO.class).block();
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> crearProducto(
      String nombre, double precio, int stock, String categoria) {
    Map<String, Object> body =
        Map.of(
            "nombre", nombre,
            "precio", precio,
            "stock", stock,
            "categoria", categoria);
    return client
        .post()
        .uri("/productos")
        .bodyValue(body)
        .retrieve()
        .toEntity(Map.class)
        .block()
        .getBody();
  }

  @Test
  void crearYListarProductos() {
    crearProducto("Arroz", 1200, 50, "ALMACEN");
    crearProducto("Fideos", 800, 30, "ALMACEN");
    crearProducto("Harina", 600, 20, "ALMACEN");

    var response =
        client.get().uri("/productos").retrieve().toEntity(ProductoListResponse.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    ProductoListResponse body = response.getBody();
    assertNotNull(body);
    assertEquals(3, body.getTotal());
    assertEquals(3, body.getProductos().size());
  }

  @Test
  void obtenerProductoPorId() {
    Map<String, Object> creado = crearProducto("Arroz", 1200, 50, "ALMACEN");
    int id = ((Number) creado.get("_id")).intValue();

    var response =
        client.get().uri("/productos/{id}", id).retrieve().toEntity(Producto.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Producto producto = response.getBody();
    assertNotNull(producto);
    assertEquals("Arroz", producto.getNombre());
    assertEquals(new BigDecimal("1200.00"), producto.getPrecio());
    assertEquals(50, producto.getStock());
  }

  @Test
  void actualizarProducto() {
    Map<String, Object> creado = crearProducto("Arroz", 1200, 50, "ALMACEN");
    int id = ((Number) creado.get("_id")).intValue();

    Map<String, Object> update = Map.of("nombre", "Arroz Integral", "precio", 1500);
    var response =
        client
            .put()
            .uri("/productos/{id}", id)
            .bodyValue(update)
            .retrieve()
            .toEntity(Producto.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    Producto actualizado = response.getBody();
    assertNotNull(actualizado);
    assertEquals("Arroz Integral", actualizado.getNombre());
    assertEquals(BigDecimal.valueOf(1500), actualizado.getPrecio());
  }

  @Test
  void eliminarProducto() {
    Map<String, Object> creado = crearProducto("Arroz", 1200, 50, "ALMACEN");
    int id = ((Number) creado.get("_id")).intValue();

    client.delete().uri("/productos/{id}", id).retrieve().toBodilessEntity().block();

    var status =
        client
            .get()
            .uri("/productos/{id}", id)
            .exchangeToMono(resp -> Mono.just(resp.statusCode()))
            .block();

    assertEquals(HttpStatus.NOT_FOUND, status);
  }

  @Test
  void buscarPorNombre() {
    crearProducto("Café molido", 4500, 10, "ALMACEN");
    crearProducto("Café en grano", 6000, 5, "ALMACEN");
    crearProducto("Arroz", 1200, 50, "ALMACEN");

    var response =
        client.get().uri("/productos/nombre/Café").retrieve().toEntity(List.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    List<?> resultados = response.getBody();
    assertNotNull(resultados);
    assertEquals(2, resultados.size());
  }

  @Test
  void listarConFiltros() {
    crearProducto("Café molido", 4500, 10, "ALMACEN");
    crearProducto("Arroz", 1200, 50, "ALMACEN");
    crearProducto("Fideos", 800, 5, "ALMACEN");

    var response =
        client
            .get()
            .uri("/productos?precioMin=1000&precioMax=5000")
            .retrieve()
            .toEntity(ProductoListResponse.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    ProductoListResponse body = response.getBody();
    assertNotNull(body);
    assertEquals(2, body.getTotal());
  }

  @Test
  void obtenerProductoInexistente() {
    var status =
        client
            .get()
            .uri("/productos/99999")
            .exchangeToMono(resp -> Mono.just(resp.statusCode()))
            .block();

    assertEquals(HttpStatus.NOT_FOUND, status);
  }

  @Test
  void listarProductosConLimite() {
    crearProducto("Prod1", 100, 10, "ALMACEN");
    crearProducto("Prod2", 200, 20, "ALMACEN");
    crearProducto("Prod3", 300, 30, "ALMACEN");
    crearProducto("Prod4", 400, 40, "ALMACEN");
    crearProducto("Prod5", 500, 50, "ALMACEN");

    var response =
        client
            .get()
            .uri("/productos?limite=3")
            .retrieve()
            .toEntity(ProductoListResponse.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    ProductoListResponse body = response.getBody();
    assertNotNull(body);
    assertEquals(5, body.getTotal());
    assertEquals(3, body.getProductos().size());
  }
}
