package com.techlab.ecommerce.controller.dto;

import com.techlab.ecommerce.model.cupon.TipoDescuento;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CuponRequest {
  private String codigo;
  private TipoDescuento tipo;
  private BigDecimal valorDescuento;
  private BigDecimal montoMinimo;
  private LocalDate fechaExpiracion;
  private Integer usosMaximos;
  private Boolean activo;
}
