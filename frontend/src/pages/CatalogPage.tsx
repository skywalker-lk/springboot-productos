import {
  AddShoppingCart,
  ChevronLeft,
  ChevronRight,
  ErrorOutlineOutlined,
  ShoppingCart,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Alert as MUIAlert,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useCart, useProductContext } from '../store';
import type { Categoria, Producto } from '../types';
import { getImageUrl } from '../utils/imageUrl';

// Skeleton de carga para producto
const ProductSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 0 }} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="80%" height={28} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="50%" height={32} />
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
    </CardActions>
  </Card>
);

const CatalogPage = () => {
  const navigate = useNavigate();
  const { products, isLoading, filteredTotal, pagina, limite, loadProducts } = useProductContext();
  const { addToCart, items } = useCart();
  const { isLoading: catsLoading, categories } = useCategories();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState('');
  const [stockError, setStockError] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / limite));

  const getCategoryName = (categoria: Categoria | string): string => {
    if (typeof categoria === 'string') {
      const found = categories.find((cat) => cat._id === categoria);
      return found?.nombre || categoria;
    }
    return categoria?.nombre || 'Sin categoría';
  };

  const handleAddToCart = async (producto: Producto) => {
    const cartItem = {
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: getImageUrl(producto.img) || 'https://dummyimage.com/300x200/cccccc/000000.png',
      cantidad: 1,
    };
    const error = await addToCart(cartItem);
    if (error) {
      setStockError(error);
      return;
    }
    setAddedProduct(producto.nombre);
    setSnackbarOpen(true);
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item._id === productId);
  };

  const loading = isLoading || catsLoading;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            Catálogo de Productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Cargando...'
              : `${filteredTotal} producto${filteredTotal !== 1 ? 's' : ''} disponibles`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/cart')}
          startIcon={<ShoppingCart />}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          Carrito
          {items.length > 0 && (
            <Chip
              label={items.reduce((sum, item) => sum + item.cantidad, 0)}
              size="small"
              sx={{
                ml: 1,
                height: 20,
                minWidth: 20,
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'secondary.main',
                color: 'primary.dark',
              }}
            />
          )}
        </Button>
      </Box>

      {/* Grid de productos */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <ProductSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay productos disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Volvé más tarde o agregá productos desde el panel de administración.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((producto) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={producto._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    getImageUrl(producto.img) || 'https://dummyimage.com/300x200/cccccc/000000.png'
                  }
                  alt={producto.nombre}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {producto.nombre}
                  </Typography>

                  <Chip
                    label={getCategoryName(producto.categoria)}
                    size="small"
                    variant="filled"
                    sx={{
                      mb: 1.5,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: 'secondary.main',
                    }}
                  >
                    ${producto.precio.toFixed(2)}
                  </Typography>
                  {producto.precioBase && producto.porcentajeIVA && (
                    <Typography variant="caption" color="text.secondary">
                      ${producto.precioBase.toFixed(2)} + IVA {producto.porcentajeIVA}%
                    </Typography>
                  )}
                  {producto.descuentoCantidad && producto.descuentoCantidad > 0 && (
                    <Typography variant="caption" color="info.main" sx={{ display: 'block' }}>
                      {producto.descuentoCantidad}+ u. → {producto.descuentoPorcentaje}% OFF
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isInCart(producto._id) ? 'outlined' : 'contained'}
                    startIcon={<AddShoppingCart />}
                    onClick={() => handleAddToCart(producto)}
                    disabled={isInCart(producto._id)}
                    sx={{
                      borderRadius: 2,
                      py: 0.75,
                      ...(isInCart(producto._id) && {
                        borderColor: 'secondary.main',
                        color: 'secondary.main',
                      }),
                    }}
                  >
                    {isInCart(producto._id) ? 'En carrito' : 'Agregar'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Paginación server-side */}
      {!loading && products.length > 0 && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, alignItems: 'center', justifyContent: 'center' }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChevronLeft />}
            onClick={() => loadProducts(undefined, pagina - 1)}
            disabled={pagina === 0}
          >
            Anterior
          </Button>
          <Typography variant="body2" color="text.secondary">
            Página {pagina + 1} de {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronRight />}
            onClick={() => loadProducts(undefined, pagina + 1)}
            disabled={pagina >= totalPages - 1}
          >
            Siguiente
          </Button>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={limite}
              onChange={(e) => loadProducts(undefined, 0, Number(e.target.value))}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Snackbar éxito */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MUIAlert
          severity="success"
          sx={{
            width: '100%',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: 'secondary.main' },
          }}
        >
          ¡{addedProduct} agregado al carrito!
        </MUIAlert>
      </Snackbar>

      {/* Modal stock insuficiente */}
      <Dialog open={!!stockError} onClose={() => setStockError(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorOutlineOutlined color="error" />
          Stock insuficiente
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{stockError}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockError(null)} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CatalogPage;
