import { createContext, useContext, useEffect, useReducer } from 'react';
import type { LoginData, RegisterData, StatusAuth, UserRole, Usuario } from '../types/auth';
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

// MOCK temporal para probar el CRUD sin backend
const MOCK_USERS: Record<string, Usuario> = {
  vendedor1: {
    uid: 'user-vendedor-1',
    nombre: 'Vendedor Test',
    correo: 'vendedor@test.com',
    rol: 'vendedor' as UserRole,
    estado: true,
    google: false,
    telefono: '123456789',
  },
  gerente1: {
    uid: 'user-gerente-1',
    nombre: 'Gerente Test',
    correo: 'gerente@test.com',
    rol: 'gerente' as UserRole,
    estado: true,
    google: false,
    telefono: '987654321',
  },
  analista1: {
    uid: 'user-analista-1',
    nombre: 'Analista Test',
    correo: 'analista@test.com',
    rol: 'analista' as UserRole,
    estado: true,
    google: false,
    telefono: '555555555',
  },
};

// Default user for initial login
const DEFAULT_USER = MOCK_USERS.vendedor1;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  useEffect(() => {
    // Simular checkToken
    const tokenLocal = localStorage.getItem('token');
    if (tokenLocal) {
      const savedUserRole = (localStorage.getItem('userRole') as UserRole) || 'vendedor';
      const mockUser = MOCK_USERS[`${savedUserRole}1`] || DEFAULT_USER;
      dispatch({ type: 'signUp', payload: { token: tokenLocal, user: mockUser } });
    } else {
      dispatch({ type: 'notAuthenticated' });
    }
  }, []);

  const signIn = async (loginData: LoginData) => {
    try {
      // MOCK: Simular login exitoso
      // Determinar rol basado en el correo (para testing)
      let role: UserRole = 'vendedor';
      if (loginData.correo.includes('gerente')) role = 'gerente';
      if (loginData.correo.includes('analista')) role = 'analista';

      const mockUser = MOCK_USERS[`${role}1`] || DEFAULT_USER;
      const token = `mock-token-${role}`;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      dispatch({
        type: 'signUp',
        payload: { token, user: { ...mockUser, correo: loginData.correo } },
      });
    } catch {
      dispatch({
        type: 'addError',
        payload: 'Error de conexión (modo mock)',
      });
    }
  };

  const signUp = async ({ nombre, correo }: RegisterData) => {
    try {
      // MOCK: Simular registro (por defecto vendedor)
      const role: UserRole = 'vendedor';
      const mockUser = MOCK_USERS[`${role}1`] || DEFAULT_USER;
      const token = `mock-token-${role}`;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      dispatch({
        type: 'signUp',
        payload: { token, user: { ...mockUser, nombre, correo } },
      });
    } catch {
      dispatch({
        type: 'addError',
        payload: 'Error de conexión (modo mock)',
      });
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
