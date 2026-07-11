import type { CartItem } from '../types/cart';

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Si ya existe, aumentar cantidad
      const existingItem = state.items.find((item) => item._id === action.payload._id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === action.payload._id
              ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      if (action.payload.cantidad <= 0) {
        // Si la cantidad es 0 o menos, eliminar el item
        return {
          ...state,
          items: state.items.filter((item) => item._id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload.id ? { ...item, cantidad: action.payload.cantidad } : item,
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
};
