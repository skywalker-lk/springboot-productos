import { BarChart as BarChartIcon, Category, ShoppingCart, TrendingUp } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useAuth, useProductContext, useSale } from '../store';
import type { Sale, SaleItem } from '../types/sale';

const StatsPage = () => {
  const { state: saleState } = useSale();
  const { products, isLoading: productsLoading } = useProductContext();
  const { user } = useAuth();
  const { canViewStats } = useAuthGuard();

  // ── Todos los hooks ANTES de los early returns ──
  // Filter sales for vendedor (only their own), gerente sees all
  // Sin auth (user null) muestra todo como gerente
  const sales: Sale[] = useMemo(() => {
    if (!user) return saleState.sales;
    if (user.rol === 'gerente') return saleState.sales;
    return saleState.sales.filter((sale) => sale.userId === user.uid);
  }, [saleState.sales, user]);

  // Sales by date (last 7 days)
  const salesByDate = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const daySales = sales.filter((sale) => sale.date.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('es-AR', { weekday: 'short' }),
        ventas: daySales.length,
        ingresos: daySales.reduce((sum, s) => sum + s.total, 0),
      };
    });
  }, [sales]);

  // Top products by quantity sold
  const topProducts = useMemo(() => {
    const productCount: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach((sale) => {
      sale.items.forEach((item: SaleItem) => {
        if (!productCount[item.productId]) {
          productCount[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productCount[item.productId].quantity += item.quantity;
        productCount[item.productId].revenue += item.subtotal;
      });
    });
    return Object.values(productCount)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    sales.forEach((sale) => {
      sale.items.forEach((item: SaleItem) => {
        const product = products.find((p) => p._id === item.productId);
        const category = product?.categoria.nombre || 'Sin categoría';
        categoryCount[category] = (categoryCount[category] || 0) + item.subtotal;
      });
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  }, [sales, products]);

  // Monthly sales trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { ventas: number; ingresos: number }> = {};
    sales.forEach((sale) => {
      const month = new Date(sale.date).toLocaleString('es-AR', {
        month: 'short',
        year: '2-digit',
      });
      if (!months[month]) months[month] = { ventas: 0, ingresos: 0 };
      months[month].ventas += 1;
      months[month].ingresos += sale.total;
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [sales]);

  // Summary stats (derivados de sales, no necesitan useMemo)
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // ── Early returns (después de todos los hooks) ──
  // Si no hay auth implementada (user null), mostrar igual
  // Si hay auth pero no tiene permisos, bloquear
  if (user && !canViewStats()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          No tienes permisos para ver las estadísticas. Se requiere rol de Analista o Gerente.
        </Alert>
      </Container>
    );
  }

  if (saleState.isLoading || productsLoading) {
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
        <BarChartIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          Estadísticas y Reportes
        </Typography>
      </Box>

      {saleState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saleState.error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Pedidos
                  </Typography>
                  <Typography variant="h4">{totalSales}</Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Ingresos Totales
                  </Typography>
                  <Typography variant="h4">${totalRevenue.toFixed(2)}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Items Vendidos
                  </Typography>
                  <Typography variant="h4">{totalItemsSold}</Typography>
                </Box>
                <Category sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales by Date (Last 7 Days) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos Últimos 7 Días
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#8884d8" name="Pedidos" />
                <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales Trend (Line Chart) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tendencia de Pedidos
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Pedidos"
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Ingresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Productos Más Vendidos
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#ffc658" name="Cantidad" />
                <Bar dataKey="revenue" fill="#ff8042" name="Ingresos ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales by Category (Pie Chart) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos por Categoría
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StatsPage;
