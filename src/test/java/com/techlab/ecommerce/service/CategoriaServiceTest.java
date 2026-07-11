package com.techlab.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.techlab.ecommerce.exception.CategoriaNoEncontradoException;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.categorias.SubCategoria;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.CategoriaRepository;
import com.techlab.ecommerce.repository.SubCategoriaRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

  @Mock private SubCategoriaRepository subCategoriaRepository;

  @Mock private CategoriaRepository categoriaRepository;

  @InjectMocks private CategoriaService categoriaService;

  @Test
  void agregarSubCategoria_yListarTodas_devuelveListaConElemento() {
    Categoria bebidas = new Categoria("BEBIDAS", "Bebidas", "");
    when(subCategoriaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(subCategoriaRepository.findAll())
        .thenReturn(List.of(new SubCategoria("Yerba", "Bebida típica", bebidas)));

    categoriaService.agregarSubCategoria("Yerba", "Bebida típica", bebidas);

    List<SubCategoria> subCategorias = categoriaService.listarTodas();

    assertEquals(1, subCategorias.size());
    assertEquals("Yerba", subCategorias.get(0).getNombre());
  }

  @Test
  void buscarSubCategoriaPorNombre_noExiste_lanzaCategoriaNoEncontradoException() {
    when(subCategoriaRepository.findByNombre("NoExiste")).thenReturn(Optional.empty());

    assertThrows(
        CategoriaNoEncontradoException.class,
        () -> categoriaService.buscarSubCategoriaPorNombre("NoExiste"));
  }

  @Test
  void filtrarPorCategoria_devuelveSoloProductosDeLaCategoria() {
    Categoria bebidas = new Categoria("BEBIDAS", "Bebidas", "");
    Categoria almacen = new Categoria("ALMACEN", "Almacén", "");
    List<Producto> productos =
        List.of(
            new Producto("Mate", BigDecimal.valueOf(200), 5, bebidas),
            new Producto("Arroz", BigDecimal.valueOf(150), 10, almacen));

    List<Producto> filtrados = categoriaService.filtrarPorCategoria(productos, bebidas);

    assertEquals(1, filtrados.size());
    assertEquals("Mate", filtrados.get(0).getNombre());
  }
}
