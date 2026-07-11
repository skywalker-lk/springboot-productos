package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.categorias.Categoria;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

  Optional<Categoria> findByTipo(String tipo);

  Optional<Categoria> findByNombre(String nombre);
}
