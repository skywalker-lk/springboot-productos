package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.controller.dto.ActualizacionMasivaRequest;
import com.techlab.ecommerce.controller.dto.ActualizacionResponse;
import com.techlab.ecommerce.controller.dto.ImportacionProductoRequest;
import com.techlab.ecommerce.controller.dto.ImportacionResponse;
import com.techlab.ecommerce.controller.dto.PrecioUpdateRequest;
import com.techlab.ecommerce.controller.dto.ProductoListResponse;
import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.service.AlmacenamientoService;
import com.techlab.ecommerce.service.CategoriaService;
import com.techlab.ecommerce.service.ImportacionService;
import com.techlab.ecommerce.service.ProductoService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/productos")
@Validated
public class ProductoController {

  private final ProductoService service;
  private final CategoriaService categoriaService;
  private final ImportacionService importacionService;
  private final AlmacenamientoService almacenamientoService;

  public ProductoController(
      ProductoService service,
      CategoriaService categoriaService,
      ImportacionService importacionService,
      AlmacenamientoService almacenamientoService) {
    this.service = service;
    this.categoriaService = categoriaService;
    this.importacionService = importacionService;
    this.almacenamientoService = almacenamientoService;
  }

  @GetMapping
  public ResponseEntity<ProductoListResponse> listarTodos(
      @RequestParam(defaultValue = "0") int pagina,
      @RequestParam(defaultValue = "50") int limite,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String categoria,
      @RequestParam(required = false) Double precioMin,
      @RequestParam(required = false) Double precioMax,
      @RequestParam(required = false) Integer stockMin,
      @RequestParam(required = false) Integer stockMax) {

    Pageable pageable = PageRequest.of(pagina, limite);
    boolean hayFiltros =
        q != null
            || categoria != null
            || precioMin != null
            || precioMax != null
            || stockMin != null
            || stockMax != null;

    if (hayFiltros) {
      Categoria cat =
          categoria != null ? categoriaService.obtenerCategoriaPorTipo(categoria) : null;
      Page<Producto> page =
          service.buscarConFiltrosPaginado(
              q, cat, precioMin, precioMax, stockMin, stockMax, pageable);
      return ResponseEntity.ok(
          new ProductoListResponse(page.getTotalElements(), page.getContent()));
    }

    Page<Producto> page = service.listarPaginado(pageable);
    return ResponseEntity.ok(new ProductoListResponse(page.getTotalElements(), page.getContent()));
  }

  @GetMapping("/precio")
  public ResponseEntity<List<Producto>> listarPorPrecio(
      @RequestParam BigDecimal precioMin, @RequestParam BigDecimal precioMax) {
    return ResponseEntity.ok(service.listarPorPrecio(precioMin, precioMax));
  }

  @PutMapping("/categoria")
  public ResponseEntity<List<Producto>> actualizarPrecioPorCategoria(
      @RequestParam String categoria, @RequestParam double porcentaje) {
    Categoria cat = categoriaService.obtenerCategoriaPorTipo(categoria);
    return ResponseEntity.ok(service.actualizarPrecioPorCategoria(cat, porcentaje));
  }

  @PutMapping("/precios/masivo")
  public ResponseEntity<List<Producto>> actualizarPreciosMasivos(
      @Valid @RequestBody List<PrecioUpdateRequest> actualizaciones) {
    return ResponseEntity.ok(
        service.actualizarPreciosMasivos(
            actualizaciones.stream()
                .map(
                    req -> {
                      Producto p = new Producto();
                      p.setId(req.getId());
                      p.setPrecio(req.getPrecioNuevo());
                      return p;
                    })
                .toList()));
  }

  @GetMapping("/categoria")
  public ResponseEntity<List<Producto>> listarPorCategoria(@RequestParam String categoria) {
    Categoria cat = categoriaService.obtenerCategoriaPorTipo(categoria);
    return ResponseEntity.ok(service.listarPorCategoria(cat));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Producto> obtenerProducto(@PathVariable int id) {
    return ResponseEntity.ok(service.obtenerPorId(id));
  }

  @GetMapping("/nombre/{nombre}")
  public ResponseEntity<List<Producto>> buscarPorNombre(@PathVariable String nombre) {
    return ResponseEntity.ok(service.buscarPorNombre(nombre));
  }

  @PostMapping("")
  public ResponseEntity<Producto> crearProducto(@RequestBody Map<String, Object> body) {
    String nombre = (String) body.get("nombre");
    String categoriaTipo = (String) body.get("categoria");
    BigDecimal precio =
        body.get("precio") != null
            ? new BigDecimal(((Number) body.get("precio")).toString())
            : BigDecimal.ZERO;
    int stock = body.get("stock") != null ? ((Number) body.get("stock")).intValue() : 0;

    Categoria categoria = categoriaService.obtenerCategoriaPorTipo(categoriaTipo);

    Producto p = new Producto();
    p.setNombre(nombre != null ? nombre : "");
    p.setPrecio(precio);
    p.setStock(stock);
    p.setCategoria(categoria);

    if (body.containsKey("precioBase")) {
      p.setPrecioBase(new BigDecimal(((Number) body.get("precioBase")).toString()));
    }
    if (body.containsKey("porcentajeIVA")) {
      p.setPorcentajeIVA(((Number) body.get("porcentajeIVA")).intValue());
    }
    if (body.containsKey("descuentoCantidad")) {
      p.setDescuentoCantidad(((Number) body.get("descuentoCantidad")).intValue());
    }
    if (body.containsKey("descuentoPorcentaje")) {
      p.setDescuentoPorcentaje(((Number) body.get("descuentoPorcentaje")).intValue());
    }

    return ResponseEntity.status(201).body(service.guardar(p));
  }

  @PostMapping("/importar")
  public ResponseEntity<ImportacionResponse> importarProductos(
      @Valid @RequestBody List<ImportacionProductoRequest> productos) {
    ImportacionResponse response = service.importarMasivo(productos, categoriaService);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/importar/archivo")
  public ResponseEntity<ImportacionResponse> importarArchivo(
      @RequestParam("file") MultipartFile file) throws Exception {
    ImportacionResponse response = importacionService.importarDesdeArchivo(file);
    return ResponseEntity.ok(response);
  }

  // ─── Actualización masiva ────────────────────────────────────────

  @PutMapping("/actualizar/masivo")
  public ResponseEntity<ActualizacionResponse> actualizarMasivo(
      @RequestBody List<ActualizacionMasivaRequest> requests) {
    return ResponseEntity.ok(service.actualizarMasivo(requests));
  }

  @PostMapping("/actualizar/archivo")
  public ResponseEntity<ActualizacionResponse> actualizarArchivo(
      @RequestParam("file") MultipartFile file) throws Exception {
    ActualizacionResponse response = importacionService.actualizarDesdeArchivo(file);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Producto> actualizarProducto(
      @PathVariable int id, @RequestBody Map<String, Object> body) {
    Producto existente = service.obtenerPorId(id);

    if (body.containsKey("nombre")) {
      existente.setNombre((String) body.get("nombre"));
    }
    if (body.containsKey("precio")) {
      existente.setPrecio(new BigDecimal(((Number) body.get("precio")).toString()));
    }
    if (body.containsKey("precioBase")) {
      existente.setPrecioBase(new BigDecimal(((Number) body.get("precioBase")).toString()));
    }
    if (body.containsKey("porcentajeIVA")) {
      existente.setPorcentajeIVA(((Number) body.get("porcentajeIVA")).intValue());
    }
    if (body.containsKey("descuentoCantidad")) {
      existente.setDescuentoCantidad(((Number) body.get("descuentoCantidad")).intValue());
    }
    if (body.containsKey("descuentoPorcentaje")) {
      existente.setDescuentoPorcentaje(((Number) body.get("descuentoPorcentaje")).intValue());
    }
    if (body.containsKey("stock")) {
      existente.setStock(((Number) body.get("stock")).intValue());
    }
    if (body.containsKey("categoria")) {
      String categoriaTipo = (String) body.get("categoria");
      existente.setCategoria(categoriaService.obtenerCategoriaPorTipo(categoriaTipo));
    }

    return ResponseEntity.ok(service.guardar(existente));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable int id) {
    Producto producto = service.obtenerPorId(id);
    if (producto.getImg() != null && !producto.getImg().isBlank()) {
      almacenamientoService.eliminar("productos", producto.getImg());
    }
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
