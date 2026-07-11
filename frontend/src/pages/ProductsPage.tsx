import {
  Add as AddIcon,
  Description as CsvIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TableChart as ExcelIcon,
  FilterList as FilterIcon,
  CloudUpload as ImportIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  SystemUpdateAlt as UpdateIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductBulkImageUpload } from '../components/ProductBulkImageUpload';
import { ProductBulkUpdateDialog } from '../components/ProductBulkUpdateDialog';
import { ProductImportDialog } from '../components/ProductImportDialog';
import { ProductModal } from '../components/ProductModal';
import { useCategories } from '../hooks/useCategories';
import { API_BASE } from '../services/api';
import { useProductContext } from '../store';
import type { ProductFilters } from '../store/ProductContext';
import type { Categoria, Producto } from '../types';

const columnHelper = createColumnHelper<Producto>();

const ProductsPage = () => {
  const { products, filteredTotal, isLoading, loadProducts, deleteProduct, currentFilters } =
    useProductContext();
  const { categories } = useCategories();

  // ==================== SEARCH / FILTERS ====================
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [stockMin, setStockMin] = useState('');
  const [stockMax, setStockMax] = useState('');

  const aplicarFiltros = (extra?: Partial<ProductFilters>) => {
    const filters: ProductFilters = {
      q: searchText || undefined,
      categoria: catFilter || undefined,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      stockMin: stockMin ? Number(stockMin) : undefined,
      stockMax: stockMax ? Number(stockMax) : undefined,
      ...extra,
    };
    loadProducts(filters);
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      aplicarFiltros();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, catFilter, precioMin, precioMax, stockMin, stockMax]);

  const limpiarFiltros = () => {
    setSearchText('');
    setCatFilter('');
    setPrecioMin('');
    setPrecioMax('');
    setStockMin('');
    setStockMax('');
    loadProducts({});
  };

  // ==================== MODAL STATE ====================
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Producto | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);

  const openCreateModal = () => {
    setEditProduct(undefined);
    setModalOpen(true);
  };

  const openEditModal = (product: Producto) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget._id);
    } catch {
      console.error('Error deleting product');
    }
    setDeleteTarget(null);
  };

  // ==================== EXPORT ====================
  const exportUrl = (format: string) => {
    const params = new URLSearchParams();
    if (currentFilters.q) params.set('q', currentFilters.q);
    if (currentFilters.categoria) params.set('categoria', currentFilters.categoria);
    if (currentFilters.precioMin != null) params.set('precioMin', String(currentFilters.precioMin));
    if (currentFilters.precioMax != null) params.set('precioMax', String(currentFilters.precioMax));
    if (currentFilters.stockMin != null) params.set('stockMin', String(currentFilters.stockMin));
    if (currentFilters.stockMax != null) params.set('stockMax', String(currentFilters.stockMax));
    const qs = params.toString();
    return `${API_BASE}/reportes/productos/${format}${qs ? `?${qs}` : ''}`;
  };

  // ==================== DERIVED ====================
  const sinStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);

  // ==================== COLUMNAS ====================
  const columns = useMemo(() => {
    const getStockColor = (stock: number): 'success' | 'info' | 'error' => {
      if (stock === 0) return 'error';
      if (stock <= 10) return 'info';
      return 'success';
    };
    const getCategoryName = (categoria: Categoria | string): string => {
      if (typeof categoria === 'string') {
        const found = categories.find((cat) => cat._id === categoria);
        return found?.nombre || categoria;
      }
      return categoria?.nombre || 'Sin categoría';
    };
    return [
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('precio', {
        header: 'Precio',
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor('categoria', {
        header: 'Categoría',
        cell: (info) => {
          const cat = info.getValue();
          return <Chip label={getCategoryName(cat)} size="small" variant="filled" />;
        },
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => {
          const stock = info.getValue();
          return (
            <Chip
              label={stock}
              size="small"
              color={getStockColor(stock)}
              variant={stock === 0 ? 'filled' : 'outlined'}
            />
          );
        },
      }),
      columnHelper.accessor('_id', {
        header: 'Acciones',
        cell: (info) => {
          const product = info.row.original;
          return (
            <Box>
              <Tooltip title="Editar">
                <IconButton color="primary" onClick={() => openEditModal(product)} size="small">
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton color="error" onClick={() => setDeleteTarget(product)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      }),
    ];
  }, []);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // ==================== LOADING ====================
  if (isLoading && products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
        </Box>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Paper>
      </Container>
    );
  }

  // ==================== RENDER ====================
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* HEADER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ display: 'inline' }}>
              Productos
            </Typography>
            {filteredTotal > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, display: 'inline' }}>
                ({filteredTotal} encontrados)
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadProducts()}>
              Actualizar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={() => setImportOpen(true)}
            >
              Importar
            </Button>
            <Button
              variant="outlined"
              startIcon={<UpdateIcon />}
              onClick={() => setUpdateOpen(true)}
            >
              Actualizar
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
              Nuevo Producto
            </Button>
          </Box>
        </Box>

        {/* SEARCH BAR + EXPORT */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar productos…"
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
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Button
            size="small"
            variant={filtersOpen ? 'contained' : 'outlined'}
            startIcon={<FilterIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filtros
          </Button>

          <Divider orientation="vertical" flexItem />

          <Button
            size="small"
            variant="text"
            startIcon={<ExcelIcon />}
            href={exportUrl('excel')}
            download="productos.xlsx"
          >
            Excel
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<CsvIcon />}
            href={exportUrl('csv')}
            download="productos.csv"
          >
            CSV
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<PdfIcon />}
            href={exportUrl('pdf')}
            download="productos.pdf"
          >
            PDF
          </Button>
        </Box>

        {/* FILTERS COLLAPSE */}
        <Collapse in={filtersOpen}>
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}
          >
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={catFilter}
                label="Categoría"
                onChange={(e) => setCatFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.nombre}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Precio min"
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 110 }}
            />
            <TextField
              size="small"
              label="Precio max"
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 110 }}
            />
            <TextField
              size="small"
              label="Stock min"
              type="number"
              value={stockMin}
              onChange={(e) => setStockMin(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 110 }}
            />
            <TextField
              size="small"
              label="Stock max"
              type="number"
              value={stockMax}
              onChange={(e) => setStockMax(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 110 }}
            />
            <Button size="small" variant="outlined" onClick={() => aplicarFiltros()}>
              Aplicar
            </Button>
            <Button size="small" color="error" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </Paper>
        </Collapse>

        {/* STOCK ALERTS */}
        {sinStock.length > 0 && (
          <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 1 }}>
            <strong>
              {sinStock.length} producto{sinStock.length !== 1 ? 's' : ''} sin stock:
            </strong>{' '}
            {sinStock.map((p) => p.nombre).join(', ')}
          </Alert>
        )}
        {lowStock.length > 0 && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            <strong>
              {lowStock.length} producto{lowStock.length !== 1 ? 's' : ''} con stock bajo:
            </strong>{' '}
            {lowStock.map((p) => `${p.nombre} (${p.stock})`).join(', ')}
          </Alert>
        )}

        {/* BULK IMAGE UPLOAD */}
        <ProductBulkImageUpload onSuccess={() => loadProducts()} />

        {/* TABLE */}
        {products.length === 0 ? (
          <Alert severity="info">
            {filteredTotal === 0 && (currentFilters.q || currentFilters.categoria)
              ? 'No hay productos que coincidan con los filtros.'
              : 'No hay productos. ¡Crea el primero!'}
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Paginación */}
        {products.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}
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
        )}
      </Paper>

      {/* Modales */}
      <ProductModal open={modalOpen} onClose={closeModal} editProduct={editProduct} />

      <ProductImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => loadProducts()}
      />

      <ProductBulkUpdateDialog
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        onSuccess={() => loadProducts()}
      />

      {/* Confirmación de eliminación */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>¿Eliminar producto?</DialogTitle>
        <DialogContent>
          <Typography>
            Vas a eliminar <strong>{deleteTarget?.nombre}</strong>. Esta acción no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsPage;
