import { createContext, useContext, useEffect, useReducer } from 'react';
import type { CartItem } from '../types/cart';
import { type CartState, cartReducer } from './cartReducer';

const CART_STORAGE_KEY = 'ecommerce_cart_mock';

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

// Helper para calcular totales
const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      acc.totalItems += item.cantidad;
      acc.totalPrice += item.precio * item.cantidad;
      return acc;
    },
    { totalItems: 0, totalPrice: 0 },
  );
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = async (producto: CartItem): Promise<string | null> => {
    dispatch({ type: 'ADD_TO_CART', payload: producto });
    return null;
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateQuantity = (id: string, cantidad: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
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
