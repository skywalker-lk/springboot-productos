import {
  Add as AddIcon,
  Category as CategoryIcon,
  Description as CsvIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TableChart as ExcelIcon,
  Inventory,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE, apiService } from '../services/api';
import { useAuth, useProductContext } from '../store';
import type { UserRole } from '../types/auth';
import type { Categoria, CategoriesResponse } from '../types/product';

/** Roles que pueden crear/editar/eliminar categorías (backend: INVENTORISTA, ADMINISTRADOR) */
const CATEGORY_MANAGER_ROLES: UserRole[] = ['inventorista', 'administrador'];

const CategoriesPage = () => {
  const { products, loadProducts } = useProductContext();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = (user?.rol && CATEGORY_MANAGER_ROLES.includes(user.rol)) ?? false;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [formTipo, setFormTipo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [saving, setSaving] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const q = searchText.toLowerCase();
    return categories.filter(
      (cat) =>
        cat._id.toLowerCase().includes(q) ||
        cat.nombre.toLowerCase().includes(q) ||
        (cat.descripcion || '').toLowerCase().includes(q),
    );
  }, [categories, searchText]);

  const loadCategories = async () => {
    try {
      const data = await apiService.get<CategoriesResponse>('/categorias');
      setCategories(data.categorias);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadProducts, loadCategories]);

  const getProductCount = (tipo: string) =>
    products.filter((p) => {
      const catId = typeof p.categoria === 'string' ? p.categoria : p.categoria?._id;
      return catId === tipo;
    }).length;

  // ─── Modal handlers ─────────────────────────────────────────

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormTipo('');
    setFormNombre('');
    setFormDescripcion('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Categoria) => {
    setEditingCategory(cat);
    setFormTipo(cat._id);
    setFormNombre(cat.nombre);
    setFormDescripcion(cat.descripcion || '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTipo.trim() || !formNombre.trim()) {
      setError('El tipo y el nombre son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await apiService.put(`/categorias/${editingCategory.id}`, {
          tipo: formTipo,
          nombre: formNombre,
          descripcion: formDescripcion,
        });
      } else {
        await apiService.post('/categorias', {
          tipo: formTipo,
          nombre: formNombre,
          descripcion: formDescripcion,
        });
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError('Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;

    try {
      await apiService.delete(`/categorias/${cat.id}`);
      await loadCategories();
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      setError('Error al eliminar la categoría');
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Categorías
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            startIcon={<ExcelIcon />}
            href={`${API_BASE}/reportes/categorias/excel`}
            download="categorias.xlsx"
          >
            Excel
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<CsvIcon />}
            href={`${API_BASE}/reportes/categorias/csv`}
            download="categorias.csv"
          >
            CSV
          </Button>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
              Nueva Categoría
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Buscador */}
      <TextField
        size="small"
        placeholder="Buscar categoría…"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      {categories.length === 0 ? (
        <Alert severity="info">No hay categorías disponibles.</Alert>
      ) : filteredCategories.length === 0 ? (
        <Alert severity="info">No hay categorías que coincidan con la búsqueda.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Productos
                </TableCell>
                {canManage && (
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Acciones
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat._id} hover>
                  <TableCell>
                    <Chip label={cat._id} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{cat.nombre}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{cat.descripcion || '—'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<Inventory fontSize="small" />}
                      label={getProductCount(cat._id)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  {canManage && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => openEditModal(cat)}
                        aria-label="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(cat)}
                        aria-label="Eliminar"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Crear / Editar */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tipo (identificador único)"
            value={formTipo}
            onChange={(e) => setFormTipo(e.target.value.toUpperCase())}
            margin="normal"
            required
            disabled={!!editingCategory}
            helperText="Ej: BEBIDAS, ALMACEN, GOLOSINAS"
          />
          <TextField
            fullWidth
            label="Nombre para mostrar"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesPage;
