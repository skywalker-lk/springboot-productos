import {
  Add,
  Clear,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Receipt as ReceiptIcon,
  Search,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';
import { useAuth, useSale } from '../store';
import type { Sale } from '../types/sale';

const columnHelper = createColumnHelper<Sale>();

const PAGE_SIZE = 50;

const SalesPage = () => {
  const { state, clearError, loadSales } = useSale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const handleFilter = () => {
    if (desde && hasta) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      loadSales(desde, hasta, 0, pageSize);
    }
  };

  const handleClearFilter = () => {
    setDesde('');
    setHasta('');
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    loadSales(undefined, undefined, 0, pageSize);
  };

  // Filter sales by user role client-side over the current page
  const filteredSales = useMemo(() => {
    if (!user) return [];
    if (user.rol === 'gerente') return state.sales;
    return state.sales.filter((sale) => sale.userId === user.uid);
  }, [state.sales, user]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('date', {
        header: 'Fecha',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor('userName', {
        header: 'Vendedor',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('items', {
        header: 'Productos',
        cell: (info) => `${info.getValue().length} items`,
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => (
          <Chip
            label={info.getValue() === 'completed' ? 'Completada' : 'Pendiente'}
            color={info.getValue() === 'completed' ? 'success' : 'warning'}
            size="small"
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredSales,
    columns: columns as ColumnDef<Sale>[],
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPagination(next);
      loadSales(desde || undefined, hasta || undefined, next.pageIndex, next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(state.total / pageSize),
    autoResetPageIndex: false,
  });

  if (state.isLoading) {
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Registro de Pedidos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {desde && hasta && (
            <>
              <Button
                size="small"
                variant="text"
                startIcon={<ExcelIcon />}
                href={`${API_BASE}/reportes/pedidos/excel?desde=${desde}&hasta=${hasta}`}
                download="pedidos.xlsx"
              >
                Excel
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<PdfIcon />}
                href={`${API_BASE}/reportes/pedidos/pdf?desde=${desde}&hasta=${hasta}`}
                download="pedidos.pdf"
              >
                PDF
              </Button>
            </>
          )}
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sales/new')}>
            Nuevo Pedido
          </Button>
        </Box>
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {state.error}
        </Alert>
      )}

      {/* Filtro por fechas */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Desde"
              type="date"
              size="small"
              fullWidth
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Hasta"
              type="date"
              size="small"
              fullWidth
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleFilter}
                disabled={!desde || !hasta}
              >
                Filtrar
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearFilter}
                disabled={!desde && !hasta}
              >
                Limpiar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtro global */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar pedido…"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: '100%', maxWidth: 400 }}
        />
      </Paper>

      {/* Tabla */}
      <Paper elevation={3}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ borderBottom: '2px solid #e0e0e0' }}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        padding: '16px',
                        textAlign: 'left',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ padding: '16px' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center' }}>
                    <Typography color="text.secondary">No hay pedidos registrados</Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Paginación */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ p: 2, alignItems: 'center', justifyContent: 'center' }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Typography>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SalesPage;
