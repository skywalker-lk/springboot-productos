package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.categorias.SubCategoria;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubCategoriaRepository extends JpaRepository<SubCategoria, Integer> {

  Optional<SubCategoria> findByNombre(String nombre);

  List<SubCategoria> findByCategoria(Categoria categoria);
}
