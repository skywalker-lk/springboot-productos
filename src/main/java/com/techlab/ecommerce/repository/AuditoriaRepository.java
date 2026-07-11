package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.auditoria.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {
  Page<Auditoria> findAllByOrderByTimestampDesc(Pageable pageable);
}
