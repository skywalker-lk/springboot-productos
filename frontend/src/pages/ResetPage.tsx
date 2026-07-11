import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { apiService } from '../services/api';
import type { ApiResponse } from '../types/auth';

type ResetState = 'idle' | 'loading' | 'success' | 'validation-error' | 'api-error';

const ResetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<ResetState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Token de recuperación no encontrado.
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/recover" style={{ color: '#1976d2' }}>
                Solicitar un nuevo enlace
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden');
      setState('validation-error');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      setState('validation-error');
      return;
    }

    setState('loading');

    try {
      await apiService.post<ApiResponse>('/auth/reset-password', { token, password });
      setState('success');
    } catch {
      setErrorMsg('Error al restablecer la contraseña. El enlace puede haber expirado.');
      setState('api-error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Nueva Contraseña
          </Typography>

          {state === 'validation-error' && errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {state === 'api-error' && errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (state !== 'idle' && state !== 'loading') setState('idle');
              }}
              margin="normal"
              required
              disabled={state === 'loading'}
              slotProps={{ htmlInput: { minLength: 6 } }}
            />
            <PasswordStrengthMeter password={password} />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (state !== 'idle' && state !== 'loading') setState('idle');
              }}
              margin="normal"
              required
              disabled={state === 'loading'}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={state === 'loading'}
            >
              {state === 'loading' ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#1976d2' }}>
              Volver al inicio de sesión
            </Link>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={state === 'success'}
        autoHideDuration={4000}
        onClose={() => navigate('/login')}
        message="Contraseña actualizada correctamente"
      />
    </Container>
  );
};

export default ResetPage;
