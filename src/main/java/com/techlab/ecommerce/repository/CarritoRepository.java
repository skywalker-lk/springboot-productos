package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.carrito.Carrito;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

  Optional<Carrito> findByCliente(String cliente);
}
