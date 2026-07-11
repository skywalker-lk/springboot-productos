// Flat Interfaces Pattern (Gentleman Programming)
export interface CreadoPor {
  _id: string;
  nombre: string;
}

export interface Categoria {
  _id: string;
  nombre: string;
  id: number;
  descripcion?: string;
  usuario?: CreadoPor;
}

export interface Producto {
  precio: number;
  precioBase?: number;
  porcentajeIVA?: number;
  descuentoCantidad?: number;
  descuentoPorcentaje?: number;
  _id: string;
  nombre: string;
  categoria: Categoria;
  usuario: CreadoPor;
  img?: string;
  stock: number;
}

export interface ProductsResponse {
  total: number;
  productos: Producto[];
}

export interface CategoriesResponse {
  total: number;
  categorias: Categoria[];
}

// Type Guards
export function isProducto(value: unknown): value is Producto {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'nombre' in value &&
    'precio' in value
  );
}

export function isCategoria(value: unknown): value is Categoria {
  return typeof value === 'object' && value !== null && '_id' in value && 'nombre' in value;
}
