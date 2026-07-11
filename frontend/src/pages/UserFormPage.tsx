import { ArrowBack, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../store';
import type { UserRole } from '../types/auth';
import type { UserFormData } from '../types/user';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addUser, updateUser } = useUser();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    correo: '',
    telefono: '',
    rol: 'vendedor' as UserRole,
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const user = state.users.find((u) => u.id === id);
      if (user) {
        setFormData({
          nombre: user.nombre,
          correo: user.correo,
          telefono: user.telefono || '',
          rol: user.rol,
          password: '',
        });
      } else {
        // Si no encuentra el usuario, redirigir
        navigate('/users', { replace: true });
      }
    }
  }, [id, state.users, navigate]);

  const handleChange =
    (field: keyof UserFormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } },
    ) => {
      const value = event.target.value;
      setFormData((prev: UserFormData) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEdit && id) {
        updateUser(id, formData);
      } else {
        addUser(formData);
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && state.isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ArrowBack
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={() => navigate('/users')}
        />
        <Typography variant="h4" component="h1">
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Nombre Completo"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              required
              fullWidth
            />

            <TextField
              label="Correo Electrónico"
              type="email"
              value={formData.correo}
              onChange={handleChange('correo')}
              required
              fullWidth
            />

            <TextField
              label="Teléfono"
              value={formData.telefono}
              onChange={handleChange('telefono')}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                value={formData.rol}
                label="Rol"
                onChange={handleChange('rol')}
              >
                <MenuItem value="vendedor">Vendedor</MenuItem>
                <MenuItem value="gerente">Gerente</MenuItem>
                <MenuItem value="analista">Analista</MenuItem>
              </Select>
            </FormControl>

            {!isEdit && (
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                required
                fullWidth
                helperText="Mínimo 6 caracteres"
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/users')} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default UserFormPage;
