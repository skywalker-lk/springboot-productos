package com.techlab.ecommerce.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Servicio para almacenar y eliminar archivos (imágenes, etc.) en el sistema de archivos local.
 *
 * <p>Los archivos se guardan en {@code uploads/<subfolder>/} relativo al directorio de trabajo de
 * la aplicación.
 */
@Service
public class AlmacenamientoService {

  private static final Path BASE_PATH = Paths.get("uploads");

  /**
   * Guarda un archivo en {@code uploads/<subfolder>/} usando un nombre único (UUID).
   *
   * @param subfolder subcarpeta (ej. "productos")
   * @param file archivo subido
   * @return el nombre del archivo guardado (ej. "a1b2c3d4.jpg")
   */
  public String guardar(String subfolder, MultipartFile file) {
    try {
      Path dir = BASE_PATH.resolve(subfolder);
      Files.createDirectories(dir);

      String extension = obtenerExtension(file.getOriginalFilename());
      String nombre = UUID.randomUUID().toString() + extension;

      Path destino = dir.resolve(nombre);
      Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

      return nombre;
    } catch (IOException e) {
      throw new RuntimeException("Error al guardar archivo en uploads/" + subfolder, e);
    }
  }

  /**
   * Elimina un archivo de {@code uploads/<subfolder>/}.
   *
   * @param subfolder subcarpeta
   * @param nombre nombre del archivo a eliminar
   */
  public void eliminar(String subfolder, String nombre) {
    try {
      Path archivo = BASE_PATH.resolve(subfolder).resolve(nombre);
      Files.deleteIfExists(archivo);
    } catch (IOException e) {
      // Si no existe, no es error — sólo logueamos
      System.err.println("No se pudo eliminar " + subfolder + "/" + nombre + ": " + e.getMessage());
    }
  }

  private String obtenerExtension(String nombreOriginal) {
    if (nombreOriginal == null || !nombreOriginal.contains(".")) {
      return ".jpg"; // default
    }
    return nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
  }
}
