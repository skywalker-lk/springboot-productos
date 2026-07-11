export interface PedidoListResponse {
  total: number;
  pedidos: PedidoBackend[];
}

export interface PedidoBackend {
  id: string | number;
  fecha: string;
  cliente: string;
  total: number;
  estado: string;
  lineas: PedidoLinea[];
  usuario?: { identificador: number };
}

export interface PedidoLinea {
  producto?: { _id?: string; id?: string | number; nombre?: string };
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
