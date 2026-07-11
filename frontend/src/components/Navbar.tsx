import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import NotifIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Toolbar,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useAuth, useCart } from '../store';
import type { UserRole } from '../types/auth';

type NavLink = {
  label: string;
  to: string;
  /** Roles que pueden ver este link. undefined = solo invitados, '*' = todos los autenticados */
  roles?: UserRole[] | '*';
};

/** Mapa de links del navbar: qué roles ven cada link */
const NAV_LINKS: NavLink[] = [
  { label: 'Catálogo', to: '/catalog', roles: '*' },
  {
    label: 'Productos',
    to: '/products',
    roles: ['vendedor', 'inventorista', 'analista', 'gerente', 'administrador', 'usuario_carga'],
  },
  { label: 'Categorías', to: '/categories', roles: ['inventorista', 'gerente', 'administrador'] },
  { label: 'Stock', to: '/stock', roles: ['inventorista', 'gerente', 'administrador'] },
  { label: 'Estadísticas', to: '/stats', roles: ['analista', 'gerente', 'administrador'] },
  { label: 'Pedidos', to: '/sales', roles: ['vendedor', 'analista', 'gerente', 'administrador'] },
  { label: 'Mis Pedidos', to: '/mis-pedidos', roles: ['cliente'] },
  { label: 'Usuarios', to: '/users', roles: ['gerente', 'administrador'] },
  { label: 'Cupones', to: '/cupones', roles: ['gerente', 'administrador'] },
  { label: 'Auditoría', to: '/auditoria', roles: ['gerente', 'administrador'] },
  { label: 'Webhooks', to: '/webhooks', roles: ['gerente', 'administrador'] },
  { label: 'Consultas', to: '/admin-contactos', roles: ['gerente', 'administrador'] },
  { label: 'Contacto', to: '/contact', roles: '*' },
];

/** Links públicos visibles sin login (guest) */
const PUBLIC_LINKS: NavLink[] = [
  { label: 'Catálogo', to: '/catalog' },
  { label: 'Categorías', to: '/categories' },
  { label: 'Contacto', to: '/contact' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notificaciones, ultima } = useNotificaciones();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [ultimaNotif, setUltimaNotif] = useState(ultima);

  useEffect(() => {
    if (ultima) {
      setUltimaNotif(ultima);
      setSnackbarOpen(true);
    }
  }, [ultima]);

  /** Links visibles según el rol del usuario (o guest) */
  const visibleLinks = useMemo(() => {
    if (!user) return PUBLIC_LINKS;
    return NAV_LINKS.filter((link) => {
      if (link.roles === '*') return true;
      return link.roles?.includes(user.rol);
    });
  }, [user]);

  const handleNavigate = (to: string) => {
    setDrawerOpen(false);
    navigate(to);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            {/* Hamburguesa mobile */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.secondary' }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                mr: 3,
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => navigate('/catalog')}
            >
              <StorefrontIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.5px',
                }}
              >
                Mi Tienda
              </Typography>
            </Box>

            {/* Nav desktop */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                gap: 0.5,
              }}
            >
              {visibleLinks.map((link) => (
                <Button
                  key={link.to}
                  onClick={() => handleNavigate(link.to)}
                  sx={{
                    color: isActive(link.to) ? 'secondary.main' : 'text.secondary',
                    fontWeight: isActive(link.to) ? 600 : 400,
                    backgroundColor: isActive(link.to) ? 'rgba(123, 192, 67, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(123, 192, 67, 0.08)',
                      color: 'secondary.main',
                    },
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.875rem',
                    borderRadius: 1.5,
                    minWidth: 0,
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            {/* Acciones derecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              {/* Notificaciones */}
              {user && (
                <IconButton
                  sx={{ color: 'text.secondary', '&:hover': { color: 'secondary.main' } }}
                  aria-label="Notificaciones"
                >
                  <Badge badgeContent={notificaciones.length} color="error" showZero={false}>
                    <NotifIcon />
                  </Badge>
                </IconButton>
              )}
              {/* Carrito */}
              <IconButton
                onClick={() => navigate('/cart')}
                sx={{
                  color: isActive('/cart') ? 'secondary.main' : 'text.secondary',
                  '&:hover': { color: 'secondary.main' },
                }}
                aria-label="Carrito"
              >
                <Badge badgeContent={totalItems} color="secondary" showZero={false}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* Compra directa */}
              {totalItems > 0 && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/checkout')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    backgroundColor: 'secondary.main',
                    color: 'primary.dark',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  }}
                >
                  Comprar
                </Button>
              )}

              {/* Login — solo para invitados */}
              {!user && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'text.secondary',
                    borderColor: 'text.secondary',
                    fontSize: '0.8rem',
                    ml: 1,
                    '&:hover': {
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                    },
                  }}
                >
                  Iniciar sesión
                </Button>
              )}

              {/* Usuario */}
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {user.nombre}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      '&:hover': { color: 'error.main' },
                    }}
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                  >
                    Salir
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              backgroundColor: 'background.paper',
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorefrontIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Mi Tienda
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {visibleLinks.map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(link.to)}
                selected={isActive(link.to)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(123, 192, 67, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(123, 192, 67, 0.18)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(123, 192, 67, 0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={link.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: isActive(link.to) ? 600 : 400,
                        color: isActive(link.to) ? 'secondary.main' : 'text.primary',
                        fontSize: '0.9rem',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        {!user && (
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleNavigate('/login')}
              sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}
            >
              Iniciar sesión
            </Button>
          </Box>
        )}
        {user && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {user.nombre} ({user.rol})
            </Typography>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1, color: 'error.main', justifyContent: 'flex-start', px: 0 }}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        )}
      </Drawer>
      {/* Snackbar de notificación */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={ultimaNotif?.tipo === 'stock_bajo' ? 'warning' : 'success'}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle2">{ultimaNotif?.titulo}</Typography>
          <Typography variant="body2">{ultimaNotif?.mensaje}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
