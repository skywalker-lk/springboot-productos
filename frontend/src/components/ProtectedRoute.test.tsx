import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../store', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderRoute = (props: {
  requireAuth?: boolean;
  requireGuest?: boolean;
  minRole?: string;
}) =>
  render(
    <MemoryRouter initialEntries={['/test']}>
      <ProtectedRoute {...props}>
        <div data-testid="children">Contenido protegido</div>
      </ProtectedRoute>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  it('muestra spinner mientras checking', () => {
    mockUseAuth.mockReturnValue({ status: 'checking', user: null });
    renderRoute({});
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirige a /login si no autenticado', () => {
    mockUseAuth.mockReturnValue({ status: 'notAuthenticated', user: null });
    renderRoute({});
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('muestra children si autenticado', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      user: { rol: 'vendedor' },
    });
    renderRoute({});
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirige autenticados a /catalog si requireGuest', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      user: { rol: 'vendedor' },
    });
    renderRoute({ requireGuest: true });
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('muestra children si es invitado y requireGuest', () => {
    mockUseAuth.mockReturnValue({ status: 'notAuthenticated', user: null });
    renderRoute({ requireGuest: true });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirige a /catalog si no cumple rol mínimo', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      user: { rol: 'vendedor' },
    });
    renderRoute({ minRole: 'gerente' });
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('muestra children si cumple rol mínimo', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      user: { rol: 'administrador' },
    });
    renderRoute({ minRole: 'gerente' });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
