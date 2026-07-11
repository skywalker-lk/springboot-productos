package com.techlab.ecommerce.service;

import com.techlab.ecommerce.exception.CuponInvalidoException;
import com.techlab.ecommerce.model.cupon.Cupon;
import com.techlab.ecommerce.repository.CuponRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CuponService {

  private final CuponRepository repository;

  public CuponService(CuponRepository repository) {
    this.repository = repository;
  }

  public List<Cupon> listarTodos() {
    return repository.findAll();
  }

  public Page<Cupon> listarPaginado(Pageable pageable) {
    return repository.findAll(pageable);
  }

  public Cupon obtenerPorId(Integer id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new CuponInvalidoException("No se encontró un cupón con id " + id));
  }

  @Transactional
  public Cupon crear(Cupon cupon) {
    if (cupon.getCodigo() == null || cupon.getCodigo().isBlank()) {
      throw new CuponInvalidoException("El código del cupón es obligatorio.");
    }
    if (cupon.getValorDescuento() == null
        || cupon.getValorDescuento().compareTo(BigDecimal.ZERO) <= 0) {
      throw new CuponInvalidoException("El valor del descuento debe ser mayor a cero.");
    }
    repository
        .findByCodigoIgnoreCase(cupon.getCodigo().trim())
        .ifPresent(
            c -> {
              throw new CuponInvalidoException(
                  "Ya existe un cupón con el código '" + cupon.getCodigo() + "'");
            });
    return repository.save(cupon);
  }

  @Transactional
  public Cupon actualizar(Integer id, Cupon datos) {
    Cupon existente = obtenerPorId(id);
    existente.setCodigo(datos.getCodigo());
    existente.setTipo(datos.getTipo());
    existente.setValorDescuento(datos.getValorDescuento());
    existente.setMontoMinimo(datos.getMontoMinimo());
    existente.setFechaExpiracion(datos.getFechaExpiracion());
    existente.setUsosMaximos(datos.getUsosMaximos());
    existente.setActivo(datos.getActivo());
    return repository.save(existente);
  }

  @Transactional
  public void eliminar(Integer id) {
    Cupon cupon = obtenerPorId(id);
    repository.delete(cupon);
  }

  public Cupon obtenerPorCodigo(String codigo) {
    return repository
        .findByCodigoIgnoreCase(codigo.trim())
        .orElseThrow(() -> new CuponInvalidoException("El cupón '" + codigo + "' no existe."));
  }

  public void validarCupon(Cupon cupon, BigDecimal montoPedido) {
    if (!cupon.getActivo()) {
      throw new CuponInvalidoException("El cupón '" + cupon.getCodigo() + "' no está activo.");
    }
    if (cupon.isExpirado()) {
      throw new CuponInvalidoException("El cupón '" + cupon.getCodigo() + "' está expirado.");
    }
    if (cupon.isAgotado()) {
      throw new CuponInvalidoException(
          "El cupón '" + cupon.getCodigo() + "' ya no tiene usos disponibles.");
    }
    if (cupon.getMontoMinimo() != null && montoPedido.compareTo(cupon.getMontoMinimo()) < 0) {
      throw new CuponInvalidoException(
          "El pedido mínimo para este cupón es $" + cupon.getMontoMinimo());
    }
  }

  @Transactional
  public BigDecimal aplicarCupon(String codigo, BigDecimal montoPedido) {
    Cupon cupon = obtenerPorCodigo(codigo);
    validarCupon(cupon, montoPedido);
    BigDecimal descuento = cupon.calcularDescuento(montoPedido);
    cupon.setUsosActuales(cupon.getUsosActuales() + 1);
    repository.save(cupon);
    return descuento;
  }
}
