import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { apiService } from '../services/api';
import type { Producto, ProductsResponse } from '../types/product';
import { productInitialState, productReducer } from './productReducer';

export type ProductFilters = {
  q?: string;
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  stockMin?: number;
  stockMax?: number;
};

export interface ProductoExtras {
  precioBase?: number;
  porcentajeIVA?: number;
  descuentoCantidad?: number;
  descuentoPorcentaje?: number;
}

type ProductContextProps = {
  products: Producto[];
  filteredTotal: number;
  isLoading: boolean;
  currentFilters: ProductFilters;
  pagina: number;
  limite: number;
  loadProducts: (filters?: ProductFilters, pagina?: number, limite?: number) => Promise<void>;
  addProduct: (
    categoryId: string,
    productName: string,
    stock: number,
    price?: number,
    extras?: ProductoExtras,
  ) => Promise<Producto>;
  updateProduct: (
    categoryId: string,
    productName: string,
    productId: string,
    stock: number,
    price?: number,
    extras?: ProductoExtras,
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  loadProductById: (productId: string) => Promise<Producto>;
  uploadImage: (formData: FormData, productId: string) => Promise<Producto>;
  deductStock: (productId: string, quantity: number) => void;
};

// Estado inicial ahora vive en productReducer.ts

export const ProductContext = createContext({} as ProductContextProps);

export const useProductContext = () => useContext(ProductContext);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, productInitialState);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({});
  const [pagina, setPagina] = useState(0);
  const [limite] = useState(12);

  const buildParams = (filters: ProductFilters, page: number, limit: number): string => {
    const params = new URLSearchParams();
    params.set('pagina', String(page));
    params.set('limite', String(limit));
    if (filters.q) params.set('q', filters.q);
    if (filters.categoria) params.set('categoria', filters.categoria);
    if (filters.precioMin !== undefined) params.set('precioMin', String(filters.precioMin));
    if (filters.precioMax !== undefined) params.set('precioMax', String(filters.precioMax));
    if (filters.stockMin !== undefined) params.set('stockMin', String(filters.stockMin));
    if (filters.stockMax !== undefined) params.set('stockMax', String(filters.stockMax));
    return params.toString();
  };

  const loadProducts = async (filters?: ProductFilters, newPagina?: number, newLimite?: number) => {
    const activeFilters = filters ?? currentFilters;
    const page = newPagina ?? pagina;
    const limit = newLimite ?? limite;
    try {
      dispatch({ type: 'setLoading', payload: true });
      const query = buildParams(activeFilters, page, limit);
      const data = await apiService.get<ProductsResponse>(`/productos?${query}`);
      dispatch({ type: 'loadProducts', payload: { productos: data.productos, total: data.total } });
      if (filters) {
        setCurrentFilters(filters);
        setPagina(0);
      } else if (newPagina !== undefined) {
        setPagina(newPagina);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch({ type: 'setLoading', payload: false });
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only init
  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (
    categoryId: string,
    productName: string,
    stock: number = 0,
    price?: number,
    extras?: ProductoExtras,
  ): Promise<Producto> => {
    try {
      const data = await apiService.post<Producto>('/productos', {
        nombre: productName,
        categoria: categoryId,
        stock,
        precio: price ?? 0,
        ...extras,
      });
      dispatch({ type: 'addProduct', payload: data });
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (
    categoryId: string,
    productName: string,
    productId: string,
    stock: number = 0,
    price?: number,
    extras?: ProductoExtras,
  ): Promise<void> => {
    try {
      const data = await apiService.put<Producto>(`/productos/${productId}`, {
        nombre: productName,
        categoria: categoryId,
        stock,
        precio: price ?? undefined,
        ...extras,
      });
      dispatch({ type: 'updateProduct', payload: data });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      await apiService.delete(`/productos/${productId}`);
      dispatch({ type: 'deleteProduct', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const uploadImage = async (formData: FormData, productId: string): Promise<Producto> => {
    try {
      const data = await apiService.upload<Producto>(`/uploads/productos/${productId}`, formData);
      // Actualizar el producto en el store
      dispatch({ type: 'updateProduct', payload: data });
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const deductStock = (productId: string, quantity: number): void => {
    dispatch({
      type: 'deductStock',
      payload: { productId, quantity },
    });
  };

  const loadProductById = async (productId: string): Promise<Producto> => {
    try {
      const data = await apiService.get<Producto>(`/productos/${productId}`);
      return data;
    } catch (error) {
      console.error('Error loading product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        filteredTotal: state.filteredTotal,
        isLoading: state.isLoading,
        currentFilters,
        pagina,
        limite,
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
