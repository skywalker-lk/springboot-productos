import { ArrowBack, Payment } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Alert as MUIAlert,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCart, useSale } from '../store';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { addSale } = useSale();
  const { user, status } = useAuth();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [shippingData, setShippingData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    telefono: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [cuponCodigo, setCuponCodigo] = useState('');
  const [cuponDescuento, setCuponDescuento] = useState(0);
  const [cuponValidando, setCuponValidando] = useState(false);
  const [cuponError, setCuponError] = useState('');

  const handleShippingChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (status !== 'authenticated' || !user) {
        setCheckoutError('Debés iniciar sesión para realizar una compra.');
        return;
      }

      // Transformar items del carrito a formato de venta
      const saleItems = items.map((item) => ({
        productId: item._id,
        productName: item.nombre,
        quantity: item.cantidad,
        unitPrice: item.precio,
        subtotal: item.precio * item.cantidad,
      }));

      // Crear venta en backend
      await addSale(saleItems, user.uid, user.nombre, cuponCodigo || undefined);

      setStep('confirmation');
      clearCart();
      setSnackbarOpen(true);
    } catch {
      setCheckoutError('Error al procesar el pago. Intente de nuevo.');
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No hay items en el carrito
        </Typography>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/catalog')}>
          Ir al Catálogo
        </Button>
      </Container>
    );
  }

  if (step === 'confirmation') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h2" color="success.main" gutterBottom>
            ✓
          </Typography>
          <Typography variant="h4" gutterBottom>
            ¡Compra Realizada con Éxito!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Gracias por tu compra. Te enviaremos un email con los detalles.
          </Typography>
          {cuponDescuento > 0 && (
            <Typography variant="body1" color="success.main" sx={{ mb: 1 }}>
              Cupón aplicado: -${cuponDescuento.toFixed(2)}
            </Typography>
          )}
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', my: 3 }}>
            Total pagado: ${(totalPrice - cuponDescuento).toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/catalog')}
            sx={{ mr: 2 }}
          >
            Seguir Comprando
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/sales')}>
            Ver mis Pedidos
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/cart')}
          disabled={step === 'payment'}
        >
          Volver al Carrito
        </Button>
        <Typography variant="h4" component="h1">
          {step === 'shipping' ? 'Datos de Envío' : 'Método de Pago'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Formulario */}
        <Grid size={{ xs: 12, md: 8 }}>
          {step === 'shipping' ? (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información de Envío
              </Typography>
              <Box component="form" onSubmit={handleShippingSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      name="nombre"
                      value={shippingData.nombre}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Dirección"
                      name="direccion"
                      value={shippingData.direccion}
                      onChange={handleShippingChange}
                      required
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Ciudad"
                      name="ciudad"
                      value={shippingData.ciudad}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Provincia</InputLabel>
                      <Select
                        name="provincia"
                        value={shippingData.provincia}
                        label="Provincia"
                        onChange={handleShippingChange}
                        required
                      >
                        <MenuItem value="buenos_aires">Buenos Aires</MenuItem>
                        <MenuItem value="cordoba">Córdoba</MenuItem>
                        <MenuItem value="santa_fe">Santa Fe</MenuItem>
                        <MenuItem value="mendoza">Mendoza</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Código Postal"
                      name="codigoPostal"
                      value={shippingData.codigoPostal}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      value={shippingData.telefono}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<Payment />}
                    >
                      Continuar al Pago
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ) : (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Método de Pago (Simulado)
              </Typography>
              <Box component="form" onSubmit={handlePaymentSubmit}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Este es un checkout simulado. No se procesará ningún pago real.
                </Alert>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Número de Tarjeta"
                      placeholder="1234 5678 9012 3456"
                      disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Fecha de Expiración" placeholder="MM/YY" disabled />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="CVV" placeholder="123" disabled />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<Payment />}
                    >
                      Pagar ${totalPrice.toFixed(2)}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          )}
        </Grid>

        {/* Resumen del Pedido */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            <Divider sx={{ my: 2 }} />
            {items.map((item) => (
              <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {item.nombre} x{item.cantidad}
                </Typography>
                <Typography variant="body2">${(item.precio * item.cantidad).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />

            {/* Cupón de descuento */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Código de cupón"
                value={cuponCodigo}
                onChange={(e) => {
                  setCuponCodigo(e.target.value.toUpperCase());
                  setCuponDescuento(0);
                  setCuponError('');
                }}
                disabled={step === 'payment'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Button
                        size="small"
                        disabled={!cuponCodigo || cuponValidando || step === 'payment'}
                        onClick={async () => {
                          setCuponValidando(true);
                          setCuponError('');
                          try {
                            const { apiService } = await import('../services/api');
                            const res = await apiService.post<{
                              valido: boolean;
                              descuento: number;
                              mensaje?: string;
                            }>('/cupones/validar', {
                              codigo: cuponCodigo,
                              montoPedido: totalPrice,
                            });
                            if (res.valido) {
                              setCuponDescuento(res.descuento);
                            } else {
                              setCuponError(res.mensaje || 'Cupón inválido');
                            }
                          } catch {
                            setCuponError('Error al validar cupón');
                          } finally {
                            setCuponValidando(false);
                          }
                        }}
                      >
                        {cuponValidando ? '…' : 'Aplicar'}
                      </Button>
                    ),
                  },
                }}
              />
              {cuponError && (
                <Typography variant="caption" color="error">
                  {cuponError}
                </Typography>
              )}
              {cuponDescuento > 0 && (
                <Typography variant="caption" color="success.main">
                  Descuento: -${cuponDescuento.toFixed(2)}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ${(totalPrice - cuponDescuento).toFixed(2)}
              </Typography>
            </Box>
            {step === 'shipping' && (
              <Button fullWidth variant="outlined" onClick={() => navigate('/cart')}>
                Editar Carrito
              </Button>
            )}
          </Card>
        </Grid>
      </Grid>

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MUIAlert severity="success" sx={{ width: '100%' }}>
          ¡Compra realizada! Total: ${totalPrice.toFixed(2)}
        </MUIAlert>
      </Snackbar>
    </Container>
  );
};

export default CheckoutPage;
