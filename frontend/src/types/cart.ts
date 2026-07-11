// Cart Types (Gentleman Programming - Flat Interfaces)
export interface CartItem {
  _id: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Type Guard
export function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'nombre' in value &&
    'precio' in value &&
    'cantidad' in value
  );
}
