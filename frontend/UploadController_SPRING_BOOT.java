import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UploadController {

    // Ruta donde se guardarán las imágenes (ajustar según tu sistema)
    private final String uploadDir = "uploads/productos/";

    @PostMapping("/productos/{id}")
    public ResponseEntity<?> uploadProductImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        
        try {
            // Validar que el directorio exista
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generar nombre único para evitar colisiones
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            
            // Guardar archivo
            Files.write(filePath, file.getBytes());

            // Aquí deberías actualizar el producto en la BD con el nombre del archivo
            // productService.updateImage(id, filename);

            return ResponseEntity.ok()
                    .body("{\"img\": \"" + filename + "\", \"message\": \"Imagen subida correctamente\"}");
            
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body("{\"msg\": \"Error al subir la imagen: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/productos/{filename:.+}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
