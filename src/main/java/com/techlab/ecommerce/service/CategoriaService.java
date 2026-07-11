package com.techlab.ecommerce.service;

import com.techlab.ecommerce.exception.CategoriaNoEncontradoException;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.categorias.SubCategoria;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.repository.CategoriaRepository;
import com.techlab.ecommerce.repository.SubCategoriaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Servicio para la gestión de categorías y subcategorías. */
@Service
public class CategoriaService {

  private final CategoriaRepository categoriaRepository;
  private final SubCategoriaRepository subCategoriaRepository;

  public CategoriaService(
      CategoriaRepository categoriaRepository, SubCategoriaRepository subCategoriaRepository) {
    this.categoriaRepository = categoriaRepository;
    this.subCategoriaRepository = subCategoriaRepository;
  }

  // ─── Categorías ───────────────────────────────────────────────

  public List<Categoria> listarCategorias() {
    return categoriaRepository.findAll();
  }

  public Categoria obtenerCategoriaPorTipo(String tipo) {
    return categoriaRepository
        .findByTipo(tipo)
        .orElseThrow(
            () ->
                new CategoriaNoEncontradoException(
                    "No se encontró una categoría con tipo '" + tipo + "'."));
  }

  public Categoria obtenerCategoriaPorId(Long id) {
    return categoriaRepository
        .findById(id)
        .orElseThrow(
            () ->
                new CategoriaNoEncontradoException(
                    "No se encontró una categoría con id " + id + "."));
  }

  @Transactional
  public Categoria crearCategoria(String tipo, String nombre, String descripcion) {
    Categoria categoria = new Categoria(tipo, nombre, descripcion);
    return categoriaRepository.save(categoria);
  }

  @Transactional
  public Categoria actualizarCategoria(Long id, String tipo, String nombre, String descripcion) {
    Categoria c = obtenerCategoriaPorId(id);
    c.setTipo(tipo);
    c.setNombre(nombre);
    c.setDescripcion(descripcion);
    return categoriaRepository.save(c);
  }

  @Transactional
  public void eliminarCategoria(Long id) {
    Categoria c = obtenerCategoriaPorId(id);
    categoriaRepository.delete(c);
  }

  // ─── Subcategorías ────────────────────────────────────────────

  @Transactional
  public void agregarSubCategoria(String nombre, String descripcion, Categoria categoria) {
    subCategoriaRepository.save(new SubCategoria(nombre, descripcion, categoria));
  }

  public List<SubCategoria> obtenerPorCategoria(Categoria categoria) {
    return subCategoriaRepository.findByCategoria(categoria);
  }

  /** Filtra una lista de productos por categoría. */
  public List<Producto> filtrarPorCategoria(List<Producto> productos, Categoria categoria) {
    return productos.stream().filter(p -> categoria.equals(p.getCategoria())).toList();
  }

  public List<SubCategoria> listarTodas() {
    return subCategoriaRepository.findAll();
  }

  public SubCategoria buscarSubCategoriaPorNombre(String nombre) {
    return subCategoriaRepository
        .findByNombre(nombre)
        .orElseThrow(
            () ->
                new CategoriaNoEncontradoException(
                    "No se encontró una subcategoría con nombre '" + nombre + "'."));
  }

  @Transactional
  public void eliminarSubCategoria(String nombre) {
    SubCategoria s = buscarSubCategoriaPorNombre(nombre);
    subCategoriaRepository.delete(s);
  }
}
