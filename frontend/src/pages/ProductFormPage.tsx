import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useForm } from '../hooks/useForm';
import { useProductContext } from '../store';
import type { Categoria } from '../types';
import { getImageUrl } from '../utils/imageUrl';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, loadProductById, uploadImage } = useProductContext();
  const { isLoading: catsLoading, categories } = useCategories();
  const isEdit = !!id;

  const { form, onChange, setFormValue } = useForm({
    nombre: '',
    precio: 0,
    precioBase: 0,
    porcentajeIVA: 21,
    descuentoCantidad: 0,
    descuentoPorcentaje: 0,
    stock: 0,
    categoria: '',
    img: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (isEdit && id) {
      const product = products.find((p: { _id: string }) => p._id === id);
      if (product) {
        setFormValue({
          nombre: product.nombre,
          precio: product.precio,
          precioBase: product.precioBase ?? product.precio,
          porcentajeIVA: product.porcentajeIVA ?? 21,
          descuentoCantidad: product.descuentoCantidad ?? 0,
          descuentoPorcentaje: product.descuentoPorcentaje ?? 0,
          stock: product.stock ?? 0,
          categoria:
            typeof product.categoria === 'string' ? product.categoria : product.categoria._id,
        });
        if (product.img) {
          setImagePreview(getImageUrl(product.img) ?? '');
        }
      } else {
        loadProductById(id).then((data) => {
          setFormValue({
            nombre: data.nombre,
            precio: data.precio,
            precioBase: data.precioBase ?? data.precio,
            porcentajeIVA: data.porcentajeIVA ?? 21,
            descuentoCantidad: data.descuentoCantidad ?? 0,
            descuentoPorcentaje: data.descuentoPorcentaje ?? 0,
            stock: data.stock ?? 0,
            categoria: typeof data.categoria === 'string' ? data.categoria : data.categoria._id,
          });
          if (data.img) {
            setImagePreview(getImageUrl(data.img) ?? '');
          }
        });
      }
    }
  }, [id, setFormValue, products.find, loadProductById, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.nombre || !form.categoria || form.precio <= 0) {
      setError('Complete todos los campos correctamente');
      setLoading(false);
      return;
    }

    try {
      let productId: string | undefined;

      const extras = {
        precioBase: form.precioBase,
        porcentajeIVA: form.porcentajeIVA,
        descuentoCantidad: form.descuentoCantidad,
        descuentoPorcentaje: form.descuentoPorcentaje,
      };
      if (isEdit && id) {
        await updateProduct(form.categoria, form.nombre, id, form.stock, form.precio, extras);
        productId = id;
      } else {
        const newProduct = await addProduct(
          form.categoria,
          form.nombre,
          form.stock,
          form.precio,
          extras,
        );
        productId = newProduct._id;
      }

      // Subir imagen si hay
      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await uploadImage(formData, productId);
      }

      navigate('/products');
    } catch {
      setError('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (catsLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre del Producto"
            value={form.nombre}
            onChange={(e) => onChange(e.target.value, 'nombre')}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Precio (con IVA)"
            type="number"
            value={form.precio}
            onChange={(e) => onChange(Number(e.target.value), 'precio')}
            margin="normal"
            required
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />

          <TextField
            fullWidth
            label="Precio base (sin IVA)"
            type="number"
            value={form.precioBase}
            onChange={(e) => onChange(Number(e.target.value), 'precioBase')}
            margin="normal"
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />

          <TextField
            fullWidth
            label="IVA (%)"
            type="number"
            value={form.porcentajeIVA}
            onChange={(e) => onChange(Number(e.target.value), 'porcentajeIVA')}
            margin="normal"
            slotProps={{ htmlInput: { min: 0, max: 100 } }}
          />

          <TextField
            fullWidth
            label="Descuento por cantidad (mínimo)"
            type="number"
            value={form.descuentoCantidad}
            onChange={(e) => onChange(Number(e.target.value), 'descuentoCantidad')}
            margin="normal"
            slotProps={{ htmlInput: { min: 0 } }}
            helperText="0 = sin descuento por volumen"
          />

          <TextField
            fullWidth
            label="Descuento por cantidad (%)"
            type="number"
            value={form.descuentoPorcentaje}
            onChange={(e) => onChange(Number(e.target.value), 'descuentoPorcentaje')}
            margin="normal"
            slotProps={{ htmlInput: { min: 0, max: 100 } }}
          />

          <TextField
            fullWidth
            label="Stock inicial"
            type="number"
            value={form.stock}
            onChange={(e) => onChange(Number(e.target.value), 'stock')}
            margin="normal"
            required
            slotProps={{ htmlInput: { min: 0 } }}
            helperText="Cantidad disponible en inventario"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={form.categoria}
              label="Categoría"
              onChange={(e) => onChange(e.target.value, 'categoria')}
            >
              {categories.map((cat: Categoria) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Imagen del Producto
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={imagePreview} variant="rounded" sx={{ width: 100, height: 100 }} />
              <IconButton color="primary" aria-label="upload picture" component="label">
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                <PhotoCamera />
              </IconButton>
              {imagePreview && (
                <Button
                  color="error"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                >
                  Quitar
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/products')} fullWidth>
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ProductFormPage;
