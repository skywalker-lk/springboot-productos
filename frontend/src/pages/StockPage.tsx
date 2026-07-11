import {
  Add as AddIcon,
  Description as CsvIcon,
  Edit as EditIcon,
  TableChart as ExcelIcon,
  History as HistoryIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TrendingDown,
  TrendingUp,
  Tune,
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
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE, apiService } from '../services/api';
import { useProductContext } from '../store';
import type { Producto } from '../types';
import type { MovimientoStock, TipoMovimiento } from '../types/stock';

// ─── Helpers ───────────────────────────────────────────────

const getStockColor = (stock: number): 'success' | 'info' | 'error' => {
  if (stock === 0) return 'error';
  if (stock <= 10) return 'info';
  return 'success';
};

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Modal base de formulario ──────────────────────────────

interface StockFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  producto: Producto | null;
  fields: { name: string; label: string; type: string; min?: number }[];
  onSubmit: (data: Record<string, number | string>) => Promise<void>;
}

const StockFormModal = ({
  open,
  onClose,
  title,
  producto,
  fields,
  onSubmit,
}: StockFormModalProps) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({});
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setError('');
    const missing = fields.find((f) => !form[f.name] && f.type !== 'number');
    if (missing) {
      setError(`Completá ${missing.label}`);
      return;
    }

    setSaving(true);
    try {
      const data: Record<string, number | string> = {};
      fields.forEach((f) => {
        data[f.name] = f.type === 'number' ? Number(form[f.name] || 0) : form[f.name] || '';
      });
      await onSubmit(data);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {title}
        {producto && (
          <Typography variant="body2" color="text.secondary">
            {producto.nombre} — Stock actual: {producto.stock}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {fields.map((f) => (
          <TextField
            key={f.name}
            fullWidth
            margin="dense"
            label={f.label}
            type={f.type}
            value={form[f.name] ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
            slotProps={f.min !== undefined ? { htmlInput: { min: f.min } } : undefined}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Modal de historial ────────────────────────────────────

interface HistorialModalProps {
  open: boolean;
  onClose: () => void;
  producto: Producto | null;
}

const HistorialModal = ({ open, onClose, producto }: HistorialModalProps) => {
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !producto) return;
    setLoading(true);
    apiService
      .get<MovimientoStock[]>(`/stock/movimientos?productoId=${producto._id}`)
      .then(setMovimientos)
      .catch(() => setMovimientos([]))
      .finally(() => setLoading(false));
  }, [open, producto]);

  const getTipoColor = (t: TipoMovimiento): 'success' | 'error' | 'warning' => {
    if (t === 'INGRESO') return 'success';
    if (t === 'EGRESO') return 'error';
    return 'warning';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Historial de Stock
        {producto && (
          <Typography variant="body2" color="text.secondary">
            {producto.nombre}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : movimientos.length === 0 ? (
          <Alert severity="info">Sin movimientos registrados</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Anterior</TableCell>
                  <TableCell align="right">Posterior</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatFecha(m.fecha)}</TableCell>
                    <TableCell>
                      <Chip
                        label={m.tipo}
                        size="small"
                        color={getTipoColor(m.tipo)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                        }}
                      >
                        {m.tipo === 'INGRESO' ? (
                          <TrendingUp fontSize="small" color="success" />
                        ) : m.tipo === 'EGRESO' ? (
                          <TrendingDown fontSize="small" color="error" />
                        ) : (
                          <Tune fontSize="small" color="warning" />
                        )}
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{m.stockAnterior}</TableCell>
                    <TableCell align="right">{m.stockPosterior}</TableCell>
                    <TableCell>{m.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Página principal ──────────────────────────────────────

const StockPage = () => {
  const { products, isLoading, loadProducts } = useProductContext();
  const [sortBy, setSortBy] = useState<'stock' | 'nombre'>('stock');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Filtro + orden combinados
  const filteredSorted = useMemo(() => {
    let filtered = products;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = products.filter((p) => p.nombre.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'stock') return a.stock - b.stock;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [products, searchText, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const paginatedItems = filteredSorted.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, []);

  // Modales
  const [ingresoOpen, setIngresoOpen] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const openIngreso = (p: Producto) => {
    setSelectedProduct(p);
    setIngresoOpen(true);
  };

  const openAjuste = (p: Producto) => {
    setSelectedProduct(p);
    setAjusteOpen(true);
  };

  const openHistorial = (p: Producto) => {
    setSelectedProduct(p);
    setHistorialOpen(true);
  };

  const handleIngreso = async (data: Record<string, number | string>) => {
    await apiService.post('/stock/ingreso', {
      productoId: selectedProduct?._id,
      cantidad: data.cantidad,
      motivo: data.motivo,
    });
    await loadProducts();
  };

  const handleAjuste = async (data: Record<string, number | string>) => {
    await apiService.post('/stock/ajuste', {
      productoId: selectedProduct?._id,
      nuevoStock: data.nuevoStock,
      motivo: data.motivo,
    });
    await loadProducts();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Stock
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestioná el inventario de productos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="text"
              startIcon={<ExcelIcon />}
              href={`${API_BASE}/reportes/productos/excel${searchText ? `?q=${encodeURIComponent(searchText)}` : ''}`}
              download="productos.xlsx"
            >
              Excel
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<CsvIcon />}
              href={`${API_BASE}/reportes/productos/csv${searchText ? `?q=${encodeURIComponent(searchText)}` : ''}`}
              download="productos.csv"
            >
              CSV
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<PdfIcon />}
              href={`${API_BASE}/reportes/productos/pdf${searchText ? `?q=${encodeURIComponent(searchText)}` : ''}`}
              download="productos.pdf"
            >
              PDF
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadProducts()}>
              Actualizar
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tabs de orden */}
        <Tabs value={sortBy} onChange={(_, v) => setSortBy(v)} sx={{ mb: 2 }}>
          <Tab label="Stock (menor primero)" value="stock" />
          <Tab label="Nombre (A-Z)" value="nombre" />
        </Tabs>

        {/* Alerta stock bajo */}
        {filteredSorted.filter((p) => p.stock <= 5).length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>{filteredSorted.filter((p) => p.stock <= 5).length} productos</strong> con stock
            bajo o crítico
          </Alert>
        )}

        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Buscar producto…"
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

        {/* Tabla */}
        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : filteredSorted.length === 0 ? (
          <Alert severity="info">
            {searchText ? 'No hay productos que coincidan con la búsqueda.' : 'No hay productos'}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">IVA</TableCell>
                  <TableCell align="right">Dto. Vol.</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={p.stock}
                        size="small"
                        color={getStockColor(p.stock)}
                        variant={p.stock === 0 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">${p.precio}</TableCell>
                    <TableCell align="right">
                      {p.porcentajeIVA ? `${p.porcentajeIVA}%` : '—'}
                      {p.precioBase ? (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block' }}
                          color="text.secondary"
                        >
                          Base: ${p.precioBase}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell align="right">
                      {p.descuentoCantidad && p.descuentoCantidad > 0
                        ? `${p.descuentoCantidad}u → ${p.descuentoPorcentaje}%`
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Ingreso de stock">
                          <IconButton color="success" size="small" onClick={() => openIngreso(p)}>
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ajustar stock">
                          <IconButton color="warning" size="small" onClick={() => openAjuste(p)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Historial">
                          <IconButton color="info" size="small" onClick={() => openHistorial(p)}>
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Paginación */}
        {filteredSorted.length > pageSize && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Typography>
              Página {page + 1} de {totalPages} ({filteredSorted.length} productos)
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Modales */}
      <StockFormModal
        open={ingresoOpen}
        onClose={() => setIngresoOpen(false)}
        title="Ingreso de Stock"
        producto={selectedProduct}
        fields={[
          { name: 'cantidad', label: 'Cantidad', type: 'number', min: 1 },
          { name: 'motivo', label: 'Motivo', type: 'text' },
        ]}
        onSubmit={handleIngreso}
      />

      <StockFormModal
        open={ajusteOpen}
        onClose={() => setAjusteOpen(false)}
        title="Ajuste de Stock"
        producto={selectedProduct}
        fields={[
          { name: 'nuevoStock', label: 'Nuevo stock', type: 'number', min: 0 },
          { name: 'motivo', label: 'Motivo', type: 'text' },
        ]}
        onSubmit={handleAjuste}
      />

      <HistorialModal
        open={historialOpen}
        onClose={() => setHistorialOpen(false)}
        producto={selectedProduct}
      />
    </Container>
  );
};

export default StockPage;
