package com.techlab.ecommerce.service;

import com.techlab.ecommerce.controller.dto.ActualizacionMasivaRequest;
import com.techlab.ecommerce.controller.dto.ActualizacionResponse;
import com.techlab.ecommerce.controller.dto.ImportacionProductoRequest;
import com.techlab.ecommerce.controller.dto.ImportacionResponse;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Servicio para importar productos desde archivos CSV o Excel. */
@Service
public class ImportacionService {

  private final ProductoService productoService;
  private final CategoriaService categoriaService;

  public ImportacionService(ProductoService productoService, CategoriaService categoriaService) {
    this.productoService = productoService;
    this.categoriaService = categoriaService;
  }

  /** Importa productos desde un archivo (CSV o Excel). */
  public ImportacionResponse importarDesdeArchivo(MultipartFile file) throws Exception {
    String nombre = file.getOriginalFilename();
    if (nombre == null) {
      throw new IllegalArgumentException("El archivo no tiene nombre");
    }

    List<ImportacionProductoRequest> requests;

    if (nombre.endsWith(".csv")) {
      requests = parsearCSV(file.getInputStream());
    } else if (nombre.endsWith(".xlsx")) {
      requests = parsearExcel(file.getInputStream());
    } else {
      throw new IllegalArgumentException("Formato no soportado. Usá .csv o .xlsx");
    }

    return productoService.importarMasivo(requests, categoriaService);
  }

  /** Parsea un CSV con columnas: nombre, precio, stock, categoria. */
  private List<ImportacionProductoRequest> parsearCSV(InputStream input) throws Exception {
    List<ImportacionProductoRequest> requests = new ArrayList<>();
    try (BufferedReader reader =
        new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {

      String header = reader.readLine(); // saltar encabezado
      if (header == null) return requests;

      String linea;
      while ((linea = reader.readLine()) != null) {
        linea = linea.trim();
        if (linea.isEmpty()) continue;

        String[] cols = linea.split(",");
        if (cols.length < 1) continue;

        ImportacionProductoRequest req = new ImportacionProductoRequest();
        req.setNombre(cols[0].trim());
        req.setPrecio(cols.length > 1 ? parseBigDecimal(cols[1]) : BigDecimal.ZERO);
        req.setStock(cols.length > 2 ? parseInt(cols[2]) : 0);
        req.setCategoria(cols.length > 3 ? cols[3].trim() : null);
        requests.add(req);
      }
    }
    return requests;
  }

  /** Parsea un Excel (.xlsx) con columnas: nombre, precio, stock, categoria. */
  private List<ImportacionProductoRequest> parsearExcel(InputStream input) throws Exception {
    List<ImportacionProductoRequest> requests = new ArrayList<>();

    try (Workbook workbook = new XSSFWorkbook(input)) {
      Sheet sheet = workbook.getSheetAt(0);
      if (sheet.getPhysicalNumberOfRows() <= 1) return requests; // solo header

      for (int i = 1; i <= sheet.getLastRowNum(); i++) {
        Row row = sheet.getRow(i);
        if (row == null) continue;

        ImportacionProductoRequest req = new ImportacionProductoRequest();
        req.setNombre(getCellString(row.getCell(0)));
        req.setPrecio(getCellBigDecimal(row.getCell(1)));
        req.setStock((int) getCellDouble(row.getCell(2)));
        req.setCategoria(getCellString(row.getCell(3)));
        requests.add(req);
      }
    }
    return requests;
  }

  private String getCellString(Cell cell) {
    if (cell == null) return "";
    return switch (cell.getCellType()) {
      case STRING -> cell.getStringCellValue().trim();
      case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
      default -> "";
    };
  }

  private double getCellDouble(Cell cell) {
    if (cell == null) return 0;
    try {
      return switch (cell.getCellType()) {
        case NUMERIC -> cell.getNumericCellValue();
        case STRING -> Double.parseDouble(cell.getStringCellValue().trim());
        default -> 0;
      };
    } catch (NumberFormatException e) {
      return 0;
    }
  }

  private BigDecimal getCellBigDecimal(Cell cell) {
    if (cell == null) return BigDecimal.ZERO;
    try {
      return switch (cell.getCellType()) {
        case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue());
        case STRING ->
            new BigDecimal(cell.getStringCellValue().trim().replace("$", "").replace(",", "."));
        default -> BigDecimal.ZERO;
      };
    } catch (NumberFormatException e) {
      return BigDecimal.ZERO;
    }
  }

  private BigDecimal parseBigDecimal(String s) {
    try {
      return new BigDecimal(s.trim().replace("$", "").replace(",", "."));
    } catch (NumberFormatException e) {
      return BigDecimal.ZERO;
    }
  }

  private int parseInt(String s) {
    try {
      return Integer.parseInt(s.trim());
    } catch (NumberFormatException e) {
      return 0;
    }
  }

  // ─── Actualización masiva desde archivo ──────────────────────────

  /**
   * Parsea un archivo de actualización y delega al service. Columnas esperadas: id, precio, stock
   * (precio y stock opcionales).
   */
  public ActualizacionResponse actualizarDesdeArchivo(MultipartFile file) throws Exception {
    String nombre = file.getOriginalFilename();
    if (nombre == null) throw new IllegalArgumentException("El archivo no tiene nombre");

    List<ActualizacionMasivaRequest> requests;

    if (nombre.endsWith(".csv")) {
      requests = parsearCSVActualizacion(file.getInputStream());
    } else if (nombre.endsWith(".xlsx")) {
      requests = parsearExcelActualizacion(file.getInputStream());
    } else {
      throw new IllegalArgumentException("Formato no soportado. Usá .csv o .xlsx");
    }

    return productoService.actualizarMasivo(requests);
  }

  /** Parsea CSV con columnas: id, precio, stock. */
  private List<ActualizacionMasivaRequest> parsearCSVActualizacion(InputStream input)
      throws Exception {
    List<ActualizacionMasivaRequest> requests = new ArrayList<>();
    try (BufferedReader reader =
        new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {

      String header = reader.readLine(); // saltar encabezado
      if (header == null) return requests;

      String linea;
      while ((linea = reader.readLine()) != null) {
        linea = linea.trim();
        if (linea.isEmpty()) continue;

        String[] cols = linea.split(",");
        if (cols.length < 1) continue;

        ActualizacionMasivaRequest req = new ActualizacionMasivaRequest();
        req.setId(Integer.parseInt(cols[0].trim()));
        if (cols.length > 1 && !cols[1].trim().isEmpty()) {
          req.setPrecio(parseBigDecimal(cols[1]));
        }
        if (cols.length > 2 && !cols[2].trim().isEmpty()) {
          req.setStock(Integer.parseInt(cols[2].trim()));
        }
        requests.add(req);
      }
    }
    return requests;
  }

  /** Parsea Excel con columnas: id, precio, stock. */
  private List<ActualizacionMasivaRequest> parsearExcelActualizacion(InputStream input)
      throws Exception {
    List<ActualizacionMasivaRequest> requests = new ArrayList<>();
    try (Workbook workbook = new XSSFWorkbook(input)) {
      Sheet sheet = workbook.getSheetAt(0);
      if (sheet.getPhysicalNumberOfRows() <= 1) return requests;

      for (int i = 1; i <= sheet.getLastRowNum(); i++) {
        Row row = sheet.getRow(i);
        if (row == null) continue;

        ActualizacionMasivaRequest req = new ActualizacionMasivaRequest();
        req.setId((int) getCellDouble(row.getCell(0)));

        if (row.getCell(1) != null) {
          req.setPrecio(getCellBigDecimal(row.getCell(1)));
        }
        if (row.getCell(2) != null) {
          req.setStock((int) getCellDouble(row.getCell(2)));
        }
        requests.add(req);
      }
    }
    return requests;
  }
}
