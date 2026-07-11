import {
  Add as AddIcon,
  ChevronLeft,
  ChevronRight,
  LocalOffer as CuponIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiService, getErrorMessage } from '../services/api';
import type { Cupon, CuponListResponse, TipoDescuento } from '../types/cupon';

const CUPON_VACIO = {
  codigo: '',
  tipo: 'PORCENTAJE' as TipoDescuento,
  valorDescuento: 0,
  montoMinimo: null as number | null,
  fechaExpiracion: null as string | null,
  usosMaximos: 100,
  activo: true,
};

const CuponesPage = () => {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [limite, setLimite] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Cupon | null>(null);
  const [form, setForm] = useState<typeof CUPON_VACIO>(CUPON_VACIO);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / limite));

  const loadCupones = async (nuevaPagina?: number, nuevoLimite?: number) => {
    try {
      setLoading(true);
      setError('');
      const page = nuevaPagina ?? pagina;
      const limit = nuevoLimite ?? limite;
      const data = await apiService.get<CuponListResponse>(
        `/cupones?pagina=${page}&limite=${limit}`,
      );
      setCupones(data.cupones);
      setTotal(data.total);
      if (nuevaPagina !== undefined) setPagina(nuevaPagina);
      if (nuevoLimite !== undefined) setLimite(nuevoLimite);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCupones();
  }, [loadCupones]);

  const openCrear = () => {
    setEditando(null);
    setForm(CUPON_VACIO);
    setDialogOpen(true);
  };

  const openEditar = (c: Cupon) => {
    setEditando(c);
    setForm({
      codigo: c.codigo,
      tipo: c.tipo,
      valorDescuento: c.valorDescuento,
      montoMinimo: c.montoMinimo,
      fechaExpiracion: c.fechaExpiracion ? c.fechaExpiracion.split('T')[0] : null,
      usosMaximos: c.usosMaximos,
      activo: c.activo,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.codigo.trim()) {
      setError('El código es obligatorio');
      return;
    }
    if (form.valorDescuento <= 0) {
      setError('El descuento debe ser mayor a 0');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        montoMinimo: form.montoMinimo || null,
        fechaExpiracion: form.fechaExpiracion || null,
      };
      if (editando) {
        await apiService.put(`/cupones/${editando.id}`, body);
      } else {
        await apiService.post('/cupones', body);
      }
      setDialogOpen(false);
      await loadCupones();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await apiService.delete(`/cupones/${deleteId}`);
      setDeleteId(null);
      await loadCupones();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CuponIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Cupones de Descuento
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadCupones();
            }}
          >
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCrear}>
            Nuevo Cupón
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : cupones.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No hay cupones creados todavía.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Usos</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cupones.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <strong>{c.codigo}</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.tipo === 'PORCENTAJE' ? '%' : '$'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {c.tipo === 'PORCENTAJE' ? `${c.valorDescuento}%` : `$${c.valorDescuento}`}
                  </TableCell>
                  <TableCell>
                    {c.usosActuales}/{c.usosMaximos}
                  </TableCell>
                  <TableCell>
                    {c.fechaExpiracion ? new Date(c.fechaExpiracion).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.activo ? 'Activo' : 'Inactivo'}
                      color={c.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEditar(c)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(c.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Paginación */}
      {!loading && cupones.length > 0 && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChevronLeft />}
            onClick={() => {
              loadCupones(pagina - 1);
            }}
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
            onClick={() => {
              loadCupones(pagina + 1);
            }}
            disabled={pagina >= totalPages - 1}
          >
            Siguiente
          </Button>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={limite}
              onChange={(e) => {
                loadCupones(0, Number(e.target.value));
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Modal crear/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Cupón' : 'Nuevo Cupón'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="dense"
            label="Código"
            value={form.codigo}
            onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value.toUpperCase() }))}
            disabled={!!editando}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={form.tipo}
              label="Tipo"
              onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoDescuento }))}
            >
              <MenuItem value="PORCENTAJE">Porcentaje (%)</MenuItem>
              <MenuItem value="MONTO_FIJO">Monto Fijo ($)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            label="Valor de descuento"
            type="number"
            value={form.valorDescuento}
            onChange={(e) => setForm((p) => ({ ...p, valorDescuento: Number(e.target.value) }))}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Monto mínimo (opcional)"
            type="number"
            value={form.montoMinimo ?? ''}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                montoMinimo: e.target.value ? Number(e.target.value) : null,
              }))
            }
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Vencimiento (opcional)"
            type="date"
            value={form.fechaExpiracion ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, fechaExpiracion: e.target.value || null }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Usos máximos"
            type="number"
            value={form.usosMaximos}
            onChange={(e) => setForm((p) => ({ ...p, usosMaximos: Number(e.target.value) }))}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.activo}
                onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))}
              />
            }
            label="Activo"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación eliminar */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>¿Eliminar cupón?</DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CuponesPage;
