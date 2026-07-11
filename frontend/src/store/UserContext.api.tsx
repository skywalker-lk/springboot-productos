import { createContext, useContext, useEffect, useReducer } from 'react';
import { userService } from '../services/userService';
import type { UserFormData } from '../types/user';
import { type UserState, userReducer } from './userReducer';

function getErrorMessage(e: unknown, fallback = 'Error de conexión'): string {
  if (e && typeof e === 'object' && 'msg' in e) return String((e as { msg: string }).msg);
  return fallback;
}

const userInitialState: UserState = {
  users: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const UserContext = createContext(
  {} as {
    state: UserState;
    loadUsers: (pagina?: number, limite?: number) => void;
    addUser: (data: UserFormData) => void;
    updateUser: (id: string, data: Partial<UserFormData>) => void;
    deleteUser: (id: string) => void;
    clearError: () => void;
  },
);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, userInitialState);

  const loadUsers = async (pagina = 0, limite = 50) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await userService.list(pagina, limite);
      dispatch({ type: 'LOAD_USERS', payload: { users: result.users, total: result.total } });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(e, 'Error al cargar usuarios') });
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = async (data: UserFormData) => {
    try {
      const newUser = await userService.create(data);
      dispatch({ type: 'ADD_USER', payload: newUser });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(e, 'Error al crear usuario') });
    }
  };

  const updateUser = async (id: string, data: Partial<UserFormData>) => {
    try {
      const updatedUser = await userService.update(id, data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(e, 'Error al actualizar usuario') });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (e: unknown) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(e, 'Error al eliminar usuario') });
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <UserContext.Provider value={{ state, loadUsers, addUser, updateUser, deleteUser, clearError }}>
      {children}
    </UserContext.Provider>
  );
};
