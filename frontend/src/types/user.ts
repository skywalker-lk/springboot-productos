// User Types for User Management (Gentleman Programming)

import type { UserRole } from './auth';

// Flat Interfaces
export interface UserProfile {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: UserRole;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string; // ISO string
}

// Form data for create/edit user
export interface UserFormData {
  nombre: string;
  correo: string;
  telefono?: string;
  rol: UserRole;
  password?: string; // Only for create or password change
}

// Type Guard
export function isUserProfile(value: unknown): value is UserProfile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'nombre' in value &&
    'correo' in value &&
    'rol' in value
  );
}
