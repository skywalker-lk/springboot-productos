package com.techlab.ecommerce.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.controller.dto.CategoriaDTO;
import com.techlab.ecommerce.controller.dto.CategoriaListResponse;
import com.techlab.ecommerce.controller.dto.CategoriaRequest;
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
 * Tests de integración para CategoriasController. Verifica CRUD de categorías y subcategorías sobre
 * H2 real.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Sql(scripts = "/clean.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class CategoriaControllerIntegrationTest {

  @LocalServerPort private int port;

  private WebClient client;

  @BeforeEach
  void setUp() {
    client = WebClient.create("http://localhost:" + port);
  }

  private CategoriaDTO crearCategoria(String tipo, String nombre, String descripcion) {
    CategoriaRequest req = new CategoriaRequest();
    req.setTipo(tipo);
    req.setNombre(nombre);
    req.setDescripcion(descripcion);
    return client
        .post()
        .uri("/categorias")
        .bodyValue(req)
        .retrieve()
        .toEntity(CategoriaDTO.class)
        .block()
        .getBody();
  }

  @Test
  void crearYListarCategorias() {
    crearCategoria("ALMACEN", "Almacén", "Productos de almacén");
    crearCategoria("BEBIDAS", "Bebidas", "Bebidas en general");
    crearCategoria("LACTEOS", "Lácteos", "Lácteos y derivados");

    var response =
        client.get().uri("/categorias").retrieve().toEntity(CategoriaListResponse.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    CategoriaListResponse body = response.getBody();
    assertNotNull(body);
    assertEquals(3, body.getTotal());
    assertEquals(3, body.getCategorias().size());
  }

  @Test
  void crearCategoria_y_obtenerPorTipo() {
    crearCategoria("BEBIDAS", "Bebidas", "Bebidas en general");

    var response =
        client.get().uri("/categorias/BEBIDAS").retrieve().toEntity(CategoriaDTO.class).block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    CategoriaDTO dto = response.getBody();
    assertNotNull(dto);
    assertEquals("BEBIDAS", dto.getTipo());
    assertEquals("Bebidas", dto.getNombre());
  }

  @Test
  void actualizarCategoria() {
    crearCategoria("ALMACEN", "Almacén", "Original");

    var listResp =
        client.get().uri("/categorias").retrieve().toEntity(CategoriaListResponse.class).block();
    assertNotNull(listResp.getBody());
    long realId = listResp.getBody().getCategorias().get(0).getId();

    CategoriaRequest update = new CategoriaRequest();
    update.setTipo("ALMACEN");
    update.setNombre("Almacén Actualizado");
    update.setDescripcion("Descripción actualizada");

    var response =
        client
            .put()
            .uri("/categorias/{id}", realId)
            .bodyValue(update)
            .retrieve()
            .toEntity(CategoriaDTO.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    CategoriaDTO dto = response.getBody();
    assertNotNull(dto);
    assertEquals("Almacén Actualizado", dto.getNombre());
    assertEquals("Descripción actualizada", dto.getDescripcion());
  }

  @Test
  void eliminarCategoria() {
    crearCategoria("ALMACEN", "Almacén", "Para eliminar");

    var listResp =
        client.get().uri("/categorias").retrieve().toEntity(CategoriaListResponse.class).block();
    assertNotNull(listResp.getBody());
    long realId = listResp.getBody().getCategorias().get(0).getId();

    client.delete().uri("/categorias/{id}", realId).retrieve().toBodilessEntity().block();

    var status =
        client
            .get()
            .uri("/categorias/ALMACEN")
            .exchangeToMono(resp -> Mono.just(resp.statusCode()))
            .block();

    assertEquals(HttpStatus.NOT_FOUND, status);
  }

  @Test
  void agregarSubCategoria() {
    crearCategoria("ALMACEN", "Almacén", "Prueba subcategoría");

    CategoriaRequest subReq = new CategoriaRequest();
    subReq.setTipo("DUMMY");
    subReq.setNombre("Galletitas");
    subReq.setDescripcion("Galletitas dulces y saladas");
    subReq.setCategoria("ALMACEN");

    client
        .post()
        .uri("/categorias/subcategorias")
        .bodyValue(subReq)
        .retrieve()
        .toBodilessEntity()
        .block();

    var response =
        client
            .get()
            .uri("/categorias/ALMACEN/subcategorias")
            .retrieve()
            .toEntity(List.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    List<?> subcategorias = response.getBody();
    assertNotNull(subcategorias);
    assertEquals(1, subcategorias.size());
  }

  @Test
  void obtenerSubCategoriaPorNombre() {
    crearCategoria("ALMACEN", "Almacén", "Prueba");

    CategoriaRequest subReq = new CategoriaRequest();
    subReq.setTipo("DUMMY");
    subReq.setNombre("Galletitas");
    subReq.setDescripcion("Ricas galletitas");
    subReq.setCategoria("ALMACEN");
    client
        .post()
        .uri("/categorias/subcategorias")
        .bodyValue(subReq)
        .retrieve()
        .toBodilessEntity()
        .block();

    @SuppressWarnings("unchecked")
    Map<String, Object> sub =
        client
            .get()
            .uri("/categorias/subcategorias/Galletitas")
            .retrieve()
            .toEntity(Map.class)
            .block()
            .getBody();

    assertNotNull(sub);
    assertEquals("Galletitas", sub.get("nombre"));
  }
}
