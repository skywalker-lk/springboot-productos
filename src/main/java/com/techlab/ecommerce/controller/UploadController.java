package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.ImportarFotosResponse;
import com.techlab.ecommerce.exception.ProductoNoEncontradoException;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.service.AlmacenamientoService;
import com.techlab.ecommerce.service.ProductoService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Endpoints para subir y gestionar archivos (imágenes de productos, etc.).
 *
 * <p>El frontend espera:
 *
 * <ul>
 *   <li>{@code POST /uploads/productos/{id}} — subir foto de un producto
 *   <li>Las imágenes se sirven estáticamente desde {@code /uploads/productos/}
 * </ul>
 */
@RestController
@RequestMapping("/uploads")
public class UploadController {

  private final AlmacenamientoService almacenamientoService;
  private final ProductoService productoService;

  public UploadController(
      AlmacenamientoService almacenamientoService, ProductoService productoService) {
    this.almacenamientoService = almacenamientoService;
    this.productoService = productoService;
  }

  /**
   * Sube (o reemplaza) la foto de un producto.
   *
   * <p>Request: {@code POST /uploads/productos/{id}} con {@code multipart/form-data}, campo {@code
   * file}.
   *
   * <p>Response: el {@link Producto} actualizado con el campo {@code img} poblado.
   */
  @PostMapping("/productos/{id}")
  public ResponseEntity<Producto> subirFoto(
      @PathVariable int id, @RequestParam("file") MultipartFile file) {
    try {
      Producto producto = productoService.obtenerPorId(id);

      // Si ya tenía imagen, borrar la anterior
      if (producto.getImg() != null && !producto.getImg().isBlank()) {
        almacenamientoService.eliminar("productos", producto.getImg());
      }

      // Guardar nueva imagen
      String nombreArchivo = almacenamientoService.guardar("productos", file);
      producto.setImg(nombreArchivo);

      Producto actualizado = productoService.guardar(producto);
      return ResponseEntity.ok(actualizado);
    } catch (ProductoNoEncontradoException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Importación masiva de fotos de productos.
   *
   * <p>Cada archivo se matchea con un producto por su nombre (sin extensión). Ej: {@code "Coca
   * Cola.jpg"} → busca producto con nombre "Coca Cola".
   *
   * <p>Request: {@code POST /uploads/productos/importar} con {@code multipart/form-data}, campo
   * {@code files} (múltiples archivos).
   */
  @PostMapping("/productos/importar")
  public ResponseEntity<ImportarFotosResponse> importarFotos(
      @RequestParam("files") List<MultipartFile> files) {

    ImportarFotosResponse response = new ImportarFotosResponse();
    int asignadas = 0;

    for (MultipartFile file : files) {
      if (file.isEmpty()) continue;

      String nombreOriginal = file.getOriginalFilename();
      if (nombreOriginal == null || nombreOriginal.isBlank()) continue;

      // Extraer nombre sin extensión: "Coca Cola.jpg" → "Coca Cola"
      String nombreProducto =
          nombreOriginal.contains(".")
              ? nombreOriginal.substring(0, nombreOriginal.lastIndexOf('.'))
              : nombreOriginal;
      nombreProducto = nombreProducto.trim();

      Optional<Producto> optProducto = productoService.buscarPorNombreExacto(nombreProducto);
      if (optProducto.isEmpty()) {
        response.addError(
            nombreOriginal, "No se encontró producto con nombre '" + nombreProducto + "'");
        continue;
      }

      Producto producto = optProducto.get();

      // Si ya tenía imagen, borrar la anterior
      if (producto.getImg() != null && !producto.getImg().isBlank()) {
        almacenamientoService.eliminar("productos", producto.getImg());
      }

      // Guardar nueva imagen
      String nombreArchivo = almacenamientoService.guardar("productos", file);
      producto.setImg(nombreArchivo);
      productoService.guardar(producto);
      asignadas++;
    }

    response.setTotal(files.size());
    response.setAsignadas(asignadas);
    return ResponseEntity.ok(response);
  }
}
