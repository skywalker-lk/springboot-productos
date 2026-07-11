package com.techlab.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.techlab.ecommerce.exception.ProductoNoEncontradoException;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.ProductoRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

  @Mock private ProductoRepository productoRepository;

  @Mock private AuditoriaService auditoriaService;

  @InjectMocks private ProductoService productoService;

  @Test
  void guardarProducto_retornaProductoConIdAsignado() {
    Producto input =
        new Producto(
            "Galletitas", BigDecimal.valueOf(1500), 20, new Categoria("ALMACEN", "Almacén", ""));
    Producto saved =
        new Producto(
            "Galletitas", BigDecimal.valueOf(1500), 20, new Categoria("ALMACEN", "Almacén", ""));
    saved.setId(1);

    when(productoRepository.save(any())).thenReturn(saved);

    Producto resultado = productoService.guardar(input);

    assertNotNull(resultado);
    assertEquals(1, resultado.getId());
    assertEquals("Galletitas", resultado.getNombre());
    assertEquals(BigDecimal.valueOf(1500), resultado.getPrecio());
    verify(productoRepository).save(input);
  }

  @Test
  void buscarPorNombre_devuelveResultados() {
    when(productoRepository.findByNombreContainingIgnoreCase("caf"))
        .thenReturn(
            List.of(
                new Producto(
                    "Café molido",
                    BigDecimal.valueOf(4500),
                    10,
                    new Categoria("BEBIDAS", "Bebidas", ""))));

    List<Producto> resultados = productoService.buscarPorNombre("caf");

    assertEquals(1, resultados.size());
    assertEquals("Café molido", resultados.get(0).getNombre());
  }

  @Test
  void listarPorCategoria_devuelveProductosDeLaCategoria() {
    Categoria bebidas = new Categoria("BEBIDAS", "Bebidas", "");
    when(productoRepository.findByCategoria(bebidas))
        .thenReturn(
            List.of(
                new Producto("Café molido", BigDecimal.valueOf(4500), 10, bebidas),
                new Producto("Yerba mate", BigDecimal.valueOf(3200), 5, bebidas)));

    List<Producto> resultados = productoService.listarPorCategoria(bebidas);

    assertEquals(2, resultados.size());
  }

  @Test
  void listarPorPrecio_devuelveProductosDentroDelRango() {
    when(productoRepository.findByPrecioBetween(BigDecimal.valueOf(3000), BigDecimal.valueOf(5000)))
        .thenReturn(
            List.of(
                new Producto(
                    "Café molido",
                    BigDecimal.valueOf(4500),
                    10,
                    new Categoria("BEBIDAS", "Bebidas", ""))));

    List<Producto> resultados =
        productoService.listarPorPrecio(BigDecimal.valueOf(3000), BigDecimal.valueOf(5000));

    assertFalse(resultados.isEmpty());
    assertEquals(1, resultados.size());
  }

  @Test
  void obtenerPorId_inexistente_lanzaProductoNoEncontradoException() {
    when(productoRepository.findById(999)).thenReturn(Optional.empty());

    assertThrows(ProductoNoEncontradoException.class, () -> productoService.obtenerPorId(999));
  }

  @Test
  void actualizar_precio_y_verificar_llamada_al_repositorio() {
    Producto existente =
        new Producto(
            "Café molido", BigDecimal.valueOf(4500), 10, new Categoria("BEBIDAS", "Bebidas", ""));
    existente.setId(1);

    Producto datos =
        new Producto(
            "Café molido", BigDecimal.valueOf(5000), 10, new Categoria("BEBIDAS", "Bebidas", ""));
    datos.setId(1);

    when(productoRepository.findById(1)).thenReturn(Optional.of(existente));
    when(productoRepository.save(existente)).thenReturn(existente);

    Producto resultado = productoService.actualizar(1, datos);

    assertEquals(BigDecimal.valueOf(5000), resultado.getPrecio());
    verify(productoRepository).save(existente);
  }
}
