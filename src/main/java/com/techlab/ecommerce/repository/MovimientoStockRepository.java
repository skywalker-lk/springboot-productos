package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.stock.MovimientoStock;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Integer> {

  List<MovimientoStock> findByProductoIdOrderByFechaDesc(Integer productoId);

  Page<MovimientoStock> findByProductoIdOrderByFechaDesc(Integer productoId, Pageable pageable);

  List<MovimientoStock> findByFechaBetweenOrderByFechaDesc(
      LocalDateTime desde, LocalDateTime hasta);

  Page<MovimientoStock> findByFechaBetweenOrderByFechaDesc(
      LocalDateTime desde, LocalDateTime hasta, Pageable pageable);
}
