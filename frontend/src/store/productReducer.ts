import type { Producto } from '../types/product';

export interface ProductState {
  products: Producto[];
  filteredTotal: number;
  isLoading: boolean;
}

export type ProductAction =
  | { type: 'loadProducts'; payload: { productos: Producto[]; total: number } }
  | { type: 'addProduct'; payload: Producto }
  | { type: 'updateProduct'; payload: Producto }
  | { type: 'deleteProduct'; payload: string }
  | { type: 'setLoading'; payload: boolean }
  | { type: 'deductStock'; payload: { productId: string; quantity: number } };

export const productInitialState: ProductState = {
  products: [],
  filteredTotal: 0,
  isLoading: true,
};

export const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'loadProducts':
      return {
        ...state,
        products: action.payload.productos,
        filteredTotal: action.payload.total,
        isLoading: false,
      };
    case 'addProduct':
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case 'updateProduct':
      return {
        ...state,
        products: state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product,
        ),
      };
    case 'deleteProduct':
      return {
        ...state,
        products: state.products.filter((product) => product._id !== action.payload),
      };
    case 'setLoading':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'deductStock':
      return {
        ...state,
        products: state.products.map((product) =>
          product._id === action.payload.productId
            ? { ...product, stock: product.stock - action.payload.quantity }
            : product,
        ),
      };
    default:
      return state;
  }
};
