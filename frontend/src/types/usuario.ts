import type { UserProfile } from './user';

export interface UsuarioListResponse {
  total: number;
  usuarios: import('./user').UserProfile[];
}

export type { UserProfile };
