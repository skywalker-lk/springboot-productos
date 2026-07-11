import { UploadFile as FileUploadIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { apiService, getErrorMessage } from '../services/api';

interface BulkUpdateResult {
  total: number;
  actualizados: number;
  errores: { fila: number; mensaje: string }[];
}

interface BulkUpdateItem {
  id: number;
  precio?: number;
  stock?: number;
}

interface ProductBulkUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductBulkUpdateDialog = ({
  open,
  onClose,
  onSuccess,
}: ProductBulkUpdateDialogProps) => {
  const [updateJson, setUpdateJson] = useState('');
  const [updatePreview, setUpdatePreview] = useState<BulkUpdateItem[] | null>(null);
  const [updateResult, setUpdateResult] = useState<BulkUpdateResult | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [updateUploading, setUpdateUploading] = useState(false);

  const handleClose = () => {
    if (updating || updateUploading) return;
    setUpdateJson('');
    setUpdatePreview(null);
    setUpdateResult(null);
    setUpdateFile(null);
    onClose();
  };

  const parseUpdatePreview = () => {
    try {
      const parsed = JSON.parse(updateJson);
      if (!Array.isArray(parsed)) throw new Error('Debe ser un array');
      setUpdatePreview(parsed);
      setUpdateResult(null);
    } catch (e: unknown) {
      alert(`Error al parsear JSON: ${e instanceof Error ? e.message : getErrorMessage(e)}`);
    }
  };

  const handleBulkUpdate = async () => {
    if (!updatePreview || updatePreview.length === 0) return;
    setUpdating(true);
    setUpdateResult(null);
    try {
      const res = await apiService.put<BulkUpdateResult>(
        '/productos/actualizar/masivo',
        updatePreview,
      );
      setUpdateResult(res);
      if (res.actualizados > 0) onSuccess();
    } catch (e: unknown) {
      alert(`Error al actualizar: ${getErrorMessage(e)}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpdate = async (file: File) => {
    setUpdateFile(file);
    setUpdateUploading(true);
    setUpdateResult(null);
    setUpdatePreview(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiService.upload<BulkUpdateResult>(
        '/productos/actualizar/archivo',
        formData,
      );
      setUpdateResult(res);
      if (res.actualizados > 0) onSuccess();
    } catch (e: unknown) {
      alert(`Error al actualizar archivo: ${getErrorMessage(e, 'Error de conexión')}`);
    } finally {
      setUpdateUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Actualizar Productos (precio / stock)</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Solo <code>id</code> es obligatorio. Dejá <code>precio</code> y/o <code>stock</code>{' '}
          vacíos si no querés modificar ese campo.
        </Typography>

        {/* Archivo */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          1. Subir archivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Formatos: <code>.csv</code> o <code>.xlsx</code> (columnas: <code>id, precio, stock</code>{' '}
          — precio y stock opcionales).
        </Typography>

        <Box
          sx={{
            border: '2px dashed',
            borderColor: updateFile ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            mb: 2,
            cursor: 'pointer',
            bgcolor: updateFile ? 'action.hover' : 'transparent',
          }}
          onClick={() => document.getElementById('update-file-input')?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFileUpdate(f);
          }}
        >
          <input
            id="update-file-input"
            type="file"
            accept=".csv,.xlsx"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpdate(f);
            }}
          />
          {updateUploading ? (
            <Typography>Subiendo archivo…</Typography>
          ) : updateFile ? (
            <Box>
              <FileUploadIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="body1">{updateFile.name}</Typography>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setUpdateFile(null);
                }}
              >
                Quitar
              </Button>
            </Box>
          ) : (
            <Box>
              <FileUploadIcon sx={{ fontSize: 40, color: 'grey.400' }} />
              <Typography>Hacé click o arrastrá un archivo</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }}>O</Divider>

        {/* JSON */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          2. Pegar JSON
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cada item necesita <code>id</code>. Opcionales: <code>precio</code>, <code>stock</code>.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder={`[\n  { "id": 1, "precio": 3500 },\n  { "id": 5, "precio": 4200, "stock": 20 },\n  { "id": 12, "stock": 0 }\n]`}
          value={updateJson}
          onChange={(e) => {
            setUpdateJson(e.target.value);
            setUpdatePreview(null);
            setUpdateResult(null);
          }}
          sx={{ mb: 2, fontFamily: 'monospace' }}
        />

        {!updateResult && (
          <Button
            variant="outlined"
            onClick={parseUpdatePreview}
            disabled={!updateJson.trim()}
            sx={{ mr: 1 }}
          >
            Previsualizar
          </Button>
        )}

        {/* Preview */}
        {updatePreview && !updateResult && (
          <Paper variant="outlined" sx={{ mt: 2, p: 2, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {updatePreview.length} producto{updatePreview.length !== 1 ? 's' : ''} a actualizar:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell align="right">ID</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {updatePreview.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell align="right">{p.id}</TableCell>
                      <TableCell align="right">{p.precio != null ? `$${p.precio}` : '—'}</TableCell>
                      <TableCell align="right">{p.stock != null ? p.stock : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Resultado */}
        {updateResult && (
          <Alert
            severity={updateResult.errores.length === 0 ? 'success' : 'warning'}
            sx={{ mt: 2 }}
          >
            <strong>Actualización completada:</strong> {updateResult.actualizados} de{' '}
            {updateResult.total} productos actualizados.
            {updateResult.errores.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Errores:
                </Typography>
                {updateResult.errores.map((err, i) => (
                  <Typography key={i} variant="caption" color="error" sx={{ display: 'block' }}>
                    Fila {err.fila}: {err.mensaje}
                  </Typography>
                ))}
              </Box>
            )}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
        {updatePreview && !updateResult && (
          <Button variant="contained" onClick={handleBulkUpdate} disabled={updating}>
            {updating ? 'Actualizando…' : `Actualizar ${updatePreview.length} productos`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
