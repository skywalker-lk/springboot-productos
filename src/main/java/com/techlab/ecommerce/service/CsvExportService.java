package com.techlab.ecommerce.service;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.productos.Producto;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Servicio para exportar datos a CSV. Formato estándar con BOM UTF-8 para compatibilidad con Excel.
 */
@Service
public class CsvExportService {

  private static final String BOM = "\uFEFF";
  private static final String SEPARADOR = ",";

  /** Exporta productos a CSV. Usa BOM UTF-8 para que Excel reconozca caracteres especiales. */
  public void exportarProductos(OutputStream out, List<Producto> productos) throws IOException {
    var writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);

    // BOM para Excel
    writer.write(BOM);

    // Header
    writer.write("ID,Nombre,Precio,Stock,Categoría\n");

    // Datos
    for (Producto p : productos) {
      writer.write(escapar(p.getId().toString()));
      writer.write(SEPARADOR);
      writer.write(escapar(p.getNombre()));
      writer.write(SEPARADOR);
      writer.write(escapar(p.getPrecio().setScale(2).toPlainString()));
      writer.write(SEPARADOR);
      writer.write(escapar(String.valueOf(p.getStock())));
      writer.write(SEPARADOR);
      writer.write(escapar(p.getCategoria() != null ? p.getCategoria().getNombre() : ""));
      writer.write("\n");
    }

    writer.flush();
  }

  /** Escapa valores para CSV: entrecomilla si contiene separador, comillas o salto de línea. */
  private String escapar(String valor) {
    if (valor == null) return "";
    if (valor.contains(SEPARADOR) || valor.contains("\"") || valor.contains("\n")) {
      return "\"" + valor.replace("\"", "\"\"") + "\"";
    }
    return valor;
  }

  /** Exporta categorías a CSV. */
  public void exportarCategorias(OutputStream out, List<Categoria> categorias) throws IOException {
    var writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
    writer.write(BOM);
    writer.write("Tipo,Nombre,Descripción\n");
    for (Categoria c : categorias) {
      writer.write(escapar(c.getTipo()));
      writer.write(SEPARADOR);
      writer.write(escapar(c.getNombre()));
      writer.write(SEPARADOR);
      writer.write(escapar(c.getDescripcion()));
      writer.write("\n");
    }
    writer.flush();
  }
}
