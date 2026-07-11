import type { UserFormData, UserProfile } from '../types/user';
import { apiService } from './api';

/** DTO que devuelve el backend (sin password) */
interface UsuarioDTO {
  uid: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: boolean;
  google: boolean;
}

interface UsuarioListResponse {
  total: number;
  usuarios: UsuarioDTO[];
}

function mapToProfile(dto: UsuarioDTO): UserProfile {
  return {
    id: dto.uid,
    nombre: dto.nombre,
    correo: dto.correo,
    telefono: dto.telefono,
    rol: dto.rol as UserProfile['rol'],
    estado: dto.estado ? 'activo' : 'inactivo',
    fechaCreacion: new Date().toISOString(),
  };
}

export const userService = {
  list: (pagina = 0, limite = 50): Promise<{ users: UserProfile[]; total: number }> =>
    apiService
      .get<UsuarioListResponse>(`/usuarios?pagina=${pagina}&limite=${limite}`)
      .then((res) => ({ users: res.usuarios.map(mapToProfile), total: res.total })),

  getById: (id: string): Promise<UserProfile> =>
    apiService.get<UsuarioDTO>(`/usuarios/${id}`).then(mapToProfile),

  create: (data: UserFormData): Promise<UserProfile> => {
    const [nombre, ...apellidoParts] = data.nombre.trim().split(' ');
    return apiService
      .post<UsuarioDTO>('/usuarios', {
        nombre: nombre || data.nombre,
        apellido: apellidoParts.join(' ') || nombre || '',
        email: data.correo,
        password: data.password || '123456',
        telefono: data.telefono || '',
        rol: data.rol,
      })
      .then(mapToProfile);
  },

  update: (id: string, data: Partial<UserFormData>): Promise<UserProfile> => {
    const [nombre, ...apellidoParts] = (data.nombre || '').trim().split(' ');
    return apiService
      .put<UsuarioDTO>(`/usuarios/${id}`, {
        nombre: nombre || '',
        apellido: apellidoParts.join(' ') || nombre || '',
        email: data.correo || '',
        password: data.password || null,
        telefono: data.telefono || '',
        rol: data.rol || 'vendedor',
      })
      .then(mapToProfile);
  },

  delete: (id: string): Promise<void> => apiService.delete<void>(`/usuarios/${id}`),
};
