import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecoverPage from './RecoverPage';

const mockPost = vi.fn();

vi.mock('../services/api', () => ({
  apiService: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <RecoverPage />
    </MemoryRouter>,
  );

const getEmailInput = () => screen.getByRole('textbox', { name: /correo electrónico/i });

describe('RecoverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario', () => {
    renderPage();
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    expect(getEmailInput()).toBeInTheDocument();
    expect(screen.getByText('Enviar enlace')).toBeInTheDocument();
    expect(screen.getByText('Volver al inicio de sesión')).toBeInTheDocument();
  });

  it('muestra error si el email es inválido', async () => {
    const user = userEvent.setup();
    renderPage();
    // "mail@example" es HTML5-válido (type=email) pero falla el regex que exige un punto en el dominio
    await user.type(getEmailInput(), 'mail@example');
    await user.click(screen.getByText('Enviar enlace'));

    expect(screen.getByText('Correo electrónico inválido')).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('llama a la API con email válido y muestra éxito', async () => {
    mockPost.mockResolvedValueOnce({ msg: 'ok' });
    const user = userEvent.setup();
    renderPage();
    await user.type(getEmailInput(), 'test@example.com');
    await user.click(screen.getByText('Enviar enlace'));

    await waitFor(() => {
      expect(
        screen.getByText('Si el correo existe, recibirás un enlace de recuperación.'),
      ).toBeInTheDocument();
    });
    expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { correo: 'test@example.com' });
  });

  it('muestra error si la API falla', async () => {
    mockPost.mockRejectedValueOnce(new Error('Error de conexión'));
    const user = userEvent.setup();
    renderPage();
    await user.type(getEmailInput(), 'test@example.com');
    await user.click(screen.getByText('Enviar enlace'));

    await waitFor(() => {
      expect(screen.getByText('Error de conexión. Intente nuevamente.')).toBeInTheDocument();
    });
  });

  it('deshabilita campos mientras carga', async () => {
    mockPost.mockImplementationOnce(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderPage();
    await user.type(getEmailInput(), 'test@example.com');
    await user.click(screen.getByText('Enviar enlace'));

    expect(getEmailInput()).toBeDisabled();
    expect(screen.getByText('Enviando...')).toBeDisabled();
  });
});
