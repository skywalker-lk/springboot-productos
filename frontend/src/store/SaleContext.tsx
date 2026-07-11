import { createContext, useContext, useEffect, useReducer } from 'react';
import { apiService } from '../services/api';
import type { PedidoBackend, PedidoLinea, PedidoListResponse } from '../types/pedido';
import type { Sale, SaleItem } from '../types/sale';
import { useProductContext } from './index';
import { type SaleState, saleReducer } from './saleReducer';

type SaleContextProps = {
  state: SaleState;
  addSale: (
    items: SaleItem[],
    userId: string,
    userName: string,
    codigoCupon?: string,
  ) => Promise<void>;
  loadSales: (desde?: string, hasta?: string, pagina?: number, limite?: number) => Promise<void>;
  clearError: () => void;
};

const saleInitialState: SaleState = {
  sales: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const SaleContext = createContext({} as SaleContextProps);

export const useSale = () => useContext(SaleContext);

// PedidoLinea y PedidoBackend se importan de types/pedido

// Mapear un Pedido del backend al tipo Sale del frontend
function mapBackendPedidoToSale(pedido: PedidoBackend): Sale {
  return {
    id: String(pedido.id),
    date: pedido.fecha, // "2026-06-02"
    userId: pedido.usuario ? String(pedido.usuario.identificador) : pedido.cliente || 'mostrador',
    userName: pedido.cliente || 'Mostrador',
    items: (pedido.lineas || []).map((linea: PedidoLinea) => ({
      productId: String(linea.producto?._id ?? linea.producto?.id ?? ''),
      productName: linea.descripcion || linea.producto?.nombre || '',
      quantity: linea.cantidad,
      unitPrice: linea.precioUnitario,
      subtotal: linea.subtotal,
    })),
    total: pedido.total,
    status: pedido.estado === 'Confirmado' ? 'completed' : 'pending',
  };
}

export const SaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(saleReducer, saleInitialState);
  const { deductStock } = useProductContext();

  const loadSales = async (desde?: string, hasta?: string, pagina = 0, limite = 50) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      let endpoint = '/pedidos';
      const params = new URLSearchParams();
      params.set('pagina', String(pagina));
      params.set('limite', String(limite));
      if (desde && hasta) {
        params.set('desde', desde);
        params.set('hasta', hasta);
      }
      endpoint += `?${params.toString()}`;

      const data = await apiService.get<PedidoListResponse>(endpoint);
      const sales: Sale[] = data.pedidos.map(mapBackendPedidoToSale);
      dispatch({ type: 'LOAD_SALES', payload: { sales, total: data.total } });
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'msg' in error
          ? (error as { msg: string }).msg
          : 'Error al cargar ventas';
      dispatch({ type: 'SET_ERROR', payload: msg });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only init
  useEffect(() => {
    loadSales();
  }, []);

  const addSale = async (
    items: SaleItem[],
    userId: string,
    userName: string,
    codigoCupon?: string,
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Transformar items al formato que espera el backend
      const idsProducto = items.map((item) => Number(item.productId));
      const cantidades = items.map((item) => item.quantity);
      const nombreCliente = userName || userId || 'Mostrador';

      const usuarioIdNum = parseInt(userId, 10);
      const pedidoCreado = await apiService.post<PedidoBackend>('/pedidos', {
        idsProducto,
        cantidades,
        nombreCliente,
        ...(Number.isNaN(usuarioIdNum) ? {} : { usuarioId: usuarioIdNum }),
        ...(codigoCupon ? { codigoCupon } : {}),
      });

      // Mapear la respuesta a Sale
      const newSale = mapBackendPedidoToSale(pedidoCreado);
      dispatch({ type: 'ADD_SALE', payload: newSale });

      // Descontar stock localmente
      items.forEach((item) => {
        deductStock(item.productId, item.quantity);
      });
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'msg' in error
          ? (error as { msg: string }).msg
          : 'Error al registrar venta';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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
