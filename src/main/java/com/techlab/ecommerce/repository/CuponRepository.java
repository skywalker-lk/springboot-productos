package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.cupon.Cupon;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuponRepository extends JpaRepository<Cupon, Integer> {
  Optional<Cupon> findByCodigoIgnoreCase(String codigo);
}
