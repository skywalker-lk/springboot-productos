package com.techlab.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.techlab.ecommerce.exception.ClienteNoEncontradoException;
import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.model.usuarios.Cliente;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

  @Mock private UsuarioRepository usuarioRepository;

  @Mock private AuditoriaService auditoriaService;

  @InjectMocks private UsuarioService usuarioService;

  @Test
  void registrarUsuario_retornaUsuarioConRolClienteYllamaAlRepositorio() {
    Usuario esperado =
        new Cliente("Ana", "Pérez", "ana@example.com", "hashed123", "12345678", RolUsuario.CLIENTE);
    esperado.setIdentificador(1);

    when(usuarioRepository.save(any())).thenReturn(esperado);

    Usuario resultado =
        usuarioService.registrar(
            "Ana", "Pérez", "ana@example.com", "hashed123", "12345678", RolUsuario.CLIENTE);

    assertEquals("Ana", resultado.getNombre());
    assertEquals(RolUsuario.CLIENTE, resultado.getRol());
    verify(usuarioRepository).save(any());
  }

  @Test
  void obtenerPorId_usuarioNoExiste_lanzaClienteNoEncontradoException() {
    when(usuarioRepository.findById(999)).thenReturn(java.util.Optional.empty());

    assertThrows(ClienteNoEncontradoException.class, () -> usuarioService.obtenerPorId(999));
  }

  @Test
  void obtenerCantidad_retornaContadorDelRepositorio() {
    when(usuarioRepository.count()).thenReturn(3L);

    assertEquals(3, usuarioService.obtenerCantidad());
  }

  @Test
  void actualizarPassword_usuarioExistente_guardaNuevoHash() {
    int usuarioId = 1;
    String nuevoHash = "$2a$10$nuevoHashEncriptado";
    Usuario usuario =
        new Usuario("Ana", "Pérez", "ana@example.com", "hashViejo", "12345678", RolUsuario.CLIENTE);
    usuario.setIdentificador(usuarioId);

    when(usuarioRepository.findById(usuarioId)).thenReturn(java.util.Optional.of(usuario));
    when(usuarioRepository.save(usuario)).thenReturn(usuario);

    usuarioService.actualizarPassword(usuarioId, nuevoHash);

    assertEquals(nuevoHash, usuario.getPassword());
    verify(usuarioRepository).save(usuario);
  }

  @Test
  void actualizarPassword_usuarioNoExistente_lanzaExcepcion() {
    when(usuarioRepository.findById(999)).thenReturn(java.util.Optional.empty());

    assertThrows(
        ClienteNoEncontradoException.class, () -> usuarioService.actualizarPassword(999, "hash"));
  }
}
