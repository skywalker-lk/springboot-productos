export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const baseURL = API_BASE;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

function redirectOn401(response: Response): void {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const config: FetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(`${baseURL}${endpoint}`, config);
  redirectOn401(response);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: 'Error de conexión' }));
    throw error;
  }

  return response.json();
};

export const apiService = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    api<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, data: unknown) =>
    api<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    api<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => api<T>(endpoint, { method: 'DELETE' }),
  upload: <T>(endpoint: string, formData: FormData): Promise<T> => {
    return fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
      },
      body: formData,
    }).then(async (res) => {
      redirectOn401(res);
      if (!res.ok) throw await res.json().catch(() => ({ msg: 'Error upload' }));
      return res.json();
    });
  },
};

// Helper para extraer mensaje de error tipado (evita `catch (e: any)`)
export function getErrorMessage(e: unknown, fallback = 'Error de conexión'): string {
  if (e && typeof e === 'object') {
    if ('msg' in e) return String((e as Record<string, unknown>).msg);
    if ('message' in e) return String((e as Record<string, unknown>).message);
  }
  return fallback;
}

export default api;
