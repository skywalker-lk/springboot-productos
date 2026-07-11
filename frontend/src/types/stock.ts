/** Coincide con el backend com.techlab.ecommerce.model.stock.TipoMovimiento */
export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'AJUSTE';

/** Coincide con el backend com.techlab.ecommerce.model.stock.MovimientoStock */
export interface MovimientoStock {
  id: number;
  producto: {
    _id: number;
    nombre: string;
  };
  tipo: TipoMovimiento;
  cantidad: number; // puede ser negativo (egreso)
  stockAnterior: number;
  stockPosterior: number;
  motivo: string;
  pedidoId: number | null;
  fecha: string; // ISO LocalDateTime
}
