package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Producto;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

  List<Producto> findByNombreContainingIgnoreCase(String nombre);

  Optional<Producto> findByNombreIgnoreCase(String nombre);

  List<Producto> findByCategoria(Categoria categoria);

  List<Producto> findByPrecioBetween(BigDecimal precioMin, BigDecimal precioMax);

  List<Producto> findByStockLessThanEqual(int umbral);

  @Query(
      """
        SELECT p FROM Producto p
        WHERE (:q IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')))
        AND (:categoria IS NULL OR p.categoria = :categoria)
        AND (:precioMin IS NULL OR p.precio >= :precioMin)
        AND (:precioMax IS NULL OR p.precio <= :precioMax)
        AND (:stockMin IS NULL OR p.stock >= :stockMin)
        AND (:stockMax IS NULL OR p.stock <= :stockMax)
        ORDER BY p.nombre ASC
    """)
  List<Producto> buscarConFiltros(
      @Param("q") String q,
      @Param("categoria") Categoria categoria,
      @Param("precioMin") Double precioMin,
      @Param("precioMax") Double precioMax,
      @Param("stockMin") Integer stockMin,
      @Param("stockMax") Integer stockMax);

  @Query(
      value =
          """
        SELECT p FROM Producto p
        WHERE (:q IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')))
        AND (:categoria IS NULL OR p.categoria = :categoria)
        AND (:precioMin IS NULL OR p.precio >= :precioMin)
        AND (:precioMax IS NULL OR p.precio <= :precioMax)
        AND (:stockMin IS NULL OR p.stock >= :stockMin)
        AND (:stockMax IS NULL OR p.stock <= :stockMax)
        ORDER BY p.nombre ASC
    """,
      countQuery =
          """
        SELECT COUNT(p) FROM Producto p
        WHERE (:q IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')))
        AND (:categoria IS NULL OR p.categoria = :categoria)
        AND (:precioMin IS NULL OR p.precio >= :precioMin)
        AND (:precioMax IS NULL OR p.precio <= :precioMax)
        AND (:stockMin IS NULL OR p.stock >= :stockMin)
        AND (:stockMax IS NULL OR p.stock <= :stockMax)
    """)
  Page<Producto> buscarConFiltrosPaginado(
      @Param("q") String q,
      @Param("categoria") Categoria categoria,
      @Param("precioMin") Double precioMin,
      @Param("precioMax") Double precioMax,
      @Param("stockMin") Integer stockMin,
      @Param("stockMax") Integer stockMax,
      Pageable pageable);

  @Modifying
  @Query("UPDATE Producto p SET p.precio = p.precio * :porcentaje WHERE p.categoria = :categoria")
  int actualizarPrecioPorCategoria(
      @Param("categoria") Categoria categoria, @Param("porcentaje") double porcentaje);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT p FROM Producto p WHERE p.id = :id")
  Optional<Producto> findByIdConLock(@Param("id") int id);
}
