package com.techlab.ecommerce.service;

import com.techlab.ecommerce.config.CurrentUser;
import com.techlab.ecommerce.controller.dto.UsuarioDTO;
import com.techlab.ecommerce.controller.dto.UsuarioRequest;
import com.techlab.ecommerce.exception.ClienteNoEncontradoException;
import com.techlab.ecommerce.exception.TokenExpiradoException;
import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.model.usuarios.Cliente;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Capa de servicio para la gestión de usuarios. Delega persistencia a UsuarioRepository. */
@Service
public class UsuarioService {

  private final UsuarioRepository usuarioRepository;
  private final AuditoriaService auditoriaService;

  public UsuarioService(UsuarioRepository usuarioRepository, AuditoriaService auditoriaService) {
    this.usuarioRepository = usuarioRepository;
    this.auditoriaService = auditoriaService;
  }

  // ----------------------------------------------------------------
  // Autenticación
  // ----------------------------------------------------------------

  public Usuario buscarPorEmail(String email) {
    return usuarioRepository
        .findByEmail(email)
        .orElseThrow(
            () -> new ClienteNoEncontradoException("No se encontró un usuario con email " + email));
  }

  public boolean existeEmail(String email) {
    return usuarioRepository.existsByEmail(email);
  }

  // ----------------------------------------------------------------
  // Operaciones del CRUD
  // ----------------------------------------------------------------

  @Transactional
  public Usuario registrar(
      String nombre,
      String apellido,
      String email,
      String password,
      String telefono,
      RolUsuario rol) {
    Usuario u;

    switch (rol) {
      case CLIENTE -> u = new Cliente(nombre, apellido, email, password, telefono, rol);
      default -> u = new Usuario(nombre, apellido, email, password, telefono, rol);
    }

    Usuario saved = usuarioRepository.save(u);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "CREAR_USUARIO",
        "Usuario: " + saved.getNombre() + " (" + saved.getEmail() + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    return saved;
  }

  public List<Usuario> listarTodos() {
    return usuarioRepository.findAll();
  }

  public Page<Usuario> listarPaginado(Pageable pageable) {
    return usuarioRepository.findAll(pageable);
  }

  public Usuario obtenerPorId(int id) {
    return usuarioRepository
        .findById(id)
        .orElseThrow(
            () -> new ClienteNoEncontradoException("No se encontró un usuario con id " + id));
  }

  @Transactional
  public void actualizarPassword(int id, String passwordHash) {
    Usuario usuario = obtenerPorId(id);
    usuario.setPassword(passwordHash);
    usuarioRepository.save(usuario);
  }

  // ----------------------------------------------------------------
  // Reset de contraseña (token de un solo uso)
  // ----------------------------------------------------------------

  /** Guarda el hash del token de reset para el usuario */
  @Transactional
  public void guardarResetTokenHash(int usuarioId, String rawToken) {
    Usuario usuario = obtenerPorId(usuarioId);
    usuario.setResetTokenHash(sha256(rawToken));
    usuarioRepository.save(usuario);
  }

  /** Valida que el token coincida con el hash guardado y lo consume (limpia) */
  @Transactional
  public void consumirResetToken(int usuarioId, String rawToken, String nuevoPasswordHash) {
    Usuario usuario = obtenerPorId(usuarioId);
    String hashGuardado = usuario.getResetTokenHash();

    if (hashGuardado == null || !hashGuardado.equals(sha256(rawToken))) {
      throw new TokenExpiradoException("Token de recuperación inválido, expirado o ya utilizado.");
    }

    usuario.setResetTokenHash(null);
    usuario.setPassword(nuevoPasswordHash);
    usuarioRepository.save(usuario);
  }

  private static String sha256(String input) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(hash);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("SHA-256 no disponible", e);
    }
  }

  @Transactional
  public Usuario actualizar(int id, UsuarioRequest request) {
    Usuario u = obtenerPorId(id);
    u.setNombre(request.getNombre());
    u.setApellido(request.getApellido());
    u.setEmail(request.getEmail());
    u.setTelefono(request.getTelefono());
    u.setRol(UsuarioDTO.desmapearRol(request.getRol()));
    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      u.setPassword(new BCryptPasswordEncoder().encode(request.getPassword()));
    }
    Usuario updated = usuarioRepository.save(u);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ACTUALIZAR_USUARIO",
        "Usuario: " + updated.getEmail() + " (id " + id + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
    return updated;
  }

  @Transactional
  public void eliminar(int id) {
    Usuario u = obtenerPorId(id);
    usuarioRepository.delete(u);
    CurrentUser.UserInfo user = CurrentUser.get();
    auditoriaService.registrar(
        "ELIMINAR_USUARIO",
        "Usuario: " + u.getEmail() + " (id " + id + ")",
        user != null ? user.getId() : null,
        user != null ? user.getNombre() : null,
        user != null ? user.getEndpoint() : null);
  }

  public int obtenerCantidad() {
    return (int) usuarioRepository.count();
  }
}
