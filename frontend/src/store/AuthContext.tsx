import { createContext, useContext, useEffect, useReducer } from 'react';
import { apiService } from '../services/api';
import type { LoginData, RegisterData, StatusAuth, Usuario } from '../types/auth';
import { type AuthState, authReducer } from './authReducer';

const STATUS_AUTH = {
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  NOT_AUTHENTICATED: 'notAuthenticated',
} as const;

type AuthContextProps = {
  errorMessage: string;
  token: string | null;
  user: Usuario | null;
  status: StatusAuth;
  signUp: (registerData: RegisterData) => Promise<void>;
  signIn: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  removeError: () => void;
};

const authInitialState: AuthState = {
  status: STATUS_AUTH.CHECKING,
  token: null,
  user: null,
  errorMessage: '',
};

export const AuthContext = createContext({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // Al montar, si hay token guardado → verificar que siga válido
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'notAuthenticated' });
      return;
    }

    apiService
      .get<{ usuario: Usuario; token: string }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        dispatch({ type: 'signUp', payload: { token: res.token, user: res.usuario } });
      })
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'notAuthenticated' });
      });
  }, []);

  // POST /auth/login → recibe { usuario, token }
  const signIn = async (loginData: LoginData) => {
    try {
      const res = await apiService.post<{ usuario: Usuario; token: string }>(
        '/auth/login',
        loginData,
      );

      localStorage.setItem('token', res.token);
      dispatch({ type: 'signUp', payload: { token: res.token, user: res.usuario } });
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'msg' in error
          ? (error as { msg: string }).msg
          : 'Error al iniciar sesión';
      dispatch({ type: 'addError', payload: msg });
      throw error;
    }
  };

  // POST /auth/register → recibe { usuario, token }
  const signUp = async ({ nombre, correo, password }: RegisterData) => {
    try {
      const res = await apiService.post<{ usuario: Usuario; token: string }>('/auth/register', {
        nombre,
        correo,
        password,
      });

      localStorage.setItem('token', res.token);
      dispatch({ type: 'signUp', payload: { token: res.token, user: res.usuario } });
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'msg' in error
          ? (error as { msg: string }).msg
          : 'Error al registrarse';
      dispatch({ type: 'addError', payload: msg });
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    dispatch({ type: 'logout' });
  };

  const removeError = () => dispatch({ type: 'removeError' });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        logout,
        removeError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
