package com.techlab.ecommerce.service;

import com.techlab.ecommerce.model.productos.Producto;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

/**
 * Servicio para generar PDF usando Thymeleaf + Flying Saucer. Renderiza un template HTML con los
 * datos y lo convierte a PDF.
 */
@Service
public class PdfExportService {

  private final SpringTemplateEngine templateEngine;

  public PdfExportService(SpringTemplateEngine templateEngine) {
    this.templateEngine = templateEngine;
  }

  /** Genera un PDF con el listado de productos. */
  public byte[] generarPdfProductos(List<Producto> productos, BigDecimal valorizacion) {
    Context context = new Context(Locale.getDefault());
    context.setVariable("productos", productos);
    context.setVariable("valorizacion", valorizacion);

    String html = templateEngine.process("reportes/productos", context);
    return renderPdf(html);
  }

  /** Genera un PDF con el listado de pedidos. */
  public byte[] generarPdfPedidos(
      List<?> pedidos, BigDecimal ingresoTotal, String desde, String hasta) {
    Context context = new Context(Locale.getDefault());
    context.setVariable("pedidos", pedidos);
    context.setVariable("ingresoTotal", ingresoTotal);
    context.setVariable("desde", desde);
    context.setVariable("hasta", hasta);

    String html = templateEngine.process("reportes/pedidos", context);
    return renderPdf(html);
  }

  /** Convierte el HTML renderizado a PDF binario. */
  private byte[] renderPdf(String html) {
    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      ITextRenderer renderer = new ITextRenderer();
      renderer.setDocumentFromString(html);
      renderer.layout();
      renderer.createPDF(baos);
      return baos.toByteArray();
    } catch (Exception e) {
      throw new RuntimeException("Error al generar PDF: " + e.getMessage(), e);
    }
  }
}
