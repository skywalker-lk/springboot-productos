import { Box, CircularProgress } from '@mui/material';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ProductFormPage from '../pages/ProductFormPage';
import ProductsPage from '../pages/ProductsPage';
import RecoverPage from '../pages/RecoverPage';
import ResetPage from '../pages/ResetPage';
import { AuthProvider, ProductProvider, useAuth } from '../store';

// MODO MOCK: Comentá la línea de arriba y descomentá esta para probar SIN backend:
// import { AuthProvider, useAuth } from '../store/AuthContext.mock';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/recover"
              element={
                <PublicRoute>
                  <RecoverPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset"
              element={
                <PublicRoute>
                  <ResetPage />
                </PublicRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <ProductFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <ProductFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
