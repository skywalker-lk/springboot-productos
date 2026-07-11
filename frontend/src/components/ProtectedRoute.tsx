import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Si es true, solo accesible para usuarios autenticados (default: true) */
  requireAuth?: boolean;
  /** Si es true, solo accesible para usuarios NO autenticados (login/register) */
  requireGuest?: boolean;
  /** Rol mínimo requerido (según jerarquía de abajo) */
  minRole?: UserRole;
}

/**
 * Jerarquía de roles (de menor a mayor privilegio).
 * Coincide con la matriz de permisos del backend (AuthInterceptor).
 */
const ROLE_HIERARCHY: Record<string, number> = {
  cliente: 0,
  usuario_carga: 1,
  inventorista: 2,
  vendedor: 2,
  analista: 2,
  gerente: 3,
  administrador: 4,
};

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireGuest = false,
  minRole,
}: ProtectedRouteProps) => {
  const { status, user } = useAuth();

  // Mientras verifica el token
  if (status === 'checking') {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Rutas públicas solo para invitados (login, register, recover, reset)
  if (requireGuest) {
    if (status === 'authenticated') {
      return <Navigate to="/catalog" replace />;
    }
    return <>{children}</>;
  }

  // Rutas protegidas
  if (requireAuth && status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol mínimo
  if (minRole && user && ROLE_HIERARCHY[user.rol] < ROLE_HIERARCHY[minRole]) {
    return <Navigate to="/catalog" replace />;
  }

  return <>{children}</>;
};
