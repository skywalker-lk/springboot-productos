import { Done as DoneIcon, QuestionAnswer as QaIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiService, getErrorMessage } from '../services/api';

interface Contacto {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string;
  leido: boolean;
  createdAt: string;
}

const AdminContactosPage = () => {
  const [items, setItems] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Contacto[]>('/contacto');
      setItems(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const marcarLeido = async (id: number) => {
    try {
      await apiService.put(`/contacto/${id}/leido`, {});
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, leido: true } : c)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
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

  const paginated = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <QaIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4">Consultas Recibidas</Typography>
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
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mensaje</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id} hover sx={{ opacity: c.leido ? 0.6 : 1 }}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatFecha(c.createdAt)}</TableCell>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Tooltip title={c.mensaje} placement="bottom-start">
                        <span>{c.mensaje}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.leido ? 'Leído' : 'Nuevo'}
                        size="small"
                        color={c.leido ? 'default' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {!c.leido && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DoneIcon />}
                          onClick={() => marcarLeido(c.id)}
                        >
                          Marcar leído
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No hay consultas recibidas</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={items.length}
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

export default AdminContactosPage;
