import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { Producto } from '../types/product';
import type { ProductFilters } from './ProductContext';
import { productInitialState, productReducer } from './productReducer';

// MOCK de datos para probar sin backend
const MOCK_PRODUCTOS: Producto[] = [
  {
    _id: '1',
    nombre: 'Producto Demo 1',
    precio: 100,
    categoria: { id: 1, _id: 'cat1', nombre: 'Electrónica' },
    usuario: { _id: 'user1', nombre: 'Admin' },
    stock: 50,
  },
  {
    _id: '2',
    nombre: 'Producto Demo 2',
    precio: 250.5,
    categoria: { id: 2, _id: 'cat2', nombre: 'Hogar' },
    usuario: { _id: 'user1', nombre: 'Admin' },
    stock: 30,
  },
];

type ProductContextProps = {
  products: Producto[];
  filteredTotal: number;
  isLoading: boolean;
  currentFilters: ProductFilters;
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  addProduct: (categoryId: string, productName: string) => Promise<Producto>;
  updateProduct: (categoryId: string, productName: string, productId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  loadProductById: (productId: string) => Promise<Producto>;
  uploadImage: (formData: FormData, productId: string) => Promise<Producto>;
  deductStock: (productId: string, quantity: number) => void;
};

export const ProductContext = createContext({} as ProductContextProps);

export const useProductContext = () => useContext(ProductContext);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, productInitialState);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({});

  const loadProducts = async (filters?: ProductFilters) => {
    if (filters) setCurrentFilters(filters);
    try {
      dispatch({ type: 'setLoading', payload: true });

      setTimeout(() => {
        dispatch({
          type: 'loadProducts',
          payload: { productos: MOCK_PRODUCTOS, total: MOCK_PRODUCTOS.length },
        });
      }, 500);
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch({ type: 'setLoading', payload: false });
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only init
  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (categoryId: string, productName: string): Promise<Producto> => {
    try {
      const newProduct: Producto = {
        _id: Date.now().toString(),
        nombre: productName,
        precio: 0,
        categoria: { id: Number(categoryId) || 0, _id: categoryId, nombre: 'Categoría' },
        usuario: { _id: 'user1', nombre: 'Admin' },
        stock: 0,
      };
      dispatch({ type: 'addProduct', payload: newProduct });
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (
    categoryId: string,
    productName: string,
    productId: string,
  ): Promise<void> => {
    try {
      const updatedProduct: Producto = {
        _id: productId,
        nombre: productName,
        precio: 0,
        categoria: { id: Number(categoryId) || 0, _id: categoryId, nombre: 'Categoría' },
        usuario: { _id: 'user1', nombre: 'Admin' },
        stock: 0,
      };
      dispatch({ type: 'updateProduct', payload: updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      dispatch({ type: 'deleteProduct', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const loadProductById = async (productId: string): Promise<Producto> => {
    const product = state.products.find((p) => p._id === productId);
    if (product) return product;
    throw new Error('Producto no encontrado');
  };

  const uploadImage = async (_formData: FormData, productId: string): Promise<Producto> => {
    // MOCK: Simular subida
    const product = state.products.find((p) => p._id === productId);
    if (product) return product;
    throw new Error('Producto no encontrado');
  };

  const deductStock = (productId: string, quantity: number): void => {
    dispatch({
      type: 'deductStock',
      payload: { productId, quantity },
    });
  };

  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        filteredTotal: state.filteredTotal,
        isLoading: state.isLoading,
        currentFilters,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        loadProductById,
        uploadImage,
        deductStock,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
