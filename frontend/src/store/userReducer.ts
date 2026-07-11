import type { UserProfile } from '../types/user';

export interface UserState {
  users: UserProfile[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export type UserAction =
  | { type: 'LOAD_USERS'; payload: { users: UserProfile[]; total: number } }
  | { type: 'ADD_USER'; payload: UserProfile }
  | { type: 'UPDATE_USER'; payload: UserProfile }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: UserState = {
  users: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const userReducer = (state: UserState = initialState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOAD_USERS':
      return {
        ...state,
        users: action.payload.users,
        total: action.payload.total,
        isLoading: false,
        error: null,
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
        isLoading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
        isLoading: false,
        error: null,
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
        isLoading: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
