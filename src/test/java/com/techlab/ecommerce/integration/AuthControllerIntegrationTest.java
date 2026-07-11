package com.techlab.ecommerce.integration;

import static org.junit.jupiter.api.Assertions.*;

import com.techlab.ecommerce.config.JwtService;
import com.techlab.ecommerce.controller.dto.AuthRequest;
import com.techlab.ecommerce.controller.dto.ForgotPasswordRequest;
import com.techlab.ecommerce.controller.dto.ResetPasswordRequest;
import com.techlab.ecommerce.service.UsuarioService;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Tests de integración para AuthController. Verifica flujo de recuperación de contraseña sobre H2
 * real.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Sql(scripts = "/clean.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class AuthControllerIntegrationTest {

  @LocalServerPort private int port;

  @Autowired private JwtService jwtService;

  @Autowired private UsuarioService usuarioService;

  private WebClient client;

  @BeforeEach
  void setUp() {
    client = WebClient.create("http://localhost:" + port);
  }

  private String registrarUsuario(String correo, String password) {
    AuthRequest req = new AuthRequest();
    req.setCorreo(correo);
    req.setPassword(password);
    req.setNombre("Test");
    var response =
        client.post().uri("/auth/register").bodyValue(req).retrieve().toEntity(Map.class).block();
    assertNotNull(response.getBody());
    return (String) response.getBody().get("token");
  }

  private int obtenerUsuarioIdDesdeToken(String authToken) {
    Map<String, Object> meResponse =
        client
            .get()
            .uri("/auth/me")
            .header("Authorization", "Bearer " + authToken)
            .retrieve()
            .toEntity(Map.class)
            .block()
            .getBody();
    assertNotNull(meResponse);
    Map<String, Object> usuarioData = (Map<String, Object>) meResponse.get("usuario");
    assertNotNull(usuarioData, "No se encontró usuario en /auth/me. Respuesta: " + meResponse);

    Object uidObj = usuarioData.get("uid");
    assertNotNull(uidObj, "El campo 'uid' debe estar presente en UsuarioDTO");
    return Integer.parseInt(uidObj.toString());
  }

  @Test
  void forgotPassword_conEmailExistente_retorna200() {
    registrarUsuario("test@example.com", "password123");

    ForgotPasswordRequest req = new ForgotPasswordRequest();
    req.setCorreo("test@example.com");

    ResponseEntity<Map> response =
        client
            .post()
            .uri("/auth/forgot-password")
            .bodyValue(req)
            .retrieve()
            .toEntity(Map.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    assertTrue(response.getBody().containsKey("msg"));
  }

  @Test
  void forgotPassword_conEmailInexistente_retorna200ConMensajeGenerico() {
    ForgotPasswordRequest req = new ForgotPasswordRequest();
    req.setCorreo("noexiste@example.com");

    ResponseEntity<Map> response =
        client
            .post()
            .uri("/auth/forgot-password")
            .bodyValue(req)
            .retrieve()
            .toEntity(Map.class)
            .block();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
    String msg = (String) response.getBody().get("msg");
    assertNotNull(msg);
    assertTrue(msg.contains("Si el correo existe"), "El mensaje debe ser genérico: " + msg);
  }

  @Test
  void forgotPassword_conEmailInvalido_retorna400() {
    ForgotPasswordRequest req = new ForgotPasswordRequest();
    req.setCorreo("email-invalido");

    assertThrows(
        WebClientResponseException.class,
        () -> {
          client
              .post()
              .uri("/auth/forgot-password")
              .bodyValue(req)
              .retrieve()
              .toBodilessEntity()
              .block();
        });
  }

  @Test
  void resetPassword_conTokenValido_retorna200YActualizaPassword() {
    String email = "reset@example.com";
    String token = registrarUsuario(email, "oldpass123");

    int usuarioId = obtenerUsuarioIdDesdeToken(token);

    String resetToken = jwtService.generarTokenReset(usuarioId);
    usuarioService.guardarResetTokenHash(usuarioId, resetToken);

    ResetPasswordRequest resetReq = new ResetPasswordRequest();
    resetReq.setToken(resetToken);
    resetReq.setPassword("nuevaPassword123");

    ResponseEntity<Map> resetResponse =
        client
            .post()
            .uri("/auth/reset-password")
            .bodyValue(resetReq)
            .retrieve()
            .toEntity(Map.class)
            .block();

    assertEquals(HttpStatus.OK, resetResponse.getStatusCode());
    assertNotNull(resetResponse.getBody());
    assertTrue(resetResponse.getBody().containsKey("msg"));

    AuthRequest loginReq = new AuthRequest();
    loginReq.setCorreo(email);
    loginReq.setPassword("nuevaPassword123");

    ResponseEntity<Map> loginResponse =
        client.post().uri("/auth/login").bodyValue(loginReq).retrieve().toEntity(Map.class).block();

    assertEquals(
        HttpStatus.OK,
        loginResponse.getStatusCode(),
        "Debe poder loguearse con la nueva contraseña");
  }

  @Test
  void resetPassword_conTokenExpirado_retorna401() {
    String email = "expired@example.com";
    String token = registrarUsuario(email, "password123");
    int usuarioId = obtenerUsuarioIdDesdeToken(token);

    String secret = "ecommerce-jwt-secret-key-2026-para-test";
    var claims =
        io.jsonwebtoken.Jwts.claims()
            .add("id", usuarioId)
            .subject("reset-" + usuarioId)
            .issuedAt(new java.util.Date(System.currentTimeMillis() - 2000L))
            .expiration(new java.util.Date(System.currentTimeMillis() - 1000L))
            .build();
    String expiredToken =
        io.jsonwebtoken.Jwts.builder()
            .claims(claims)
            .signWith(
                io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                    secret.getBytes(java.nio.charset.StandardCharsets.UTF_8)))
            .compact();

    ResetPasswordRequest resetReq = new ResetPasswordRequest();
    resetReq.setToken(expiredToken);
    resetReq.setPassword("nuevaPass123");

    WebClientResponseException exception =
        assertThrows(
            WebClientResponseException.class,
            () -> {
              client
                  .post()
                  .uri("/auth/reset-password")
                  .bodyValue(resetReq)
                  .retrieve()
                  .toBodilessEntity()
                  .block();
            });
    assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
  }

  @Test
  void resetPassword_conTokenInvalido_retorna401() {
    ResetPasswordRequest resetReq = new ResetPasswordRequest();
    resetReq.setToken("token-completamente-invalido");
    resetReq.setPassword("nuevaPass123");

    WebClientResponseException exception =
        assertThrows(
            WebClientResponseException.class,
            () -> {
              client
                  .post()
                  .uri("/auth/reset-password")
                  .bodyValue(resetReq)
                  .retrieve()
                  .toBodilessEntity()
                  .block();
            });
    assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
  }

  @Test
  void resetPassword_conPasswordCorta_retorna400() {
    ResetPasswordRequest resetReq = new ResetPasswordRequest();
    resetReq.setToken("token-valido");
    resetReq.setPassword("123");

    assertThrows(
        WebClientResponseException.class,
        () -> {
          client
              .post()
              .uri("/auth/reset-password")
              .bodyValue(resetReq)
              .retrieve()
              .toBodilessEntity()
              .block();
        });
  }
}
