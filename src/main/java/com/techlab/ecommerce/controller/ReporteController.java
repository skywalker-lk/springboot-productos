package com.techlab.ecommerce.controller;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import com.techlab.ecommerce.service.*;
import com.techlab.ecommerce.service.CategoriaService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reportes")
public class ReporteController {

  private final ReporteService reporteService;
  private final ExcelExportService excelExportService;
  private final PdfExportService pdfExportService;
  private final CsvExportService csvExportService;
  private final CategoriaService categoriaService;

  public ReporteController(
      ReporteService reporteService,
      ExcelExportService excelExportService,
      PdfExportService pdfExportService,
      CsvExportService csvExportService,
      CategoriaService categoriaService) {
    this.reporteService = reporteService;
    this.excelExportService = excelExportService;
    this.pdfExportService = pdfExportService;
    this.csvExportService = csvExportService;
    this.categoriaService = categoriaService;
  }

  // ==========================================
  // JSON — datos para consumir desde frontend
  // ==========================================

  @GetMapping("/resumen")
  public ResponseEntity<Map<String, Object>> resumen() {
    return ResponseEntity.ok(reporteService.resumenGeneral());
  }

  @GetMapping("/stock-critico")
  public ResponseEntity<List<Producto>> stockCritico(@RequestParam(defaultValue = "5") int umbral) {
    return ResponseEntity.ok(reporteService.stockCritico(umbral));
  }

  @GetMapping("/valorizacion")
  public ResponseEntity<Map<String, Object>> valorizacion() {
    return ResponseEntity.ok(Map.of("valorizacionTotal", reporteService.valorizacionTotal()));
  }

  @GetMapping("/mas-vendidos")
  public ResponseEntity<List<Map<String, Object>>> masVendidos(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
    return ResponseEntity.ok(reporteService.productosMasVendidos(desde, hasta));
  }

  @GetMapping("/rotacion")
  public ResponseEntity<Map<String, Integer>> rotacion(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
    return ResponseEntity.ok(reporteService.rotacionPorCategoria(desde, hasta));
  }

  // ==========================================
  // Excel — descarga de archivos .xlsx
  // ==========================================

  @GetMapping("/productos/excel")
  public ResponseEntity<byte[]> descargarExcelProductos(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String categoria,
      @RequestParam(required = false) Double precioMin,
      @RequestParam(required = false) Double precioMax,
      @RequestParam(required = false) Integer stockMin,
      @RequestParam(required = false) Integer stockMax) {
    List<Producto> productos =
        filtrarProductos(q, categoria, precioMin, precioMax, stockMin, stockMax);

    byte[] bytes =
        generarExcel(
            () -> {
              try {
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                excelExportService.exportarProductos(baos, productos);
                return baos.toByteArray();
              } catch (java.io.IOException e) {
                throw new RuntimeException("Error al generar Excel de productos", e);
              }
            });

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=productos.xlsx")
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(bytes);
  }

  @GetMapping("/pedidos/excel")
  public ResponseEntity<byte[]> descargarExcelPedidos(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
    List<Pedido> pedidos = reporteService.pedidosPorPeriodo(desde, hasta);

    byte[] bytes =
        generarExcel(
            () -> {
              try {
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                excelExportService.exportarPedidos(baos, pedidos);
                return baos.toByteArray();
              } catch (java.io.IOException e) {
                throw new RuntimeException("Error al generar Excel de pedidos", e);
              }
            });

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pedidos.xlsx")
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(bytes);
  }

  @GetMapping("/categorias/excel")
  public ResponseEntity<byte[]> descargarExcelCategorias() {
    List<Categoria> categorias = categoriaService.listarCategorias();

    byte[] bytes =
        generarExcel(
            () -> {
              try {
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                excelExportService.exportarCategorias(baos, categorias);
                return baos.toByteArray();
              } catch (java.io.IOException e) {
                throw new RuntimeException("Error al generar Excel de categorías", e);
              }
            });

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=categorias.xlsx")
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(bytes);
  }

  // ==========================================
  // CSV
  // ==========================================

  @GetMapping("/productos/csv")
  public ResponseEntity<byte[]> descargarCsvProductos(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String categoria,
      @RequestParam(required = false) Double precioMin,
      @RequestParam(required = false) Double precioMax,
      @RequestParam(required = false) Integer stockMin,
      @RequestParam(required = false) Integer stockMax) {
    List<Producto> productos =
        filtrarProductos(q, categoria, precioMin, precioMax, stockMin, stockMax);

    byte[] bytes;
    try {
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      csvExportService.exportarProductos(baos, productos);
      bytes = baos.toByteArray();
    } catch (java.io.IOException e) {
      throw new RuntimeException("Error al generar CSV de productos", e);
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=productos.csv")
        .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
        .body(bytes);
  }

  @GetMapping("/categorias/csv")
  public ResponseEntity<byte[]> descargarCsvCategorias() {
    List<Categoria> categorias = categoriaService.listarCategorias();

    byte[] bytes;
    try {
      java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
      csvExportService.exportarCategorias(baos, categorias);
      bytes = baos.toByteArray();
    } catch (java.io.IOException e) {
      throw new RuntimeException("Error al generar CSV de categorías", e);
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=categorias.csv")
        .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
        .body(bytes);
  }

  // ==========================================
  // PDF
  // ==========================================

  @GetMapping("/productos/pdf")
  public ResponseEntity<byte[]> descargarPdfProductos(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String categoria,
      @RequestParam(required = false) Double precioMin,
      @RequestParam(required = false) Double precioMax,
      @RequestParam(required = false) Integer stockMin,
      @RequestParam(required = false) Integer stockMax) {
    List<Producto> productos =
        filtrarProductos(q, categoria, precioMin, precioMax, stockMin, stockMax);
    BigDecimal valorizacion =
        productos.stream()
            .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getStock())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    byte[] pdf = pdfExportService.generarPdfProductos(productos, valorizacion);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=productos.pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }

  @GetMapping("/pedidos/pdf")
  public ResponseEntity<byte[]> descargarPdfPedidos(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
    List<Pedido> pedidos = reporteService.pedidosPorPeriodo(desde, hasta);
    BigDecimal ingresoTotal =
        pedidos.stream().map(Pedido::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

    byte[] pdf =
        pdfExportService.generarPdfPedidos(
            pedidos, ingresoTotal, desde.toString(), hasta.toString());

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pedidos.pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }

  // --- Helpers ---

  @FunctionalInterface
  private interface ExcelSupplier {
    byte[] get();
  }

  private byte[] generarExcel(ExcelSupplier supplier) {
    return supplier.get();
  }

  private List<Producto> filtrarProductos(
      String q,
      String categoria,
      Double precioMin,
      Double precioMax,
      Integer stockMin,
      Integer stockMax) {
    Categoria cat = null;
    if (categoria != null && !categoria.isEmpty()) {
      cat = categoriaService.obtenerCategoriaPorTipo(categoria);
    }
    return reporteService.productosConFiltros(q, cat, precioMin, precioMax, stockMin, stockMax);
  }
}
