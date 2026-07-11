import { KeyboardArrowDown, KeyboardArrowUp, Receipt as ReceiptIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiService, getErrorMessage } from '../services/api';
import type { PedidoListResponse } from '../types/pedido';

interface LineaPedidoDTO {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface PedidoDTO {
  id: number;
  fecha: string;
  cliente: string;
  total: number;
  estado: string;
  lineas: LineaPedidoDTO[];
}

function PedidoRow({ pedido }: { pedido: PedidoDTO }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>#{pedido.id}</TableCell>
        <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
        <TableCell>${Number(pedido.total).toFixed(2)}</TableCell>
        <TableCell>
          <Chip
            label={pedido.estado}
            color={pedido.estado === 'Confirmado' ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Productos
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedido.lineas.map((linea, i) => (
                    <TableRow key={i}>
                      <TableCell>{linea.descripcion}</TableCell>
                      <TableCell align="right">{linea.cantidad}</TableCell>
                      <TableCell align="right">
                        ${Number(linea.precioUnitario).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">${Number(linea.subtotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const MisPedidosPage = () => {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const data = await apiService.get<PedidoListResponse>(
          '/pedidos/mis-pedidos?pagina=0&limite=200',
        );
        setPedidos(data.pedidos as PedidoDTO[]);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          Mis Pedidos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {pedidos.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No tenés pedidos todavía.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Pedido</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((pedido) => (
                <PedidoRow key={pedido.id} pedido={pedido} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default MisPedidosPage;
