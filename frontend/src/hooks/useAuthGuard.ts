import { useAuth } from '../store';
import type { UserRole } from '../types/auth';

// Hook para proteger componentes/rutas basado en roles
export const useAuthGuard = () => {
  const { user, status } = useAuth();

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.rol);
  };

  const isVendedor = (): boolean => hasRole(['vendedor', 'gerente']);
  const isGerente = (): boolean => hasRole(['gerente']);
  const isAnalista = (): boolean => hasRole(['analista', 'gerente']);

  const canManageProducts = (): boolean => hasRole(['gerente']);
  const canManageUsers = (): boolean => hasRole(['gerente']);
  const canRegisterSales = (): boolean => hasRole(['vendedor', 'gerente']);
  const canViewStats = (): boolean => hasRole(['analista', 'gerente']);

  const isAuthenticated = (): boolean => status === 'authenticated';
  const isChecking = (): boolean => status === 'checking';

  return {
    user,
    status,
    hasRole,
    isVendedor,
    isGerente,
    isAnalista,
    canManageProducts,
    canManageUsers,
    canRegisterSales,
    canViewStats,
    isAuthenticated,
    isChecking,
  };
};
