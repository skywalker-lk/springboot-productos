package com.techlab.ecommerce.model.stock;

/**
 * Tipos de movimiento de stock. INGRESO: entra mercadería (compra, devolución, ajuste positivo).
 * EGRESO: sale mercadería (venta, pérdida, ajuste negativo). AJUSTE: corrección manual que setea un
 * stock exacto.
 */
public enum TipoMovimiento {
  INGRESO,
  EGRESO,
  AJUSTE
}
