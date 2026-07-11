import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Webhook as WebhookIcon,
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
  IconButton,
  Paper,
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

interface Webhook {
  id: number;
  url: string;
  evento: string;
  activo: boolean;
  createdAt: string;
}

const EVENTOS = ['PEDIDO_CREADO', 'STOCK_BAJO'];

const WebhooksPage = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Webhook | null>(null);
  const [form, setForm] = useState({ url: '', evento: 'PEDIDO_CREADO' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.get<Webhook[]>('/webhooks');
      setWebhooks(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const openCrear = () => {
    setEditando(null);
    setForm({ url: '', evento: 'PEDIDO_CREADO' });
    setDialogOpen(true);
  };

  const openEditar = (w: Webhook) => {
    setEditando(w);
    setForm({ url: w.url, evento: w.evento });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.url.trim()) {
      setError('La URL es obligatoria');
      return;
    }
    setSaving(true);
    try {
      if (editando) {
        await apiService.put(`/webhooks/${editando.id}`, { ...form, activo: editando.activo });
      } else {
        await apiService.post('/webhooks', form);
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await apiService.delete(`/webhooks/${deleteId}`);
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WebhookIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4">Webhooks</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCrear}>
            Nuevo Webhook
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
      ) : webhooks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No hay webhooks configurados.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {webhooks.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.url}
                  </TableCell>
                  <TableCell>
                    <Chip label={w.evento} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={w.activo ? 'Activo' : 'Inactivo'}
                      color={w.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEditar(w)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(w.id)}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Webhook' : 'Nuevo Webhook'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="dense"
            label="URL"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="https://ejemplo.com/webhook"
          />
          <TextField
            fullWidth
            margin="dense"
            label="Evento"
            select
            value={form.evento}
            onChange={(e) => setForm((p) => ({ ...p, evento: e.target.value }))}
            slotProps={{ select: { native: true } }}
          >
            {EVENTOS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </TextField>
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

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>¿Eliminar webhook?</DialogTitle>
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

export default WebhooksPage;
