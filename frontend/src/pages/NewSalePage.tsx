import { Add, ArrowBack, Remove, ShoppingCart } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useProductContext, useSale } from '../store';
import type { SaleItem } from '../types/sale';

const NewSalePage = () => {
  const { products, isLoading: productsLoading } = useProductContext();
  const { addSale, state: saleState } = useSale();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selected items for the sale: productId -> { quantity, product }
  const [selectedItems, setSelectedItems] = useState<
    Map<string, { quantity: number; product: (typeof products)[0] }>
  >(new Map());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  const handleAddItem = (product: (typeof products)[0]) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(product._id)) {
        // biome-ignore lint/style/noNonNullAssertion: guarded by has() check above
        const existing = newMap.get(product._id)!;
        if (existing.quantity < product.stock) {
          newMap.set(product._id, { ...existing, quantity: existing.quantity + 1 });
        }
      } else {
        if (product.stock > 0) {
          newMap.set(product._id, { quantity: 1, product });
        }
      }
      return newMap;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(productId);
      if (existing && existing.quantity > 1) {
        newMap.set(productId, { ...existing, quantity: existing.quantity - 1 });
      } else {
        newMap.delete(productId);
      }
      return newMap;
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  };

  const saleItems: SaleItem[] = useMemo(() => {
    return Array.from(selectedItems.entries()).map(([productId, { quantity, product }]) => ({
      productId,
      productName: product.nombre,
      quantity,
      unitPrice: product.precio,
      subtotal: product.precio * quantity,
    }));
  }, [selectedItems]);

  const total = useMemo(() => saleItems.reduce((sum, item) => sum + item.subtotal, 0), [saleItems]);

  const handleRegisterSale = () => {
    if (!user) return;
    if (saleItems.length === 0) return;

    addSale(saleItems, user.uid, user.nombre);
    // Clear selection and navigate to sales list
    setSelectedItems(new Map());
    navigate('/sales');
  };

  if (productsLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/sales')} color="primary">
          <ArrowBack />
        </IconButton>
        <ShoppingCart color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          Nuevo Pedido
        </Typography>
      </Box>

      {saleState.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {saleState.error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Product Selection */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Seleccionar Productos
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <Box component="span" sx={{ mr: 1 }}>
                    🔍
                  </Box>
                ),
              },
            }}
          />
          <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {product.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.categoria.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>${product.precio.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        color={
                          product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAddItem(product)}
                        disabled={product.stock === 0}
                      >
                        <Add />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">No se encontraron productos</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Sale Summary */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resumen del Pedido
          </Typography>
          {saleItems.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No hay productos seleccionados
            </Typography>
          ) : (
            <>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Cant</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {saleItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(item.productId)}
                            >
                              <Remove fontSize="inherit" />
                            </IconButton>
                            {item.quantity}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const p = selectedItems.get(item.productId)?.product;
                                if (p) handleAddItem(p);
                              }}
                            >
                              <Add fontSize="inherit" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveProduct(item.productId)}
                          >
                            Quitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ borderTop: '2px solid #e0e0e0', pt: 2, mt: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${total.toFixed(2)}
                  </Typography>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2 }}
                  onClick={handleRegisterSale}
                  disabled={saleItems.length === 0}
                >
                  Registrar Pedido
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default NewSalePage;
