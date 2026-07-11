package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.UsuarioDTO;
import com.techlab.ecommerce.controller.dto.UsuarioListResponse;
import com.techlab.ecommerce.controller.dto.UsuarioRequest;
// import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios")
public class UsuariosController {

  private final UsuarioService service;

  public UsuariosController(UsuarioService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<UsuarioListResponse> listarUsuarios(
      @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "50") int limite) {
    Pageable pageable = PageRequest.of(pagina, limite);
    Page<Usuario> page = service.listarPaginado(pageable);
    List<UsuarioDTO> dtoList = page.getContent().stream().map(UsuarioDTO::fromEntity).toList();
    return ResponseEntity.ok(new UsuarioListResponse(page.getTotalElements(), dtoList));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable int id) {
    return ResponseEntity.ok(UsuarioDTO.fromEntity(service.obtenerPorId(id)));
  }

  @PostMapping("")
  public ResponseEntity<UsuarioDTO> registrarUsuario(@Valid @RequestBody UsuarioRequest request) {
    String password = request.getPassword() != null ? request.getPassword() : "123456";
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    UsuarioDTO dto =
        UsuarioDTO.fromEntity(
            service.registrar(
                request.getNombre(),
                request.getApellido(),
                request.getEmail(),
                encoder.encode(password),
                request.getTelefono(),
                UsuarioDTO.desmapearRol(request.getRol())));
    return ResponseEntity.status(HttpStatus.CREATED).body(dto);
  }

  @PutMapping("/{id}")
  public ResponseEntity<UsuarioDTO> actualizarUsuario(
      @PathVariable int id, @Valid @RequestBody UsuarioRequest request) {
    return ResponseEntity.ok(UsuarioDTO.fromEntity(service.actualizar(id, request)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminarUsuario(@PathVariable int id) {
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
