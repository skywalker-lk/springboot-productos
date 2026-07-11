package com.techlab.ecommerce.config;

import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.model.usuarios.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Utilidad para generar y validar tokens JWT.
 *
 * <p>Usa HMAC-SHA256 con una clave secreta configurada en application.properties. El token
 * contiene: id del usuario, email, rol, fecha de emisión y expiración.
 */
@Component
public class JwtService {

  private final SecretKey key;
  private final long expiration;

  public JwtService(
      @Value("${ecommerce.jwt.secret}") String secret,
      @Value("${ecommerce.jwt.expiration}") long expiration) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expiration = expiration;
  }

  /**
   * Genera un token JWT para el usuario. Incluye: subject (email), id, rol, emitido-en, expira-en.
   */
  public String generarToken(Usuario usuario) {
    Date ahora = new Date();
    Date expiracion = new Date(ahora.getTime() + expiration);

    return Jwts.builder()
        .subject(usuario.getEmail())
        .claim("id", usuario.getIdentificador())
        .claim("rol", usuario.getRol().name())
        .issuedAt(ahora)
        .expiration(expiracion)
        .signWith(key)
        .compact();
  }

  /** Valida un token JWT y retorna los claims. Lanza excepción si el token es inválido o expiró. */
  public Claims validarToken(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  /**
   * Genera un token JWT para restablecimiento de contraseña. Tiene expiración de 15 minutos
   * (900_000ms) y solo contiene el claim id.
   */
  public String generarTokenReset(int usuarioId) {
    Date ahora = new Date();
    Date expiracion = new Date(ahora.getTime() + 900_000L);

    return Jwts.builder()
        .subject("reset-" + usuarioId)
        .claim("id", usuarioId)
        .issuedAt(ahora)
        .expiration(expiracion)
        .signWith(key)
        .compact();
  }

  /** Extrae el email (subject) del token. */
  public String extraerEmail(String token) {
    return validarToken(token).getSubject();
  }

  /** Extrae el id del usuario del token. */
  public int extraerUsuarioId(String token) {
    return validarToken(token).get("id", Integer.class);
  }

  /** Extrae el rol del token. */
  public RolUsuario extraerRol(String token) {
    String rolStr = validarToken(token).get("rol", String.class);
    return RolUsuario.valueOf(rolStr);
  }
}
