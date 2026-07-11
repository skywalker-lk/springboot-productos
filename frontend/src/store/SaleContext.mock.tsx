import { createContext, useContext, useEffect, useReducer } from 'react';
import type { Sale, SaleItem } from '../types/sale';
import { useProductContext } from './index';
import { type SaleState, saleReducer } from './saleReducer';

const SALE_STORAGE_KEY = 'productos-sales';

const saleInitialState: SaleState = {
  sales: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const SaleContext = createContext(
  {} as {
    state: SaleState;
    addSale: (items: SaleItem[], userId: string, userName: string) => void;
    loadSales: () => void;
    clearError: () => void;
  },
);

export const useSale = () => useContext(SaleContext);

export const SaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(saleReducer, saleInitialState);
  const { deductStock } = useProductContext();

  const loadSales = () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const stored = localStorage.getItem(SALE_STORAGE_KEY);
      if (stored) {
        const parsed: Sale[] = JSON.parse(stored);
        dispatch({ type: 'LOAD_SALES', payload: { sales: parsed, total: parsed.length } });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar ventas' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only init
  useEffect(() => {
    loadSales();
  }, []);

  const addSale = (items: SaleItem[], userId: string, userName: string) => {
    try {
      // 1. Crear la venta
      const total = items.reduce((sum: number, item: SaleItem) => sum + item.subtotal, 0);
      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        date: new Date().toISOString(),
        userId,
        userName,
        items,
        total,
        status: 'completed',
      };

      // 2. Guardar venta en localStorage
      const updatedSales = [...state.sales, newSale];
      localStorage.setItem(SALE_STORAGE_KEY, JSON.stringify(updatedSales));
      dispatch({ type: 'ADD_SALE', payload: newSale });

      // 3. Descontar stock por cada item (¡CRÍTICO!)
      items.forEach((item: SaleItem) => {
        deductStock(item.productId, item.quantity);
      });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Error al registrar venta' });
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <SaleContext.Provider
      value={{
        state,
        addSale,
        loadSales,
        clearError,
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};
