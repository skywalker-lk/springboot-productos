package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.contacto.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactoRepository extends JpaRepository<Contacto, Integer> {}
