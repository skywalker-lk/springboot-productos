package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.usuarios.Usuario;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

  List<Pedido> findByFechaBetween(LocalDate desde, LocalDate hasta);

  Page<Pedido> findByFechaBetween(LocalDate desde, LocalDate hasta, Pageable pageable);

  Page<Pedido> findByUsuario(Usuario usuario, Pageable pageable);
}
