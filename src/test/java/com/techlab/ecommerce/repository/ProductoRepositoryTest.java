package com.techlab.ecommerce.repository;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Bebida;
import com.techlab.ecommerce.model.productos.Comida;
import com.techlab.ecommerce.model.productos.Producto;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

/**
 * Test de integración para ProductoRepository. @DataJpaTest levanta una base H2 en memoria, crea
 * las tablas a partir de las entidades (@Entity) y configura los repositorios Spring Data JPA. No
 * levanta controllers ni services — solo la capa de persistencia.
 *
 * <p>Cada test corre dentro de una transacción que se rollbackea automáticamente al final. Así un
 * test no contamina al otro.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductoRepositoryTest {

  @Autowired private ProductoRepository productoRepository;

  @Autowired private CategoriaRepository categoriaRepository;

  private Categoria bebidas;
  private Categoria almacen;

  @BeforeEach
  void setUp() {
    bebidas = categoriaRepository.save(new Categoria("BEBIDAS", "Bebidas", ""));
    almacen = categoriaRepository.save(new Categoria("ALMACEN", "Almacén", ""));
  }

  @Test
  void guardarProducto_asignaIdAutoGenerado() {
    Producto p = new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas);

    Producto guardado = productoRepository.save(p);

    assertNotNull(guardado.getId(), "El ID debería generarse automáticamente");
    assertTrue(guardado.getId() > 0, "El ID debería ser positivo");
    assertEquals("Café molido", guardado.getNombre());
  }

  @Test
  void buscarPorNombre_devuelveResultadosCaseInsensitive() {
    productoRepository.save(new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas));
    productoRepository.save(new Producto("Yerba mate", BigDecimal.valueOf(3200), 5, bebidas));

    List<Producto> resultados = productoRepository.findByNombreContainingIgnoreCase("caf");

    assertEquals(1, resultados.size());
    assertEquals("Café molido", resultados.get(0).getNombre());
  }

  @Test
  void buscarPorCategoria_devuelveProductosDeLaCategoria() {
    productoRepository.save(new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas));
    productoRepository.save(new Producto("Arroz", BigDecimal.valueOf(1800), 20, almacen));

    List<Producto> resultados = productoRepository.findByCategoria(bebidas);

    assertEquals(1, resultados.size());
  }

  @Test
  void buscarPorRangoDePrecio_devuelveProductosDentroDelRango() {
    productoRepository.save(new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas));
    productoRepository.save(new Producto("Arroz", BigDecimal.valueOf(1800), 20, almacen));
    productoRepository.save(new Producto("Aceite", BigDecimal.valueOf(6700), 15, almacen));

    List<Producto> resultados =
        productoRepository.findByPrecioBetween(BigDecimal.valueOf(2000), BigDecimal.valueOf(5000));

    assertEquals(1, resultados.size());
    assertEquals("Café molido", resultados.get(0).getNombre());
  }

  @Test
  void buscarStockBajo_devuelveProductosConStockMenorOIgualAlUmbral() {
    productoRepository.save(new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas));
    productoRepository.save(new Producto("Yerba mate", BigDecimal.valueOf(3200), 1, bebidas));

    List<Producto> resultados = productoRepository.findByStockLessThanEqual(2);

    assertEquals(1, resultados.size());
    assertEquals("Yerba mate", resultados.get(0).getNombre());
  }

  @Test
  void herencia_guardaComidaYBebida_yLosRecupera() {
    Comida galletitas = new Comida("Galletitas", BigDecimal.valueOf(1500), 100, almacen, 200);
    Bebida cafe = new Bebida("Café molido", BigDecimal.valueOf(4500), 30, bebidas, 0.5f);
    Producto generico = new Producto("Producto genérico", BigDecimal.valueOf(100), 10, almacen);

    productoRepository.save(galletitas);
    productoRepository.save(cafe);
    productoRepository.save(generico);

    List<Producto> todos = productoRepository.findAll();
    assertEquals(3, todos.size());

    long comidas = todos.stream().filter(p -> p instanceof Comida).count();
    long bebidasCount = todos.stream().filter(p -> p instanceof Bebida).count();
    assertEquals(1, comidas, "Debería haber 1 Comida");
    assertEquals(1, bebidasCount, "Debería haber 1 Bebida");

    Producto recuperado = productoRepository.findById(generico.getId()).orElseThrow();
    assertNotNull(recuperado);
  }

  @Test
  void obtenerPorId_inexistente_retornaOptionalVacio() {
    java.util.Optional<Producto> resultado = productoRepository.findById(999);

    assertTrue(resultado.isEmpty(), "Producto inexistente debería retornar Optional.empty()");
  }

  @Test
  void eliminarProducto_loRemueveDeLaBase() {
    Producto p =
        productoRepository.save(new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas));
    int id = p.getId();

    productoRepository.delete(p);

    assertTrue(productoRepository.findById(id).isEmpty());
  }
}
