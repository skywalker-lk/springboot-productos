package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.usuarios.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
  Optional<Usuario> findByEmail(String email);

  boolean existsByEmail(String email);
}
