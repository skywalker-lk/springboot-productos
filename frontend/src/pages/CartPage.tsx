import {
  Add as AddIcon,
  ArrowBack,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  ShoppingCart,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  IconButton,
  Alert as MUIAlert,
  Snackbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCart, useSale } from '../store';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const { addSale } = useSale();
  const { user, status } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleCheckout = async () => {
    if (status !== 'authenticated' || !user) {
      setCheckoutError('Debés iniciar sesión para realizar una compra.');
      return;
    }
    try {
      // Transformar items del carrito a formato de venta
      const saleItems = items.map((item) => ({
        productId: item._id,
        productName: item.nombre,
        quantity: item.cantidad,
        unitPrice: item.precio,
        subtotal: item.precio * item.cantidad,
      }));

      // Crear venta en backend (addSale internamente llama deductStock)
      await addSale(saleItems, user.uid, user.nombre);

      clearCart();
      setSnackbarOpen(true);
    } catch {
      setCheckoutError('Error al procesar la compra. Intente de nuevo.');
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/catalog')}>
          Ir al Catálogo
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Carrito de Compras ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/catalog')}>
          Seguir Comprando
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Lista de Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          {items.map((item) => (
            <Card
              key={item._id}
              sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}
            >
              <CardMedia
                component="img"
                sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 'auto' } }}
                image={item.imagen || 'https://dummyimage.com/300x200/cccccc/000000.png'}
                alt={item.nombre}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="h2" variant="h6">
                    {item.nombre}
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                    ${item.precio.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: ${(item.precio * item.cantidad).toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item._id, item.cantidad - 1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                      {item.cantidad}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item._id, item.cantidad + 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeFromCart(item._id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Box>
            </Card>
          ))}
        </Grid>

        {/* Resumen del Carrito */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Items ({totalItems})</Typography>
              <Typography>${totalPrice.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mb: 2 }}
              onClick={handleCheckout}
            >
              Comprar
            </Button>
            <Button fullWidth variant="outlined" color="error" onClick={clearCart}>
              Vaciar Carrito
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={!!checkoutError}
        autoHideDuration={5000}
        onClose={() => setCheckoutError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MUIAlert severity="error" sx={{ width: '100%' }}>
          {checkoutError}
        </MUIAlert>
      </Snackbar>

      {/* Modal de Compra Exitosa (Snackbar) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MUIAlert severity="success" sx={{ width: '100%' }}>
          ¡Compra realizada con éxito! Total: ${totalPrice.toFixed(2)}
        </MUIAlert>
      </Snackbar>
    </Container>
  );
};

export default CartPage;
