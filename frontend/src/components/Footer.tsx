import StorefrontIcon from '@mui/icons-material/Storefront';
import { Box, Container, Stack, Typography } from '@mui/material';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Branding */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorefrontIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              Mi Tienda
            </Typography>
          </Box>

          {/* Links */}
          <Stack direction="row" spacing={3}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'secondary.main', cursor: 'pointer' },
              }}
            >
              Catálogo
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'secondary.main', cursor: 'pointer' },
              }}
            >
              Productos
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'secondary.main', cursor: 'pointer' },
              }}
            >
              Contacto
            </Typography>
          </Stack>

          {/* Copyright */}
          <Typography variant="body2" color="text.secondary">
            © {year} Mi Tienda. Todos los derechos reservados.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
