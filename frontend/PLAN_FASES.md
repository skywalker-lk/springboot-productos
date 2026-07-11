# 10_ProductosApp - Plan de Migración y Desarrollo

**Fecha**: 30/04/2026  
**Estado**: FASE 4 y 5 COMPLETADAS ✅  
**Próximo paso**: FASE 6 - Ajustes Finales

---

## 📋 Resumen Ejecutivo

Migración de **React Native (10_ProductosApp)** a **React 19 + TypeScript + Vite** (productos-client) con:
- Role-Based Access Control (RBAC)
- Módulo de ventas con descuento de stock
- Estadísticas con Recharts
- Mock contexts (sin backend por ahora)

---

## ✅ FASES COMPLETADAS

### ✅ FASE 1: Definición de Tipos (Completed)
**Fecha**: 30/04/2026

- [x] Actualizar `types/auth.ts` con `UserRole` type (`'vendedor' | 'gerente' | 'analista'`)
- [x] Crear `types/sale.ts` (Sale, SaleItem, SaleStatus interfaces)
- [x] Crear `types/user.ts` (UserProfile, UserFormData interfaces)
- [x] Actualizar `store/AuthContext.mock.tsx` con 3 usuarios de prueba:
  - vendedor1 / vendedor123 (rol: vendedor)
  - gerente1 / gerente123 (rol: gerente)
  - analista1 / analista123 (rol: analista)
- [x] Instalar Recharts para estadísticas futuras

**Archivos modificados**:
- `types/auth.ts`
- `types/product.ts` (agregado `stock: number`)
- `types/sale.ts` (nuevo)
- `types/user.ts` (nuevo)

---

### ✅ FASE 2: Lógica de Roles y Navegación (Completed)
**Fecha**: 30/04/2026

- [x] Crear `hooks/useAuthGuard.ts` con hooks de verificación:
  - `isVendedor()`, `isGerente()`, `isAnalista()`
  - `canManageProducts()`, `canManageUsers()`, `canRegisterSales()`, `canViewStats()`
- [x] Actualizar `components/Navbar.tsx`:
  - Mostrar/ocultar links según rol
  - Mostrar información del usuario logueado
  - Botón de logout
- [x] Limpiar exports en `store/index.ts`

**Archivos modificados**:
- `hooks/useAuthGuard.ts` (nuevo)
- `components/Navbar.tsx`
- `store/index.ts`

---

### ✅ FASE 3: Gestión de Usuarios (Completed)
**Fecha**: 30/04/2026

- [x] Crear `store/userReducer.ts` para operaciones CRUD de usuarios
- [x] Crear `store/UserContext.mock.tsx` con persistencia en localStorage
- [x] Crear `pages/UsersPage.tsx` con TanStack Table (reutilizado de ProductsPage)
- [x] Crear `pages/UserFormPage.tsx` (crear/editar usuario con selección de rol)
- [x] Actualizar `App.tsx` con rutas de usuarios y `UserProvider`
- [x] Corregir todos los errores de TypeScript (build limpio)

**Archivos nuevos**:
- `store/userReducer.ts`
- `store/UserContext.mock.tsx`
- `pages/UsersPage.tsx`
- `pages/UserFormPage.tsx`

---

### ✅ FASE 4: Módulo de Ventas (Completed)
**Fecha**: 30/04/2026

- [x] Crear `store/saleReducer.ts` para manejo de estado de ventas
- [x] Actualizar `types/product.ts` con `stock: number` en interfaz `Producto`
- [x] Actualizar `store/productReducer.ts` con acción `DEDUCT_STOCK`
- [x] Actualizar `store/ProductContext.mock.tsx`:
  - Agregar `stock` a `MOCK_PRODUCTOS` (valores: 50, 30)
  - Exponer función `deductStock` en el context value
- [x] Crear `store/SaleContext.mock.tsx` que descuenta stock automáticamente
- [x] Crear `pages/SalesPage.tsx`:
  - Listado con TanStack Table
  - Filtrado por rol (vendedor ve sus ventas, gerente ve todas)
  - Búsqueda global, ordenamiento, paginación
- [x] Crear `pages/NewSalePage.tsx`:
  - Selección de productos con búsqueda en tiempo real
  - Ajuste de cantidades (+/- botones)
  - Validación de stock (no permite agregar si no hay stock)
  - Resumen de venta con total calculado
  - Registro de venta con descuento automático de stock
- [x] Actualizar `store/index.ts` con exports de SaleContext
- [x] Actualizar `App.tsx` con rutas `/sales` y `/sales/new`
- [x] Actualizar `components/Navbar.tsx` con link "Ventas" para vendedores y gerentes

**Archivos nuevos**:
- `store/saleReducer.ts`
- `store/SaleContext.mock.tsx`
- `pages/SalesPage.tsx`
- `pages/NewSalePage.tsx`

**Archivos modificados**:
- `store/productReducer.ts`
- `store/ProductContext.mock.tsx`
- `store/index.ts`
- `App.tsx`
- `components/Navbar.tsx`

---

### ✅ FASE 5: Estadísticas con Recharts (Completed)
**Fecha**: 30/04/2026

- [x] Crear `pages/StatsPage.tsx` con 4 gráficos:
  1. **BarChart**: Ventas últimos 7 días (cantidad + ingresos)
  2. **AreaChart**: Tendencia mensual de ventas
  3. **Horizontal BarChart**: Top 5 productos más vendidos
  4. **PieChart**: Ventas por categoría (con colores)
- [x] Agregar cards de resumen:
  - Total Ventas
  - Ingresos Totales
  - Items Vendidos
- [x] Protección por rol: Solo `analista` y `gerente` pueden ver estadísticas
- [x] Actualizar `App.tsx` con ruta `/stats`
- [x] El link "Estadísticas" ya estaba en Navbar (para analista/gerente)

**Archivos nuevos**:
- `pages/StatsPage.tsx`

**Archivos modificados**:
- `App.tsx`

---

## 🔜 FASE 6: AJUSTES FINALES (Próximo Paso)

### Prioridad ALTA (Para completar el sistema funcional)

#### 1. Proteger Rutas con `useAuthGuard`
- [ ] Verificar que `/products/new` y `/products/:id/edit` solo accesibles por `gerente`
- [ ] Verificar que `/sales/new` solo accesible por `vendedor` y `gerente`
- [ ] Verificar que `/stats` solo accesible por `analista` y `gerente`
- [ ] Verificar que `/users/*` solo accesible por `gerente`
- [ ] Implementar componente `ProtectedRoute` si es necesario

#### 2. Ocultar Botones de Edición/Eliminación según Rol
- [ ] En `ProductsPage`: Ocultar "Editar" y "Eliminar" para `vendedor`
- [ ] En `UsersPage`: Ocultar acciones para no-gerentes
- [ ] En `SalesPage`: Los `vendedores` solo ven sus ventas (ya implementado ✅)

#### 3. Verificar Flujo Completo de Ventas
- [ ] **Test E2E manual**:
  1. Login como vendedor1
  2. Ir a "Nueva Venta"
  3. Seleccionar productos (verificar que no permite más que stock)
  4. Registrar venta
  5. Verificar que el stock se descontó en `ProductContext`
  6. Ver la venta en "Ventas"
  7. Login como gerente1
  8. Verificar que ve todas las ventas
  9. Verificar que el stock actualizado se refleja en "Productos"

### Prioridad MEDIA (Pulido de UX)

#### 4. Agregar Feedback de Acceso Denegado
- [ ] Mostrar `Alert` cuando un usuario intente acceder a ruta no permitida
- [ ] Redirigir a `/catalog` con mensaje de error

#### 5. UI Polish
- [ ] Loading states consistentes en todas las páginas
- [ ] Empty states amigables (ej: "No hay ventas registradas")
- [ ] Error boundaries para crashes inesperados
- [ ] Mejorar diseño responsive si es necesario

### Prioridad BAJA (Optimización)

#### 6. Code Splitting
- [ ] El bundle está en 1MB (Recharts + MUI + TanStack)
- [ ] Implementar `React.lazy()` para las páginas principales
- [ ] Configurar `build.rolldownOptions.output.codeSplitting` en Vite

---

## 🔮 OPCIONALES (Cuando quieras)

### Login UI Real
- [ ] Crear página de login (`/login`)
- [ ] Formulario con correo/contraseña
- [ ] Conectar con backend cuando esté listo
- [ ] Manejo de JWT token y persistencia

### E2E Testing con Playwright
- [ ] Instalar Playwright
- [ ] Crear tests para flujos críticos:
  - Login → Catálogo → Nueva Venta → Verificar Stock
  - Gerente → Gestión de Usuarios → Crear Usuario
  - Analista → Ver Estadísticas

---

## 🏗️ Arquitectura y Convenciones Técnicas

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: MUI v9 (Material Design)
- **Tables**: TanStack Table (React Table v8)
- **Charts**: Recharts
- **Routing**: React Router DOM v7
- **State Management**: React Context + useReducer (Mock contexts)
- **Persistence**: localStorage
- **API**: Native `fetch` (preparado para backend futuro)

### Patrones de Código (Gentleman Programming)
- **Types**: Const types, flat interfaces, no `any`
- **React 19**: Named imports, no useMemo/useCallback necesarios
- **MUI v9**: Props como `justifyContent` van en `sx`, no como props directos
- **Components**: Container/Presentational pattern cuando aplica
- **Tables**: TanStack Table con `createColumnHelper`

### Estructura de Carpetas
```
productos-client/src/
├── components/          # Componentes reutilizables (Navbar)
├── hooks/              # Custom hooks (useAuthGuard, useForm)
├── pages/              # Páginas/Rutas
│   ├── CatalogPage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductFormPage.tsx
│   ├── CategoriesPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── ContactPage.tsx
│   ├── UsersPage.tsx
│   ├── UserFormPage.tsx
│   ├── SalesPage.tsx
│   ├── NewSalePage.tsx
│   └── StatsPage.tsx
├── store/              # State management (Context + Reducers)
│   ├── index.ts
│   ├── authReducer.ts
│   ├── AuthContext.mock.tsx
│   ├── productReducer.ts
│   ├── ProductContext.mock.tsx
│   ├── cartReducer.ts
│   ├── CartContext.mock.tsx
│   ├── userReducer.ts
│   ├── UserContext.mock.tsx
│   ├── saleReducer.ts
│   └── SaleContext.mock.tsx
├── types/              # TypeScript interfaces
│   ├── auth.ts
│   ├── product.ts
│   ├── sale.ts
│   └── user.ts
├── theme/              # MUI theme
│   └── muiTheme.ts
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 🎯 Definición de Roles (RBAC)

| Rol | Permisos |
|-----|-----------|
| **vendedor** | - Ver catálogo y productos (solo lectura)<br>- Registrar ventas<br>- Ver sus propias ventas |
| **gerente** | - Gestión completa de productos (CRUD)<br>- Gestión completa de usuarios (CRUD)<br>- Ver TODAS las ventas<br>- Ver estadísticas |
| **analista** | - Solo lectura de estadísticas y ventas<br>- Sin acceso a gestión |

---

## 💡 Gotchas y Aprendizajes (Lessons Learned)

### MUI v9 Quirks
1. **Stack props**: `justifyContent` y `alignItems` NO van como props directos → van dentro de `sx`
   ```tsx
   // ❌ INCORRECTO
   <Stack direction="row" justifyContent="space-between">
   
   // ✅ CORRECTO
   <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
   ```

2. **TextField slotProps**: `InputProps` cambió a `slotProps.input` en MUI v9
   ```tsx
   // ❌ INCORRECTO
   <TextField InputProps={{ startAdornment: <Icon /> }} />
   
   // ✅ CORRECTO
   <TextField slotProps={{ input: { startAdornment: <Icon /> } }} />
   ```

3. **Grid**: MUI v9 no tiene `Grid2` → usar `Box` con CSS Grid o `Grid` con prop `size`

### TypeScript Gotchas
1. **User type**: Usa `uid` no `id` (causó error TS2339 inicialmente)
2. **Context type mismatch**: Al crear context con `createContext({} as Type)`, asegurar que todas las propiedades estén expuestas

### React Context Patterns
1. **Context interaction**: `SaleContext` no puede hacer dispatch directo a `ProductContext` → exponer función `deductStock` en `ProductContext`
2. **Build errors**: TypeScript errors causan PANTALLA EN BLANCO en producción → corregir inmediatamente

### Recharts Integration
1. **ResponsiveContainer**: Funciona perfecto con MUI `Grid` (prop `size`)
2. **Data format**: Asegurar que los datos pasados a los gráficos sean arrays memorizados con `useMemo`

### localStorage Persistence
1. Funciona bien para mock data (users, sales, cart)
2. Recordar hacer `JSON.parse()` y `JSON.stringify()`
3. Manejar errores de parsing con try/catch

---

## 📊 Estado Actual del Build

```
✅ Build passes cleanly
📦 Bundle size: 1,026.42 kB (304.93 kB gzipped)
⚠️  Warning: Some chunks > 500 kB (expected due to Recharts + MUI + TanStack)
```

---

## 🚀 Cómo Seguir (Next Session)

1. **Leer este archivo** para recordar dónde quedamos
2. **Ejecutar `npm run dev`** en `productos-client/` para ver la app
3. **Comenzar con FASE 6** - Prioridad ALTA primero:
   - Proteger rutas con `useAuthGuard`
   - Ocultar botones según rol
   - Verificar flujo completo de ventas
4. **Consultar engram memory** si es necesario:
   ```bash
   # Las memorias están guardadas en Engram bajo project: '10_productosapp'
   ```

---

## 📞 Credenciales de Prueba (Mock Auth)

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| vendedor1 | vendedor123 | vendedor |
| gerente1 | gerente123 | gerente |
| analista1 | analista123 | analista |

*Nota: Estos usuarios están hardcodeados en `AuthContext.mock.tsx` para desarrollo sin backend.*

---

**¡El sistema ya es funcional! Solo falta pulir accesos y UX en FASE 6. 🎉**

---

*Generado: 30/04/2026*  
*Autor: Gentleman Programming Assistant*  
*Proyecto: 10_ProductosApp → productos-client*
