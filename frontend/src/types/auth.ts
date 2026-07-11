// Const Types Pattern (Gentleman Programming)
export const STATUS_AUTH = {
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  NOT_AUTHENTICATED: 'notAuthenticated',
} as const;

export type StatusAuth = (typeof STATUS_AUTH)[keyof typeof STATUS_AUTH];

// User Roles (RBAC) — matchea los roles del backend (UsuarioDTO.mapearRol)
export const USER_ROLES = {
  ADMINISTRADOR: 'administrador',
  GERENTE: 'gerente',
  ANALISTA: 'analista',
  VENDEDOR: 'vendedor',
  INVENTORISTA: 'inventorista',
  CLIENTE: 'cliente',
  USUARIO_CARGA: 'usuario_carga',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Flat Interfaces (no nested objects inline)
export interface Usuario {
  rol: UserRole;
  estado: boolean;
  google: boolean;
  nombre: string;
  correo: string;
  uid: string;
  img?: string;
  telefono?: string;
}

export interface LoginData {
  correo: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  password: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

export interface ForgotPasswordRequest {
  correo: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ApiResponse {
  msg: string;
}

// Type Guard
export function isUsuario(value: unknown): value is Usuario {
  return (
    typeof value === 'object' &&
    value !== null &&
    'uid' in value &&
    'nombre' in value &&
    'correo' in value
  );
}
