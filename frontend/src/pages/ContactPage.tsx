import emailjs from '@emailjs/browser';
import { Email, Send } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const backend = fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          mensaje: `${formData.subject}\n\n${formData.message}`,
        }),
      }).catch(() => {});

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_demo',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_demo',
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'demo_key',
      );

      await backend;

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setErrorMsg('Error al enviar el mensaje. Probá de nuevo.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Email color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Contáctanos
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          ¿Tenés alguna consulta? Completá el formulario y te responderemos a la brevedad.
        </Typography>

        {status === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Mensaje enviado con éxito! Te responderemos pronto.
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Asunto"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mensaje"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={6}
                variant="outlined"
                placeholder="Escribí tu consulta aquí..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={status === 'sending' ? <CircularProgress size={20} /> : <Send />}
                disabled={status === 'sending'}
                sx={{ minWidth: 150 }}
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactPage;
