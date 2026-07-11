package com.techlab.ecommerce.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.techlab.ecommerce.controller.dto.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

/**
 * Tests de Bean Validation para DTOs.
 *
 * <p>Verifica que las anotaciones {@code @NotBlank}, {@code @Email}, {@code @Size}, {@code @Min},
 * {@code @NotNull} y {@code @NotEmpty} se disparen correctamente cuando los datos son inválidos, y
 * que NO se disparen cuando los datos son válidos.
 */
class ValidatorTests {

  private Validator validator;

  @BeforeEach
  void setUp() {
    LocalValidatorFactoryBean factory = new LocalValidatorFactoryBean();
    factory.afterPropertiesSet();
    validator = factory;
  }

  // ─── AuthRequest ────────────────────────────────────────────────

  @Test
  void authRequest_conCorreoVacio_lanzaViolacion() {
    var req = new AuthRequest();
    req.setCorreo("");
    req.setPassword("123456");

    Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);

    assertThat(violations)
        .anyMatch(
            v ->
                v.getPropertyPath().toString().equals("correo")
                    && v.getMessage().contains("obligatorio"));
  }

  @Test
  void authRequest_conCorreoInvalido_lanzaViolacion() {
    var req = new AuthRequest();
    req.setCorreo("no-es-un-email");
    req.setPassword("123456");

    Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);

    assertThat(violations)
        .anyMatch(
            v ->
                v.getPropertyPath().toString().equals("correo")
                    && v.getMessage().contains("Formato"));
  }

  @Test
  void authRequest_conPasswordCorta_lanzaViolacion() {
    var req = new AuthRequest();
    req.setCorreo("test@example.com");
    req.setPassword("123");

    Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);

    assertThat(violations)
        .anyMatch(
            v ->
                v.getPropertyPath().toString().equals("password")
                    && v.getMessage().contains("6 caracteres"));
  }

  @Test
  void authRequest_valido_noLanzaViolaciones() {
    var req = new AuthRequest();
    req.setCorreo("test@example.com");
    req.setPassword("123456");

    Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);

    assertThat(violations).isEmpty();
  }

  // ─── UsuarioRequest ─────────────────────────────────────────────

  @Test
  void usuarioRequest_camposVacios_lanzaViolaciones() {
    var req = new UsuarioRequest();

    Set<ConstraintViolation<UsuarioRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("nombre"));
    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("apellido"));
    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("email"));
    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("telefono"));
    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("rol"));
  }

  @Test
  void usuarioRequest_emailInvalido_lanzaViolacion() {
    var req = new UsuarioRequest();
    req.setNombre("Juan");
    req.setApellido("Pérez");
    req.setEmail("invalido");
    req.setTelefono("123456789");
    req.setRol("ADMIN");

    Set<ConstraintViolation<UsuarioRequest>> violations = validator.validate(req);

    assertThat(violations)
        .anyMatch(
            v ->
                v.getPropertyPath().toString().equals("email")
                    && v.getMessage().contains("formato"));
  }

  @Test
  void usuarioRequest_valido_noLanzaViolaciones() {
    var req = new UsuarioRequest();
    req.setNombre("Juan");
    req.setApellido("Pérez");
    req.setEmail("juan@example.com");
    req.setTelefono("123456789");
    req.setRol("ADMIN");

    Set<ConstraintViolation<UsuarioRequest>> violations = validator.validate(req);

    assertThat(violations).isEmpty();
  }

  // ─── PedidoRequest ──────────────────────────────────────────────

  @Test
  void pedidoRequest_sinNombreCliente_lanzaViolacion() {
    var req = new PedidoRequest();
    req.setIdsProducto(List.of(1));
    req.setCantidades(List.of(2));

    Set<ConstraintViolation<PedidoRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("nombreCliente"));
  }

  @Test
  void pedidoRequest_listasVacias_lanzaViolaciones() {
    var req = new PedidoRequest();
    req.setNombreCliente("Juan");

    Set<ConstraintViolation<PedidoRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("idsProducto"));
    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("cantidades"));
  }

  @Test
  void pedidoRequest_valido_noLanzaViolaciones() {
    var req = new PedidoRequest();
    req.setNombreCliente("Juan");
    req.setIdsProducto(List.of(1, 2));
    req.setCantidades(List.of(2, 3));

    Set<ConstraintViolation<PedidoRequest>> violations = validator.validate(req);

    assertThat(violations).isEmpty();
  }

  // ─── ResetPasswordRequest ───────────────────────────────────────

  @Test
  void resetPasswordRequest_tokenVacio_lanzaViolacion() {
    var req = new ResetPasswordRequest();
    req.setToken("");
    req.setPassword("123456");

    Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("token"));
  }

  @Test
  void resetPasswordRequest_passwordCorta_lanzaViolacion() {
    var req = new ResetPasswordRequest();
    req.setToken("abc123");
    req.setPassword("12");

    Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(req);

    assertThat(violations)
        .anyMatch(
            v ->
                v.getPropertyPath().toString().equals("password")
                    && v.getMessage().contains("6 caracteres"));
  }

  @Test
  void resetPasswordRequest_valido_noLanzaViolaciones() {
    var req = new ResetPasswordRequest();
    req.setToken("abc123");
    req.setPassword("123456");

    Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(req);

    assertThat(violations).isEmpty();
  }

  // ─── CarritoItemRequest ─────────────────────────────────────────

  @Test
  void carritoItemRequest_productoIdNulo_lanzaViolacion() {
    var req = new CarritoItemRequest();
    req.setCantidad(1);

    Set<ConstraintViolation<CarritoItemRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("productoId"));
  }

  @Test
  void carritoItemRequest_cantidadNula_lanzaViolacion() {
    var req = new CarritoItemRequest();
    req.setProductoId(1);

    Set<ConstraintViolation<CarritoItemRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("cantidad"));
  }

  @Test
  void carritoItemRequest_productoIdCero_lanzaViolacion() {
    var req = new CarritoItemRequest();
    req.setProductoId(0);
    req.setCantidad(1);

    Set<ConstraintViolation<CarritoItemRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("productoId"));
  }

  @Test
  void carritoItemRequest_valido_noLanzaViolaciones() {
    var req = new CarritoItemRequest();
    req.setProductoId(1);
    req.setCantidad(2);

    Set<ConstraintViolation<CarritoItemRequest>> violations = validator.validate(req);

    assertThat(violations).isEmpty();
  }

  // ─── MovimientoRequest ──────────────────────────────────────────

  @Test
  void movimientoRequest_motivoVacio_lanzaViolacion() {
    var req = new MovimientoRequest();
    req.setProductoId(1);
    req.setCantidad(5);
    req.setMotivo("");

    Set<ConstraintViolation<MovimientoRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("motivo"));
  }

  @Test
  void movimientoRequest_cantidadCero_lanzaViolacion() {
    var req = new MovimientoRequest();
    req.setProductoId(1);
    req.setCantidad(0);
    req.setMotivo("Ajuste");

    Set<ConstraintViolation<MovimientoRequest>> violations = validator.validate(req);

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("cantidad"));
  }

  @Test
  void movimientoRequest_valido_noLanzaViolaciones() {
    var req = new MovimientoRequest();
    req.setProductoId(1);
    req.setCantidad(5);
    req.setMotivo("Ajuste de inventario");

    Set<ConstraintViolation<MovimientoRequest>> violations = validator.validate(req);

    assertThat(violations).isEmpty();
  }
}
