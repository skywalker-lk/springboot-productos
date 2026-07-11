import { History as HistoryIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiService, getErrorMessage } from '../services/api';

interface LogEntry {
  id: number;
  accion: string;
  detalle: string;
  usuarioId: number | null;
  usuarioNombre: string | null;
  endpoint: string | null;
  timestamp: string;
}

const ACCION_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  CREAR_PRODUCTO: 'success',
  ACTUALIZAR_PRODUCTO: 'info',
  ELIMINAR_PRODUCTO: 'error',
  ACTUALIZAR_MASIVO: 'warning',
  CREAR_PEDIDO: 'success',
  ACTUALIZAR_PEDIDO: 'info',
  ELIMINAR_PEDIDO: 'error',
  CREAR_USUARIO: 'success',
  ACTUALIZAR_USUARIO: 'info',
  ELIMINAR_USUARIO: 'error',
  INGRESO_STOCK: 'success',
  EGRESO_STOCK: 'warning',
  AJUSTE_STOCK: 'info',
};

const AuditoriaPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<{ total: number; logs: LogEntry[] }>(
        `/auditoria?pagina=${page}&limite=${rowsPerPage}`,
      );
      setLogs(data.logs);
      setTotal(data.total);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <HistoryIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4">Auditoría de Acciones</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell>Detalle</TableCell>
                  <TableCell>Usuario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatFecha(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.accion}
                        size="small"
                        color={ACCION_COLORS[log.accion] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{log.detalle}</TableCell>
                    <TableCell>{log.usuarioNombre || '—'}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No hay registros de auditoría</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage="Por página:"
          />
        </Paper>
      )}
    </Container>
  );
};

export default AuditoriaPage;
