import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../store', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../hooks/useForm', () => ({
  useForm: () => ({
    form: { correo: '', password: '' },
    onChange: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const defaultAuth = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  errorMessage: null,
  removeError: vi.fn(),
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(defaultAuth);
  });

  it('renderiza formulario de login', () => {
    renderPage();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /correo/i })).toBeInTheDocument();
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
  });

  it('no muestra error si errorMessage es null', () => {
    renderPage();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra error de autenticación', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuth, errorMessage: 'Credenciales inválidas' });
    renderPage();
    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('alterna a formulario de registro', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('¿No tienes cuenta? Regístrate'));

    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nombre/i })).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('tiene link a recuperación de contraseña', () => {
    renderPage();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
  });
});
