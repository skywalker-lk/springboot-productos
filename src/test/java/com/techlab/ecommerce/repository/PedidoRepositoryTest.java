package com.techlab.ecommerce.repository;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.pedidos.LineaPedido;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

/**
 * Test de integración para PedidoRepository.
 *
 * <p>Prueba las relaciones @OneToMany / @ManyToOne y el cascade entre Pedido y LineaPedido.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PedidoRepositoryTest {

  @Autowired private PedidoRepository pedidoRepository;

  @Autowired private ProductoRepository productoRepository;

  @Autowired private CategoriaRepository categoriaRepository;

  private Producto cafe;
  private Producto yerba;

  @BeforeEach
  void setUp() {
    Categoria bebidas = categoriaRepository.save(new Categoria("BEBIDAS", "Bebidas", ""));
    cafe =
        productoRepository.save(new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas));
    yerba =
        productoRepository.save(new Producto("Yerba mate", BigDecimal.valueOf(3200), 5, bebidas));
  }

  @Test
  void guardarPedidoConLineas_generaIdYCascadeaLineas() {
    LineaPedido linea1 = new LineaPedido(2, cafe);
    LineaPedido linea2 = new LineaPedido(1, yerba);
    Pedido pedido = new Pedido("Cliente Test", List.of(linea1, linea2));

    Pedido guardado = pedidoRepository.save(pedido);

    assertNotNull(guardado.getId());
    assertTrue(guardado.getId() > 0);

    assertNotNull(guardado.getLineas());
    assertEquals(2, guardado.getLineas().size());
    guardado
        .getLineas()
        .forEach(
            linea -> {
              assertNotNull(linea.getId(), "Cada línea debería tener ID asignado por cascade ALL");
            });

    assertNotNull(guardado.getFecha());
    assertEquals(LocalDate.now(), guardado.getFecha());
  }

  @Test
  void recuperarPedidoConLineas_cargaLasLineasCorrectamente() {
    Pedido pedido = new Pedido("Ana", List.of(new LineaPedido(3, cafe), new LineaPedido(2, yerba)));
    pedido = pedidoRepository.save(pedido);
    int pedidoId = pedido.getId();

    Pedido recuperado = pedidoRepository.findById(pedidoId).orElseThrow();

    assertEquals("Ana", recuperado.getCliente());
    assertEquals(2, recuperado.getLineas().size());

    LineaPedido primeraLinea = recuperado.getLineas().get(0);
    assertNotNull(primeraLinea.getProducto());
    assertEquals("Café molido", primeraLinea.getProducto().getNombre());
    assertEquals(BigDecimal.valueOf(4500), primeraLinea.getPrecioUnitario());
  }

  @Test
  void eliminarPedido_eliminaEnCascadaLasLineas() {
    Pedido pedido = new Pedido("Pedro", List.of(new LineaPedido(1, cafe)));
    pedido = pedidoRepository.save(pedido);
    int pedidoId = pedido.getId();

    pedidoRepository.deleteById(pedidoId);

    assertTrue(pedidoRepository.findById(pedidoId).isEmpty());
  }

  @Test
  void buscarPedidosPorRangoDeFechas() {
    Pedido pedidoHoy = new Pedido("Cliente", List.of(new LineaPedido(1, cafe)));
    pedidoRepository.save(pedidoHoy);

    LocalDate inicio = LocalDate.now().minusDays(1);
    LocalDate fin = LocalDate.now().plusDays(1);

    List<Pedido> pedidos = pedidoRepository.findByFechaBetween(inicio, fin);

    assertFalse(pedidos.isEmpty());
    assertTrue(pedidos.stream().anyMatch(p -> p.getCliente().equals("Cliente")));
  }

  @Test
  void pedidoCalculaTotalCorrectamente() {
    Pedido pedido =
        new Pedido(
            "Cliente",
            List.of(
                new LineaPedido(2, cafe),
                new LineaPedido(3, yerba)
                ));

    assertEquals(new BigDecimal("18600.00"), pedido.getTotal());
  }
}
