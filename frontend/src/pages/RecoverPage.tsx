import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ApiResponse } from '../types/auth';

type RecoverState = 'idle' | 'loading' | 'success' | 'error';

const RecoverPage = () => {
  const [correo, setCorreo] = useState('');
  const [state, setState] = useState<RecoverState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isValidEmail(correo)) {
      setErrorMsg('Correo electrónico inválido');
      setState('error');
      return;
    }

    setState('loading');

    try {
      await apiService.post<ApiResponse>('/auth/forgot-password', { correo });
      setState('success');
      setCorreo('');
    } catch {
      setErrorMsg('Error de conexión. Intente nuevamente.');
      setState('error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Recuperar Contraseña
          </Typography>

          {state === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Si el correo existe, recibirás un enlace de recuperación.
            </Alert>
          )}

          {state === 'error' && errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (state === 'error') setState('idle');
                if (state === 'success') setState('idle');
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
              {state === 'loading' ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#1976d2' }}>
              Volver al inicio de sesión
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RecoverPage;
