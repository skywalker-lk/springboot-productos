import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { apiService } from '../services/api';
import type { CartItem } from '../types/cart';
import { getImageUrl } from '../utils/imageUrl';
import { type CartState, cartReducer } from './cartReducer';

const CLIENT_STORAGE_KEY = 'cart_client_name';

type CartContextProps = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (producto: CartItem) => Promise<string | null>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
};

const cartInitialState: CartState = {
  items: [],
};

export const CartContext = createContext({} as CartContextProps);
export const useCart = () => useContext(CartContext);

// ─── Helpers ────────────────────────────────────────────────

const getClientId = (): string => {
  let clientId = localStorage.getItem(CLIENT_STORAGE_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_STORAGE_KEY, clientId);
  }
  return clientId;
};

/**
 * Map backend CarritoItem JSON → frontend CartItem.
 *
 * Backend shape (CarritoController returns the full Carrito):
 *   items: [{ id, cantidad, subtotal, producto: { _id, nombre, precio, ... } }]
 *
 * DELETE and PUT use /{cliente}/items/{productoId}, so removeFromCart
 * and updateQuantity receive the Producto._id directly.
 */
const mapBackendItem = (item: Record<string, unknown>): CartItem => {
  const producto = (item.producto ?? {}) as Record<string, unknown>;
  return {
    _id: String(producto._id ?? producto.id ?? ''),
    nombre: String(producto.nombre ?? ''),
    precio: Number(producto.precio ?? 0),
    imagen:
      getImageUrl(String(producto.img ?? '')) || 'https://dummyimage.com/300x200/cccccc/000000.png',
    cantidad: Number(item.cantidad ?? 0),
  };
};

const calculateTotals = (items: CartItem[]) =>
  items.reduce(
    (acc, item) => {
      acc.totalItems += item.cantidad;
      acc.totalPrice += item.precio * item.cantidad;
      return acc;
    },
    { totalItems: 0, totalPrice: 0 },
  );

// ─── Provider ───────────────────────────────────────────────

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  const loadCart = useCallback(async () => {
    try {
      const raw = (await apiService.get(`/carrito/${getClientId()}`)) as Record<string, unknown>;
      const rawItems = (raw.items ?? []) as Record<string, unknown>[];
      const items = rawItems.map(mapBackendItem);
      dispatch({ type: 'LOAD_CART', payload: items });
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (producto: CartItem): Promise<string | null> => {
    // Optimistic update
    dispatch({ type: 'ADD_TO_CART', payload: producto });

    try {
      await apiService.post(`/carrito/${getClientId()}/items`, {
        productoId: parseInt(producto._id, 10),
        cantidad: producto.cantidad,
      });
      // Refresh from server to get accurate state
      await loadCart();
      return null; // success
    } catch (error: unknown) {
      // Extraer mensaje del backend (StockInsuficienteException → 400)
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Error al agregar al carrito';
      console.error('Error adding to cart:', message);
      await loadCart(); // revert optimistic update
      return message; // error string for the caller
    }
  };

  const removeFromCart = async (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });

    try {
      await apiService.delete(`/carrito/${getClientId()}/items/${id}`);
    } catch (error) {
      console.error('Error removing item:', error);
      await loadCart();
    }
  };

  const updateQuantity = async (id: string, cantidad: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } });

    try {
      await apiService.put(`/carrito/${getClientId()}/items/${id}`, {
        productoId: parseInt(id, 10),
        cantidad,
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      await loadCart();
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });

    try {
      await apiService.delete(`/carrito/${getClientId()}`);
    } catch (error) {
      console.error('Error clearing cart:', error);
      await loadCart();
    }
  };

  const { totalItems, totalPrice } = calculateTotals(state.items);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
