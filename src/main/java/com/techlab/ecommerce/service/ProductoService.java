package com.techlab.ecommerce.service;

import com.techlab.ecommerce.config.CurrentUser;
import com.techlab.ecommerce.controller.dto.ActualizacionMasivaRequest;
import com.techlab.ecommerce.controller.dto.ActualizacionResponse;
import com.techlab.ecommerce.controller.dto.ImportacionProductoRequest;
import com.techlab.ecommerce.controller.dto.ImportacionResponse;
import com.techlab.ecommerce.exception.ProductoNoEncontradoException;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.ProductoRepository;
import com.techlab.ecommerce.util.Validador;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Capa de servicio: contiene la lógica de negocio del sistema. Delega la persistencia a
 * ProductoRepository (Spring Data JPA).
 */
@Service
public class ProductoService {

  private final ProductoRepository productoRepository;
  private final AuditoriaService auditoriaService;

  public ProductoService(ProductoRepository productoRepository, AuditoriaService auditoriaService) {
    this.productoRepository = productoRepository;
    this.auditoriaService = auditoriaService;
  }

  @Transactional
  public Producto guardar(Producto p) {
    Validador.validarNombre(p.getNombre());
    Validador.validarPrecio(p.getPrecio());
    Validador.validarStock(p.getStock());
    Producto saved = productoRepository.save(p);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "CREAR_PRODUCTO",
        "Producto: " + saved.getNombre() + " ($" + saved.getPrecio() + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    return saved;
  }

  /**
   * Importación masiva de productos desde una lista de requests. Cada producto se valida
   * individualmente. Los errores no detienen el proceso.
   */
  @Transactional
  public ImportacionResponse importarMasivo(
      List<ImportacionProductoRequest> requests, CategoriaService categoriaService) {

    ImportacionResponse response = new ImportacionResponse();
    List<Producto> guardar = new ArrayList<>();

    for (int i = 0; i < requests.size(); i++) {
      ImportacionProductoRequest req = requests.get(i);
      try {
        if (req.getNombre() == null || req.getNombre().isBlank()) {
          response.addError(i + 1, "El nombre es obligatorio");
          continue;
        }
        Validador.validarPrecio(req.getPrecio());
        Validador.validarStock(req.getStock());

        Categoria categoria = null;
        if (req.getCategoria() != null && !req.getCategoria().isBlank()) {
          categoria = categoriaService.obtenerCategoriaPorTipo(req.getCategoria());
        }

        Producto p = new Producto(req.getNombre(), req.getPrecio(), req.getStock(), categoria);
        guardar.add(p);
      } catch (Exception e) {
        response.addError(i + 1, e.getMessage());
      }
    }

    if (!guardar.isEmpty()) {
      productoRepository.saveAll(guardar);
    }

    response.setTotal(requests.size());
    response.setCreados(guardar.size());
    return response;
  }

  public List<Producto> listarTodos() {
    return productoRepository.findAll();
  }

  public Page<Producto> listarPaginado(Pageable pageable) {
    return productoRepository.findAll(pageable);
  }

  public List<Producto> buscarPorNombre(String nombre) {
    return productoRepository.findByNombreContainingIgnoreCase(nombre);
  }

  public Producto obtenerPorId(int id) {
    return productoRepository
        .findById(id)
        .orElseThrow(
            () -> new ProductoNoEncontradoException("No se encontró un producto con id " + id));
  }

  /**
   * Busca un producto por nombre exacto (case-insensitive). Útil para matchear archivos de imágenes
   * con productos por nombre.
   */
  public Optional<Producto> buscarPorNombreExacto(String nombre) {
    return productoRepository.findByNombreIgnoreCase(nombre);
  }

  @Transactional
  public Producto actualizar(int id, Producto datos) {
    Producto p = obtenerPorId(id);

    Validador.validarNombre(datos.getNombre());
    // Solo actualizar precio/stock si vienen con valor distinto de cero
    // (el frontend puede enviar datos parciales: solo nombre + categoria)
    Validador.validarPrecio(datos.getPrecio());
    Validador.validarStock(datos.getStock());

    p.setNombre(datos.getNombre());
    if (datos.getPrecio() != null && datos.getPrecio().compareTo(BigDecimal.ZERO) != 0)
      p.setPrecio(datos.getPrecio());
    if (datos.getStock() != null && datos.getStock() != 0) p.setStock(datos.getStock());
    if (datos.getCategoria() != null) {
      p.setCategoria(datos.getCategoria());
    }

    Producto updated = productoRepository.save(p);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ACTUALIZAR_PRODUCTO",
        "Producto: " + updated.getNombre() + " (id " + id + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    return updated;
  }

  @Transactional
  public void eliminar(int id) {
    Producto p = obtenerPorId(id);
    productoRepository.delete(p);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ELIMINAR_PRODUCTO",
        "Producto: " + p.getNombre() + " (id " + id + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
  }

  public List<Producto> buscarConFiltros(
      String q,
      Categoria categoria,
      Double precioMin,
      Double precioMax,
      Integer stockMin,
      Integer stockMax) {
    return productoRepository.buscarConFiltros(
        q, categoria, precioMin, precioMax, stockMin, stockMax);
  }

  public Page<Producto> buscarConFiltrosPaginado(
      String q,
      Categoria categoria,
      Double precioMin,
      Double precioMax,
      Integer stockMin,
      Integer stockMax,
      Pageable pageable) {
    return productoRepository.buscarConFiltrosPaginado(
        q, categoria, precioMin, precioMax, stockMin, stockMax, pageable);
  }

  public List<Producto> listarPorPrecio(BigDecimal precioMin, BigDecimal precioMax) {
    return productoRepository.findByPrecioBetween(precioMin, precioMax);
  }

  public List<Producto> listarPorCategoria(Categoria categoria) {
    return productoRepository.findByCategoria(categoria);
  }

  @Transactional
  public List<Producto> actualizarPrecioPorCategoria(Categoria categoria, double porcentaje) {
    if (categoria == null) {
      throw new IllegalArgumentException("La categoría es obligatoria.");
    }
    if (porcentaje <= 0) {
      throw new IllegalArgumentException("El porcentaje debe ser mayor que cero.");
    }

    List<Producto> productos = productoRepository.findByCategoria(categoria);
    for (Producto p : productos) {
      BigDecimal nuevoPrecio = p.getPrecio().multiply(BigDecimal.valueOf(porcentaje));
      Validador.validarPrecio(nuevoPrecio);
      p.setPrecio(nuevoPrecio);
    }
    return productoRepository.saveAll(productos);
  }

  @Transactional
  public List<Producto> actualizarPreciosMasivos(List<Producto> actualizaciones) {
    if (actualizaciones == null || actualizaciones.isEmpty()) {
      throw new IllegalArgumentException("La lista de actualizaciones no puede estar vacía.");
    }

    List<Producto> actualizados = new ArrayList<>();
    for (Producto actualizacion : actualizaciones) {
      Producto existente = obtenerPorId(actualizacion.getId());
      Validador.validarPrecio(actualizacion.getPrecio());
      existente.setPrecio(actualizacion.getPrecio());
      actualizados.add(existente);
    }
    return productoRepository.saveAll(actualizados);
  }

  /** Actualización masiva de precio y/o stock desde una lista de requests. */
  @Transactional
  public ActualizacionResponse actualizarMasivo(List<ActualizacionMasivaRequest> requests) {
    ActualizacionResponse response = new ActualizacionResponse();
    List<Producto> guardar = new ArrayList<>();

    for (int i = 0; i < requests.size(); i++) {
      ActualizacionMasivaRequest req = requests.get(i);
      try {
        Producto existente = obtenerPorId(req.getId());

        if (req.getPrecio() != null) {
          Validador.validarPrecio(req.getPrecio());
          existente.setPrecio(req.getPrecio());
        }
        if (req.getStock() != null) {
          Validador.validarStock(req.getStock());
          existente.setStock(req.getStock());
        }

        guardar.add(existente);
      } catch (Exception e) {
        response.addError(i + 1, "ID " + req.getId() + ": " + e.getMessage());
      }
    }

    if (!guardar.isEmpty()) {
      productoRepository.saveAll(guardar);
    }

    response.setTotal(requests.size());
    response.setActualizados(guardar.size());
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ACTUALIZAR_MASIVO",
        guardar.size() + " productos actualizados",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    return response;
  }
}
