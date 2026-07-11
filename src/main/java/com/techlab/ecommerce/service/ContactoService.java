package com.techlab.ecommerce.service;

import com.techlab.ecommerce.exception.ContactoNoEncontradoException;
import com.techlab.ecommerce.model.contacto.Contacto;
import com.techlab.ecommerce.repository.ContactoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactoService {

  private final ContactoRepository repository;
  private final NotificacionService notificacionService;

  public ContactoService(ContactoRepository repository, NotificacionService notificacionService) {
    this.repository = repository;
    this.notificacionService = notificacionService;
  }

  @Transactional
  public Contacto guardar(String nombre, String email, String telefono, String mensaje) {
    Contacto c = new Contacto(nombre, email, telefono, mensaje);
    Contacto saved = repository.save(c);
    notificacionService.nuevoContacto(saved.getId(), saved.getNombre(), saved.getEmail());
    return saved;
  }

  public List<Contacto> listarTodos() {
    return repository.findAll();
  }

  public Contacto obtenerPorId(int id) {
    return repository
        .findById(id)
        .orElseThrow(
            () -> new ContactoNoEncontradoException("No se encontró la consulta con id " + id));
  }

  @Transactional
  public void marcarLeido(int id) {
    Contacto c = obtenerPorId(id);
    c.setLeido(true);
    repository.save(c);
  }
}
