import { Add, Delete, Edit, People as PeopleIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
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
import { useUser } from '../store';
import type { UserProfile } from '../types/user';

const columnHelper = createColumnHelper<UserProfile>();

const PAGE_SIZE = 50;

const UsersPage = () => {
  const { state, loadUsers, deleteUser, clearError } = useUser();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  // Filtro combinado: texto global + rol (client-side over current page)
  const filteredUsers = useMemo(() => {
    let filtered = state.users;
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.correo.toLowerCase().includes(q) ||
          u.rol.toLowerCase().includes(q),
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((u) => u.rol === roleFilter);
    }
    return filtered;
  }, [state.users, globalFilter, roleFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('correo', {
        header: 'Correo',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('rol', {
        header: 'Rol',
        cell: (info) => (
          <Chip
            label={info.getValue()}
            color={
              info.getValue() === 'gerente'
                ? 'error'
                : info.getValue() === 'analista'
                  ? 'info'
                  : 'default'
            }
            size="small"
          />
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => (
          <Chip
            label={info.getValue() === 'activo' ? 'Activo' : 'Inactivo'}
            color={info.getValue() === 'activo' ? 'success' : 'default'}
            size="small"
          />
        ),
      }),
      columnHelper.accessor('fechaCreacion', {
        header: 'Fecha Creación',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/users/${info.row.original.id}/edit`)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  if (window.confirm('¿Está seguro de eliminar este usuario?')) {
                    deleteUser(info.row.original.id);
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      }),
    ],
    [navigate, deleteUser],
  );

  const table = useReactTable({
    data: filteredUsers,
    columns: columns as ColumnDef<UserProfile>[],
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
      loadUsers(next.pageIndex, next.pageSize);
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
          <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Gestión de Usuarios
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/users/new')}>
          Nuevo Usuario
        </Button>
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {state.error}
        </Alert>
      )}

      {/* Filtro global + rol */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar usuario…"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Rol</InputLabel>
            <Select value={roleFilter} label="Rol" onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
              <MenuItem value="analista">Analista</MenuItem>
              <MenuItem value="vendedor">Vendedor</MenuItem>
              <MenuItem value="inventorista">Inventorista</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
                    <Typography color="text.secondary">No hay usuarios registrados</Typography>
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

export default UsersPage;
