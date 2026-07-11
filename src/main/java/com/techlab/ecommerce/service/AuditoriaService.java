package com.techlab.ecommerce.service;

import com.techlab.ecommerce.model.auditoria.Auditoria;
import com.techlab.ecommerce.repository.AuditoriaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditoriaService {

  private final AuditoriaRepository repository;

  public AuditoriaService(AuditoriaRepository repository) {
    this.repository = repository;
  }

  public void registrar(
      String accion, String detalle, Integer usuarioId, String usuarioNombre, String endpoint) {
    Auditoria log = new Auditoria(accion, detalle, usuarioId, usuarioNombre, endpoint);
    repository.save(log);
  }

  public Page<Auditoria> listar(Pageable pageable) {
    return repository.findAllByOrderByTimestampDesc(pageable);
  }
}
