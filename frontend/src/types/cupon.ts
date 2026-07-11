/** Coincide con el backend com.techlab.ecommerce.model.cupon.TipoDescuento */
export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO';

export interface Cupon {
  id: number;
  codigo: string;
  tipo: TipoDescuento;
  valorDescuento: number;
  montoMinimo: number | null;
  fechaExpiracion: string | null;
  usosMaximos: number;
  usosActuales: number;
  activo: boolean;
  createdAt: string;
}

export interface CuponListResponse {
  total: number;
  cupones: Cupon[];
}

export interface ValidarCuponResponse {
  codigo: string;
  descuento: number;
  totalFinal: number;
  valido: boolean;
  mensaje?: string;
}
