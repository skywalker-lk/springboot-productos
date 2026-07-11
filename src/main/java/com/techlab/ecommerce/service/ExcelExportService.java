package com.techlab.ecommerce.service;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.pedidos.Pedido;
import com.techlab.ecommerce.model.productos.Producto;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;

/**
 * Servicio para exportar datos a archivos Excel (.xlsx). Usa SXSSFWorkbook (variante streaming)
 * para manejar grandes volúmenes sin agotar memoria.
 */
@Service
public class ExcelExportService {

  /** Exporta la lista de productos a un Excel. */
  public void exportarProductos(OutputStream out, List<Producto> productos) throws IOException {
    SXSSFWorkbook wb = new SXSSFWorkbook();
    try {
      Sheet sheet = wb.createSheet("Productos");

      String[] columnas = {"ID", "Nombre", "Precio", "Stock", "Categoría"};
      Row header = sheet.createRow(0);

      // Estilo del encabezado
      CellStyle headerStyle = wb.createCellStyle();
      headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      Font headerFont = wb.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);

      for (int i = 0; i < columnas.length; i++) {
        Cell cell = header.createCell(i);
        cell.setCellValue(columnas[i]);
        cell.setCellStyle(headerStyle);
      }

      // Datos
      int rowNum = 1;
      for (Producto p : productos) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(p.getId());
        row.createCell(1).setCellValue(p.getNombre());
        row.createCell(2).setCellValue(p.getPrecio().doubleValue());
        row.createCell(3).setCellValue(p.getStock());
        row.createCell(4).setCellValue(p.getCategoria().getNombre());
      }

      // Autoajuste de columnas (SXSSF requiere trackAllColumns)
      ((SXSSFSheet) sheet).trackAllColumnsForAutoSizing();
      for (int i = 0; i < columnas.length; i++) {
        sheet.autoSizeColumn(i);
      }

      wb.write(out);
    } finally {
      // wb.dispose(); // libera archivos temporales del streaming
      wb.close();
    }
  }

  /** Exporta la lista de pedidos a un Excel. */
  public void exportarPedidos(OutputStream out, List<Pedido> pedidos) throws IOException {
    SXSSFWorkbook wb = new SXSSFWorkbook();
    try {
      Sheet sheet = wb.createSheet("Pedidos");

      String[] columnas = {"ID", "Fecha", "Cliente", "Estado", "Total", "Medio Pago"};
      Row header = sheet.createRow(0);

      CellStyle headerStyle = wb.createCellStyle();
      headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      Font headerFont = wb.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);

      for (int i = 0; i < columnas.length; i++) {
        Cell cell = header.createCell(i);
        cell.setCellValue(columnas[i]);
        cell.setCellStyle(headerStyle);
      }

      int rowNum = 1;
      for (Pedido p : pedidos) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(p.getId());
        row.createCell(1).setCellValue(p.getFecha().toString());
        row.createCell(2).setCellValue(p.getCliente());
        row.createCell(3).setCellValue(p.getEstado());
        row.createCell(4).setCellValue(p.getTotal().doubleValue());
        row.createCell(5).setCellValue(p.getMedioPago());
      }

      ((SXSSFSheet) sheet).trackAllColumnsForAutoSizing();
      for (int i = 0; i < columnas.length; i++) {
        sheet.autoSizeColumn(i);
      }

      wb.write(out);
    } finally {
      // wb.dispose(); // libera archivos temporales del streaming
      wb.close();
    }
  }

  /** Exporta la lista de categorías a un Excel. */
  public void exportarCategorias(OutputStream out, List<Categoria> categorias) throws IOException {
    SXSSFWorkbook wb = new SXSSFWorkbook();
    try {
      Sheet sheet = wb.createSheet("Categorías");

      String[] columnas = {"Tipo", "Nombre", "Descripción"};
      Row header = sheet.createRow(0);

      CellStyle headerStyle = wb.createCellStyle();
      headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      Font headerFont = wb.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);

      for (int i = 0; i < columnas.length; i++) {
        Cell cell = header.createCell(i);
        cell.setCellValue(columnas[i]);
        cell.setCellStyle(headerStyle);
      }

      int rowNum = 1;
      for (Categoria c : categorias) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(c.getTipo());
        row.createCell(1).setCellValue(c.getNombre());
        row.createCell(2).setCellValue(c.getDescripcion());
      }

      ((SXSSFSheet) sheet).trackAllColumnsForAutoSizing();
      for (int i = 0; i < columnas.length; i++) {
        sheet.autoSizeColumn(i);
      }

      wb.write(out);
    } finally {
      // wb.dispose(); // libera archivos temporales del streaming
      wb.close();
    }
  }
}
