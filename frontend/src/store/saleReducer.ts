import type { Sale } from '../types/sale';

export interface SaleState {
  sales: Sale[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export type SaleAction =
  | { type: 'LOAD_SALES'; payload: { sales: Sale[]; total: number } }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: SaleState = {
  sales: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const saleReducer = (state: SaleState = initialState, action: SaleAction): SaleState => {
  switch (action.type) {
    case 'LOAD_SALES':
      return {
        ...state,
        sales: action.payload.sales,
        total: action.payload.total,
        isLoading: false,
        error: null,
      };

    case 'ADD_SALE':
      return {
        ...state,
        sales: [...state.sales, action.payload],
        isLoading: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
