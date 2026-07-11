import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from './Navbar';

const mockUseAuth = vi.fn();
const mockUseCart = vi.fn();
const mockUseNotificaciones = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../store', () => ({
  useAuth: () => mockUseAuth(),
  useCart: () => mockUseCart(),
}));

vi.mock('../hooks/useNotificaciones', () => ({
  useNotificaciones: () => mockUseNotificaciones(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const baseAuth = {
  user: null as { nombre: string; rol: string } | null,
  logout: vi.fn(),
};

const baseCart = {
  totalItems: 0,
  items: [],
};

const baseNotif = {
  notificaciones: [],
  ultima: null,
};

const renderNav = () =>
  render(
    <MemoryRouter initialEntries={['/catalog']}>
      <Navbar />
    </MemoryRouter>,
  );

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(baseAuth);
    mockUseCart.mockReturnValue(baseCart);
    mockUseNotificaciones.mockReturnValue(baseNotif);
  });

  it('renderiza logo y nombre de la tienda', () => {
    renderNav();
    expect(screen.getByText('Mi Tienda')).toBeInTheDocument();
  });

  it('muestra botón de iniciar sesión para invitados', () => {
    renderNav();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('muestra nombre de usuario y botón salir si autenticado', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { nombre: 'Juan', rol: 'vendedor' },
    });
    renderNav();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
    expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
  });

  it('muestra enlaces de navegación según el rol', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { nombre: 'Ana', rol: 'administrador' },
    });
    renderNav();
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Auditoría')).toBeInTheDocument();
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
  });

  it('no muestra enlaces restringidos a invitados', () => {
    renderNav();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    expect(screen.queryByText('Auditoría')).not.toBeInTheDocument();
    expect(screen.queryByText('Webhooks')).not.toBeInTheDocument();
  });

  it('muestra badge de carrito con items', () => {
    mockUseCart.mockReturnValue({ ...baseCart, totalItems: 3 });
    renderNav();
    expect(screen.getByLabelText('Carrito')).toBeInTheDocument();
  });

  it('muestra badge de notificaciones', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { nombre: 'Ana', rol: 'gerente' },
    });
    mockUseNotificaciones.mockReturnValue({
      notificaciones: [{ id: 1, titulo: 'Stock bajo' }],
      ultima: null,
    });
    renderNav();
    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
  });

  it('llama a logout y navega al hacer click en Salir', async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { nombre: 'Juan', rol: 'vendedor' },
      logout: mockLogout,
    });
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('Salir'));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
