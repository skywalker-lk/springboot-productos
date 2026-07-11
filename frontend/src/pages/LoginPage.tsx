import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../store';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, errorMessage, removeError } = useAuth();
  const { form, onChange } = useForm({
    correo: '',
    password: '',
  });
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    removeError();

    try {
      if (isRegister) {
        await signUp({ nombre, correo: form.correo, password: form.password });
      } else {
        await signIn({ correo: form.correo, password: form.password });
      }
      navigate('/products');
    } catch {
      // Error manejado en context
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {isRegister ? 'Registro' : 'Login'}
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={removeError}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <TextField
                fullWidth
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                margin="normal"
                required
              />
            )}

            <TextField
              fullWidth
              label="Correo"
              type="email"
              value={form.correo}
              onChange={(e) => onChange(e.target.value, 'correo')}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => onChange(e.target.value, 'password')}
              margin="normal"
              required
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              {isRegister ? 'Registrarse' : 'Ingresar'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setIsRegister(!isRegister);
                removeError();
              }}
            >
              {isRegister ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Regístrate'}
            </Link>
          </Box>
          {!isRegister && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link component="button" variant="body2" onClick={() => navigate('/recover')}>
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
