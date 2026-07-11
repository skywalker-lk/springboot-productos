import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useProductContext } from '../store';
import type { Categoria, Producto } from '../types';
import { getImageUrl } from '../utils/imageUrl';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  /** Producto a editar. Si es null, el modal está en modo creación. */
  editProduct?: Producto | null;
}

const emptyForm = {
  nombre: '',
  precio: 0,
  precioBase: 0,
  porcentajeIVA: 21,
  descuentoCantidad: 0,
  descuentoPorcentaje: 0,
  stock: 0,
  categoria: '',
};

export const ProductModal = ({ open, onClose, editProduct }: ProductModalProps) => {
  const isEdit = !!editProduct;

  const { addProduct, updateProduct, uploadImage } = useProductContext();
  const { categories } = useCategories();

  // Key que cambia cuando se abre el modal o cambia el producto
  // fuerza remount del contenido para reiniciar estado sin effects
  const formKey = useMemo(() => `${open}-${editProduct?._id || 'new'}`, [open, editProduct]);

  const getInitialForm = () => {
    if (editProduct) {
      return {
        nombre: editProduct.nombre,
        precio: editProduct.precio,
        precioBase: editProduct.precioBase ?? editProduct.precio,
        porcentajeIVA: editProduct.porcentajeIVA ?? 21,
        descuentoCantidad: editProduct.descuentoCantidad ?? 0,
        descuentoPorcentaje: editProduct.descuentoPorcentaje ?? 0,
        stock: editProduct.stock ?? 0,
        categoria:
          typeof editProduct.categoria === 'string'
            ? editProduct.categoria
            : (editProduct.categoria?._id ?? ''),
      };
    }
    return emptyForm;
  };

  const getInitialImage = () => {
    if (editProduct?.img) return getImageUrl(editProduct.img) ?? '';
    return '';
  };

  const [form, setForm] = useState(getInitialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(getInitialImage);

  const setField = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');

    if (!form.nombre.trim() || !form.categoria || form.precio <= 0) {
      setError('Completá todos los campos correctamente');
      return;
    }

    setSaving(true);
    try {
      let productId: string;

      const extras = {
        precioBase: form.precioBase,
        porcentajeIVA: form.porcentajeIVA,
        descuentoCantidad: form.descuentoCantidad,
        descuentoPorcentaje: form.descuentoPorcentaje,
      };
      if (isEdit && editProduct) {
        await updateProduct(
          form.categoria,
          form.nombre.trim(),
          editProduct._id,
          form.stock,
          form.precio,
          extras,
        );
        productId = editProduct._id;
      } else {
        const created = await addProduct(
          form.categoria,
          form.nombre.trim(),
          form.stock,
          form.precio,
          extras,
        );
        productId = created._id;
      }

      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        await uploadImage(fd, productId);
      }

      onClose();
    } catch {
      setError('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>

      <DialogContent key={formKey}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nombre"
          value={form.nombre}
          onChange={(e) => setField('nombre', e.target.value)}
          margin="dense"
          required
        />

        <TextField
          fullWidth
          label="Precio (con IVA)"
          type="number"
          value={form.precio}
          onChange={(e) => setField('precio', Number(e.target.value))}
          margin="dense"
          required
          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
        />

        <TextField
          fullWidth
          label="Precio base (sin IVA)"
          type="number"
          value={form.precioBase}
          onChange={(e) => setField('precioBase', Number(e.target.value))}
          margin="dense"
          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
        />

        <TextField
          fullWidth
          label="IVA (%)"
          type="number"
          value={form.porcentajeIVA}
          onChange={(e) => setField('porcentajeIVA', Number(e.target.value))}
          margin="dense"
          slotProps={{ htmlInput: { min: 0, max: 100 } }}
        />

        <TextField
          fullWidth
          label="Dto. por cantidad (mín.)"
          type="number"
          value={form.descuentoCantidad}
          onChange={(e) => setField('descuentoCantidad', Number(e.target.value))}
          margin="dense"
          slotProps={{ htmlInput: { min: 0 } }}
        />

        <TextField
          fullWidth
          label="Dto. por cantidad (%)"
          type="number"
          value={form.descuentoPorcentaje}
          onChange={(e) => setField('descuentoPorcentaje', Number(e.target.value))}
          margin="dense"
          slotProps={{ htmlInput: { min: 0, max: 100 } }}
        />

        <TextField
          fullWidth
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setField('stock', Number(e.target.value))}
          margin="dense"
          required
          slotProps={{ htmlInput: { min: 0 } }}
        />

        <FormControl fullWidth margin="dense" required>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={form.categoria}
            label="Categoría"
            onChange={(e) => setField('categoria', e.target.value)}
          >
            {categories.map((cat: Categoria) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.nombre}
              </MenuItem>
            ))}
          </Select>
          {!categories.length && <FormHelperText>No hay categorías disponibles</FormHelperText>}
        </FormControl>

        {/* Imagen */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Imagen
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={imagePreview} variant="rounded" sx={{ width: 80, height: 80 }} />
            <IconButton color="primary" component="label">
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              <PhotoCamera />
            </IconButton>
            {imagePreview && (
              <Button
                size="small"
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : undefined}
        >
          {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
