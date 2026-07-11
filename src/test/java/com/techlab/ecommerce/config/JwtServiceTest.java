package com.techlab.ecommerce.config;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Tests unitarios para JwtService. Verifica generación y extracción de claims en tokens JWT. */
class JwtServiceTest {

  private static final String SECRET =
      "ecommerce-jwt-secret-key-2026-para-test-con-longitud-suficiente";
  private static final long EXPIRATION = 86400000L; // 24h
  private static final long RESET_EXPIRATION_MS = 900_000L; // 15 min

  private JwtService jwtService;

  @BeforeEach
  void setUp() {
    jwtService = new JwtService(SECRET, EXPIRATION);
  }

  @Test
  void generarTokenReset_shouldCreateTokenWithUserIdClaim() {
    int usuarioId = 42;

    String token = jwtService.generarTokenReset(usuarioId);

    assertNotNull(token);
    assertFalse(token.isBlank());

    int extractedId = jwtService.extraerUsuarioId(token);
    assertEquals(usuarioId, extractedId);
  }

  @Test
  void generarTokenReset_tokenShouldExpireIn15Min() {
    int usuarioId = 1;
    String token = jwtService.generarTokenReset(usuarioId);
    var claims = jwtService.validarToken(token);

    long issued = claims.getIssuedAt().getTime();
    long expiration = claims.getExpiration().getTime();
    long diffMs = expiration - issued;

    assertEquals(
        RESET_EXPIRATION_MS,
        diffMs,
        "El token de reset debe expirar exactamente en 900_000ms (15 minutos)");
  }

  @Test
  void generarTokenReset_differsFromRegularToken() {
    String resetToken = jwtService.generarTokenReset(100);

    var usuario =
        new com.techlab.ecommerce.model.usuarios.Usuario(
            "Test",
            "User",
            "test@example.com",
            "hash",
            "123",
            com.techlab.ecommerce.model.roles.RolUsuario.CLIENTE);
    usuario.setIdentificador(100);
    String regularToken = jwtService.generarToken(usuario);

    assertNotEquals(
        regularToken,
        resetToken,
        "El token de reset debe ser diferente al token de autenticación normal");
  }

  @Test
  void extraerUsuarioId_invalidToken_throwsException() {
    assertThrows(Exception.class, () -> jwtService.extraerUsuarioId("token-invalido"));
  }
}
