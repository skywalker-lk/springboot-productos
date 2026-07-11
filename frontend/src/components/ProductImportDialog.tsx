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

interface ImportResult {
  total: number;
  creados: number;
  errores: { fila: number; mensaje: string }[];
}

interface ImportItem {
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface ProductImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductImportDialog = ({ open, onClose, onSuccess }: ProductImportDialogProps) => {
  const [importJson, setImportJson] = useState('');
  const [importPreview, setImportPreview] = useState<ImportItem[] | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleClose = () => {
    if (importing || uploading) return;
    setImportJson('');
    setImportPreview(null);
    setImportResult(null);
    setUploadFile(null);
    onClose();
  };

  const parsePreview = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error('Debe ser un array');
      setImportPreview(parsed);
      setImportResult(null);
    } catch (e: unknown) {
      alert(`Error al parsear JSON: ${e instanceof Error ? e.message : getErrorMessage(e)}`);
    }
  };

  const handleImport = async () => {
    if (!importPreview || importPreview.length === 0) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await apiService.post<ImportResult>('/productos/importar', importPreview);
      setImportResult(res);
      if (res.creados > 0) onSuccess();
    } catch (e: unknown) {
      alert(`Error al importar: ${getErrorMessage(e)}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = async (file: File) => {
    setUploadFile(file);
    setUploading(true);
    setImportResult(null);
    setImportPreview(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiService.upload<ImportResult>('/productos/importar/archivo', formData);
      setImportResult(res);
      if (res.creados > 0) onSuccess();
    } catch (e: unknown) {
      alert(`Error al importar archivo: ${getErrorMessage(e)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Importar Productos</DialogTitle>
      <DialogContent>
        {/* Archivo CSV / Excel */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          1. Subir archivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Formatos aceptados: <code>.csv</code> (columnas: nombre,precio,stock,categoria) o{' '}
          <code>.xlsx</code> (mismas columnas).
        </Typography>

        <Box
          sx={{
            border: '2px dashed',
            borderColor: uploadFile ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            mb: 2,
            cursor: 'pointer',
            bgcolor: uploadFile ? 'action.hover' : 'transparent',
          }}
          onClick={() => document.getElementById('import-file-input')?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFileImport(f);
          }}
        >
          <input
            id="import-file-input"
            type="file"
            accept=".csv,.xlsx"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileImport(f);
            }}
          />
          {uploading ? (
            <Typography>Subiendo archivo…</Typography>
          ) : uploadFile ? (
            <Box>
              <FileUploadIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="body1">{uploadFile.name}</Typography>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadFile(null);
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

        {/* JSON manual */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          2. Pegar JSON
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cada producto necesita: <code>nombre</code>, <code>precio</code>, <code>stock</code>,{' '}
          <code>categoria</code> (tipo).
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder={`[\n  { "nombre": "Producto 1", "precio": 100, "stock": 10, "categoria": "BEBIDAS" },\n  { "nombre": "Producto 2", "precio": 200, "stock": 5, "categoria": "ALMACEN" }\n]`}
          value={importJson}
          onChange={(e) => {
            setImportJson(e.target.value);
            setImportPreview(null);
            setImportResult(null);
          }}
          sx={{ mb: 2, fontFamily: 'monospace' }}
        />

        {!importResult && (
          <Button
            variant="outlined"
            onClick={parsePreview}
            disabled={!importJson.trim()}
            sx={{ mr: 1 }}
          >
            Previsualizar
          </Button>
        )}

        {/* Preview */}
        {importPreview && !importResult && (
          <Paper variant="outlined" sx={{ mt: 2, p: 2, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {importPreview.length} producto{importPreview.length !== 1 ? 's' : ''} a importar:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell>Categoría</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importPreview.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{p.nombre || '—'}</TableCell>
                      <TableCell align="right">${p.precio ?? '—'}</TableCell>
                      <TableCell align="right">{p.stock ?? '—'}</TableCell>
                      <TableCell>{p.categoria || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Resultado */}
        {importResult && (
          <Alert
            severity={importResult.errores.length === 0 ? 'success' : 'warning'}
            sx={{ mt: 2 }}
          >
            <strong>Importación completada:</strong> {importResult.creados} de {importResult.total}{' '}
            productos creados.
            {importResult.errores.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Errores:
                </Typography>
                {importResult.errores.map((err, i) => (
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
        {importPreview && !importResult && (
          <Button variant="contained" onClick={handleImport} disabled={importing}>
            {importing ? 'Importando…' : `Importar ${importPreview.length} productos`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
