// AuthContext REAL → conectado al backend Spring Boot
export { AuthContext, AuthProvider, useAuth } from './AuthContext';
export type { AuthAction, AuthState } from './authReducer';
export { authReducer } from './authReducer';
export { CartContext, CartProvider, useCart } from './CartContext';
export type { CartAction, CartState } from './cartReducer';
export { cartReducer } from './cartReducer';
// ProductContext REAL → conectado al backend Spring Boot
export { ProductContext, ProductProvider, useProductContext } from './ProductContext';
export type { ProductAction, ProductState } from './productReducer';
export { productReducer } from './productReducer';
export { SaleContext, SaleProvider, useSale } from './SaleContext';
export type { SaleAction, SaleState } from './saleReducer';
export { saleReducer } from './saleReducer';
export { UserContext, UserProvider, useUser } from './UserContext.api';
export type { UserAction, UserState } from './userReducer';
export { userReducer } from './userReducer';
