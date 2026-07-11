package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.exception.CantidadInvalidaException;
import com.techlab.ecommerce.exception.CategoriaNoEncontradoException;
import com.techlab.ecommerce.exception.ClienteNoEncontradoException;
import com.techlab.ecommerce.exception.CuponInvalidoException;
import com.techlab.ecommerce.exception.PedidoNoEncontradoException;
import com.techlab.ecommerce.exception.ProductoNoEncontradoException;
import com.techlab.ecommerce.exception.StockInsuficienteException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // ─── 404: No encontrado ───────────────────────────────────
  @ExceptionHandler({
    ProductoNoEncontradoException.class,
    PedidoNoEncontradoException.class,
    CategoriaNoEncontradoException.class,
    ClienteNoEncontradoException.class
  })
  public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage()));
  }

  // ─── 400: Bad request ────────────────────────────────────
  @ExceptionHandler({
    StockInsuficienteException.class,
    CantidadInvalidaException.class,
    CuponInvalidoException.class,
    IllegalArgumentException.class
  })
  public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    List<String> errors =
        ex.getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse(HttpStatus.BAD_REQUEST, "Datos inválidos", errors));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleMalformedJson(HttpMessageNotReadableException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(
            new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                "JSON mal formado: " + ex.getMostSpecificCause().getMessage()));
  }

  // ─── 401: No autorizado ──────────────────────────────────
  @ExceptionHandler({
    io.jsonwebtoken.JwtException.class,
    io.jsonwebtoken.security.SecurityException.class,
    AuthenticationException.class
  })
  public ResponseEntity<ErrorResponse> handleJwtError(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(new ErrorResponse(HttpStatus.UNAUTHORIZED, "Token inválido o expirado"));
  }

  // ─── 405: Método no permitido ────────────────────────────
  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ErrorResponse> handleMethodNotAllowed(
      HttpRequestMethodNotSupportedException ex) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(
            new ErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Método " + ex.getMethod() + " no soportado para esta ruta"));
  }

  // ─── 409: Conflicto (DB constraint) ──────────────────────
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
    String msg = "Violación de integridad de datos";
    if (ex.getMessage() != null && ex.getMessage().contains("unique")) {
      msg = "El valor ya existe (debe ser único)";
    }
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ErrorResponse(HttpStatus.CONFLICT, msg));
  }

  // ─── 415: Tipo de medio no soportado ─────────────────────
  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  public ResponseEntity<ErrorResponse> handleMediaType(HttpMediaTypeNotSupportedException ex) {
    return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .body(
            new ErrorResponse(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Tipo de contenido no soportado: " + ex.getContentType()));
  }

  // ─── 500: Error interno (catch-all) ──────────────────────
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleAllUncaught(Exception ex, HttpServletRequest request) {
    ErrorResponse error =
        new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
    error.addDetail("path", request.getRequestURI());
    error.addDetail("exception", ex.getClass().getSimpleName());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
  }

  // ─── Response DTO ────────────────────────────────────────
  public static class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
    private List<String> details;

    public ErrorResponse(HttpStatus status, String message) {
      this(status, message, null);
    }

    public ErrorResponse(HttpStatus status, String message, List<String> details) {
      this.status = status.value();
      this.error = status.getReasonPhrase();
      this.message = message;
      this.timestamp = LocalDateTime.now();
      this.details = details;
    }

    public void addDetail(String key, String value) {
      if (this.details == null) {
        this.details = new java.util.ArrayList<>();
      }
      this.details.add(key + ": " + value);
    }

    public int getStatus() {
      return status;
    }

    public String getError() {
      return error;
    }

    public String getMessage() {
      return message;
    }

    public LocalDateTime getTimestamp() {
      return timestamp;
    }

    public List<String> getDetails() {
      return details;
    }
  }
}
