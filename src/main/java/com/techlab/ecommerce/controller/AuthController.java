package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.config.JwtService;
import com.techlab.ecommerce.controller.dto.AuthRequest;
import com.techlab.ecommerce.controller.dto.ForgotPasswordRequest;
import com.techlab.ecommerce.controller.dto.ResetPasswordRequest;
import com.techlab.ecommerce.controller.dto.UsuarioDTO;
import com.techlab.ecommerce.exception.ClienteNoEncontradoException;
import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.service.RateLimiterService;
import com.techlab.ecommerce.service.TokenBlacklistService;
import com.techlab.ecommerce.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación.
 *
 * <p>POST /auth/login → valida credenciales, devuelve token + usuario POST /auth/register → crea
 * usuario con password hasheado, devuelve token + usuario GET /auth/me → valida token, devuelve
 * usuario actual POST /auth/forgot-password → genera token de reseteo si existe el email, siempre
 * 200 POST /auth/reset-password → valida token, actualiza password
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

  private final UsuarioService usuarioService;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final RateLimiterService rateLimiterService;
  private final TokenBlacklistService tokenBlacklistService;

  public AuthController(
      UsuarioService usuarioService,
      JwtService jwtService,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      RateLimiterService rateLimiterService,
      TokenBlacklistService tokenBlacklistService) {
    this.usuarioService = usuarioService;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.rateLimiterService = rateLimiterService;
    this.tokenBlacklistService = tokenBlacklistService;
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getPassword()));

    Usuario usuario = usuarioService.buscarPorEmail(request.getCorreo());
    String token = jwtService.generarToken(usuario);
    UsuarioDTO usuarioDTO = UsuarioDTO.fromEntity(usuario);

    return ResponseEntity.ok(
        Map.of(
            "usuario", usuarioDTO,
            "token", token));
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
    if (usuarioService.existeEmail(request.getCorreo())) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("msg", "El correo ya está registrado"));
    }

    String nombre =
        request.getNombre() != null ? request.getNombre() : request.getCorreo().split("@")[0];
    RolUsuario rol = UsuarioDTO.desmapearRol(request.getRol());
    String passwordHash = passwordEncoder.encode(request.getPassword());

    Usuario usuario =
        usuarioService.registrar(nombre, "", request.getCorreo(), passwordHash, "", rol);

    String token = jwtService.generarToken(usuario);
    UsuarioDTO usuarioDTO = UsuarioDTO.fromEntity(usuario);

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            Map.of(
                "usuario", usuarioDTO,
                "token", token));
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
    String token =
        authHeader != null && authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;
    try {
      int usuarioId = jwtService.extraerUsuarioId(token);
      Usuario usuario = usuarioService.obtenerPorId(usuarioId);
      UsuarioDTO usuarioDTO = UsuarioDTO.fromEntity(usuario);

      return ResponseEntity.ok(
          Map.of(
              "usuario", usuarioDTO,
              "token", token));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("msg", "Token inválido o expirado"));
    }
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    String rateLimitKey = "forgot-password:" + request.getCorreo();
    if (!rateLimiterService.isAllowed(rateLimitKey)) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .body(Map.of("msg", "Demasiados intentos. Esperá 15 minutos."));
    }

    try {
      Usuario usuario = usuarioService.buscarPorEmail(request.getCorreo());
      String token = jwtService.generarTokenReset(usuario.getIdentificador());
      usuarioService.guardarResetTokenHash(usuario.getIdentificador(), token);
      System.out.println("Link de recuperación: http://localhost:5173/reset?token=" + token);
    } catch (ClienteNoEncontradoException e) {
      // Silencio — mismo mensaje genérico para evitar enumeración de emails
    }

    return ResponseEntity.ok(
        Map.of("msg", "Si el correo existe, recibirás un enlace de recuperación."));
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
    String token =
        authHeader != null && authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;
    if (token != null && !token.isBlank()) {
      tokenBlacklistService.invalidar(token);
    }
    return ResponseEntity.ok(Map.of("msg", "Sesión cerrada correctamente"));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    try {
      int usuarioId = jwtService.extraerUsuarioId(request.getToken());
      String passwordHash = passwordEncoder.encode(request.getPassword());
      usuarioService.consumirResetToken(usuarioId, request.getToken(), passwordHash);
      return ResponseEntity.ok(Map.of("msg", "Contraseña actualizada correctamente"));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("msg", "Token expirado o inválido"));
    }
  }
}
