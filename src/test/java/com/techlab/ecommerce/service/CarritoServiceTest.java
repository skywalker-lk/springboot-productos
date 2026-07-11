package com.techlab.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.techlab.ecommerce.exception.CantidadInvalidaException;
import com.techlab.ecommerce.model.carrito.Carrito;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.CarritoRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CarritoServiceTest {

  @Mock private CarritoRepository carritoRepository;

  @Mock private ProductoService productoService;

  @Mock private PedidoService pedidoService;

  @InjectMocks private CarritoService carritoService;

  private Producto cafe;

  @BeforeEach
  void setUp() {
    cafe =
        new Producto("Café", BigDecimal.valueOf(150), 10, new Categoria("BEBIDAS", "Bebidas", ""));
    cafe.setId(1);
  }

  @Test
  void agregarProducto_alCarrito_actualizaTotalEItems() {
    when(productoService.obtenerPorId(1)).thenReturn(cafe);
    when(carritoRepository.findByCliente("Juan")).thenReturn(Optional.empty());
    when(carritoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var carrito = carritoService.agregarProducto("Juan", 1, 2);

    assertNotNull(carrito);
    verify(carritoRepository, times(2)).save(any());
  }

  @Test
  void agregarProducto_cantidadInvalida_lanzaExcepcion() {
    assertThrows(
        CantidadInvalidaException.class, () -> carritoService.agregarProducto("Lucas", 1, 0));
  }

  @Test
  void checkout_conCarritoVacio_lanzaExcepcion() {
    when(carritoRepository.findByCliente("Juan")).thenReturn(Optional.of(new Carrito("Juan")));

    assertThrows(IllegalArgumentException.class, () -> carritoService.checkout("Juan", "Tarjeta"));
  }
}
