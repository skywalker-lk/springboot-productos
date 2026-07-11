import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminContactosPage from './pages/AdminContactosPage';
import AuditoriaPage from './pages/AuditoriaPage';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import CategoriesPage from './pages/CategoriesPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import CuponesPage from './pages/CuponesPage';
import LoginPage from './pages/LoginPage';
import MisPedidosPage from './pages/MisPedidosPage';
import NewSalePage from './pages/NewSalePage';
import ProductFormPage from './pages/ProductFormPage';
import ProductsPage from './pages/ProductsPage';
import RecoverPage from './pages/RecoverPage';
import ResetPage from './pages/ResetPage';
import SalesPage from './pages/SalesPage';
import StatsPage from './pages/StatsPage';
import StockPage from './pages/StockPage';
import UserFormPage from './pages/UserFormPage';
import UsersPage from './pages/UsersPage';
import WebhooksPage from './pages/WebhooksPage';
import { CartProvider, UserProvider } from './store';
import { AuthProvider } from './store/AuthContext';
import { ProductProvider } from './store/ProductContext';
import { SaleProvider } from './store/SaleContext';
import { muiTheme } from './theme/muiTheme';

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <UserProvider>
                <SaleProvider>
                  <Routes>
                    {/* Auth routes — solo para invitados */}
                    <Route
                      path="/login"
                      element={
                        <ProtectedRoute requireGuest>
                          <LoginPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recover"
                      element={
                        <ProtectedRoute requireGuest>
                          <RecoverPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reset"
                      element={
                        <ProtectedRoute requireGuest>
                          <ResetPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* App routes */}
                    <Route
                      path="/catalog"
                      element={
                        <>
                          <Navbar />
                          <CatalogPage />
                          <Footer />
                        </>
                      }
                    />
                    <Route
                      path="/products"
                      element={
                        <ProtectedRoute>
                          <Navbar />
                          <ProductsPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/products/new"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <ProductFormPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/products/:id/edit"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <ProductFormPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/categories"
                      element={
                        <>
                          <Navbar />
                          <CategoriesPage />
                          <Footer />
                        </>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <>
                          <Navbar />
                          <CartPage />
                          <Footer />
                        </>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <>
                          <Navbar />
                          <CheckoutPage />
                          <Footer />
                        </>
                      }
                    />
                    <Route
                      path="/contact"
                      element={
                        <>
                          <Navbar />
                          <ContactPage />
                          <Footer />
                        </>
                      }
                    />
                    <Route
                      path="/admin-contactos"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <AdminContactosPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mis-pedidos"
                      element={
                        <ProtectedRoute>
                          <Navbar />
                          <MisPedidosPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cupones"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <CuponesPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/auditoria"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <AuditoriaPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/webhooks"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <WebhooksPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <UsersPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users/new"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <UserFormPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users/:id/edit"
                      element={
                        <ProtectedRoute minRole="gerente">
                          <Navbar />
                          <UserFormPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sales"
                      element={
                        <ProtectedRoute>
                          <Navbar />
                          <SalesPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/sales/new"
                      element={
                        <ProtectedRoute>
                          <Navbar />
                          <NewSalePage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/stock"
                      element={
                        <ProtectedRoute>
                          <Navbar />
                          <StockPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/stats"
                      element={
                        <ProtectedRoute>
                          <Navbar />
                          <StatsPage />
                          <Footer />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/catalog" replace />} />
                    <Route path="*" element={<Navigate to="/catalog" replace />} />
                  </Routes>
                </SaleProvider>
              </UserProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
