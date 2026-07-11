import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPage from './ResetPage';

const mockPost = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../services/api', () => ({
  apiService: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithToken = (token = 'valid-token') =>
  render(
    <MemoryRouter initialEntries={[`/reset?token=${token}`]}>
      <ResetPage />
    </MemoryRouter>,
  );

const renderWithoutToken = () =>
  render(
    <MemoryRouter initialEntries={['/reset']}>
      <ResetPage />
    </MemoryRouter>,
  );

describe('ResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sin token', () => {
    it('muestra error si no hay token', () => {
      renderWithoutToken();
      expect(screen.getByText('Token de recuperación no encontrado.')).toBeInTheDocument();
      expect(screen.getByText('Solicitar un nuevo enlace')).toBeInTheDocument();
    });
  });

  describe('con token', () => {
    const getPasswordInput = () => screen.getByLabelText(/nueva contraseña/i);
    const getConfirmInput = () => screen.getByLabelText(/confirmar contraseña/i);

    it('renderiza el formulario de cambio de contraseña', () => {
      renderWithToken();
      expect(screen.getByText('Nueva Contraseña')).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getConfirmInput()).toBeInTheDocument();
      expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument();
    });

    it('muestra error si las contraseñas no coinciden', async () => {
      const user = userEvent.setup();
      renderWithToken();
      await user.type(getPasswordInput(), '123456');
      await user.type(getConfirmInput(), '654321');
      await user.click(screen.getByText('Cambiar contraseña'));

      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('muestra error si la contraseña es muy corta', async () => {
      const user = userEvent.setup();
      renderWithToken();
      await user.type(getPasswordInput(), '12');
      await user.type(getConfirmInput(), '12');
      await user.click(screen.getByText('Cambiar contraseña'));

      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('envía el token y la nueva contraseña a la API', async () => {
      mockPost.mockResolvedValueOnce({ msg: 'ok' });
      const user = userEvent.setup();
      renderWithToken('token-123');
      await user.type(getPasswordInput(), 'nueva-pass');
      await user.type(getConfirmInput(), 'nueva-pass');
      await user.click(screen.getByText('Cambiar contraseña'));

      await waitFor(() => {
        expect(screen.getByText('Contraseña actualizada correctamente')).toBeInTheDocument();
      });
      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'token-123',
        password: 'nueva-pass',
      });
    });

    it('navega al login después de éxito', async () => {
      mockPost.mockResolvedValueOnce({ msg: 'ok' });
      const user = userEvent.setup();

      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderWithToken();
      await user.type(getPasswordInput(), 'nueva-pass');
      await user.type(getConfirmInput(), 'nueva-pass');
      await user.click(screen.getByText('Cambiar contraseña'));

      await waitFor(() => {
        expect(screen.getByText('Contraseña actualizada correctamente')).toBeInTheDocument();
      });

      await vi.advanceTimersByTimeAsync(4000);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      vi.useRealTimers();
    });

    it('muestra error si la API falla', async () => {
      mockPost.mockRejectedValueOnce(new Error('expiró'));
      const user = userEvent.setup();
      renderWithToken();
      await user.type(getPasswordInput(), 'nueva-pass');
      await user.type(getConfirmInput(), 'nueva-pass');
      await user.click(screen.getByText('Cambiar contraseña'));

      await waitFor(() => {
        expect(
          screen.getByText(/el enlace puede haber expirado/i),
        ).toBeInTheDocument();
      });
    });
  });
});
