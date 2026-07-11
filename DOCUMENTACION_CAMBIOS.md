# Documentación de Cambios — Proyecto Final Ecommerce

## 1. Resumen Ejecutivo

Se migró el backend del esqueleto inicial (`springboot-productos`) al proyecto final completo (`ecommerce`), documentando cada feature implementada y su fundamento técnico.

| Aspecto | Final (Entrega) |
|---------|-------------------|
| Spring Boot | 4.0.6 |
| Java | 17 |
| Estructura | Single-module |
| Package | `com.techlab.ecommerce` |
| Dependencias | 16 |
| Clases Java | 116 |
| Endpoints REST | 45+ |
| Testing | 0 tests |
| Base de datos | H2 (dev) / PostgreSQL (prod) |

---

## 2. Dependencias Agregadas (pom.xml)

### 2.1 Dependencias Spring

| Dependencia | Propósito |
|-------------|-----------|
| `spring-boot-starter-web` | Controladores REST, embedded Tomcat, Jackson |
| `spring-boot-starter-data-jpa` | JPA/Hibernate, repositorios Spring Data |
| `spring-boot-starter-validation` | `@Valid`, `@NotBlank`, `@Positive`, etc. |
| `spring-boot-starter-security` | Filter chain, BCrypt, `UserDetails`, `@PreAuthorize` |
| `spring-boot-starter-thymeleaf` | Templates HTML para renderizado de PDFs |
| `spring-boot-starter-actuator` | Health checks, métricas, `/actuator/health` |

### 2.2 JWT (JSON Web Tokens)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `jjwt-api` | 0.12.6 | API de creación y validación de tokens |
| `jjwt-impl` | 0.12.6 | Implementación (runtime) |
| `jjwt-jackson` | 0.12.6 | Serialización JSON de claims (runtime) |

### 2.3 Utilidades extra

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `lombok` | (boot) | Eliminar boilerplate: `@Data`, `@Getter`, `@Setter` |
| `springdoc-openapi-starter-webmvc-ui` | 2.8.6 | Swagger UI automático en `/swagger-ui.html` |
| `poi-ooxml` | 5.3.0 | Exportación a Excel (Apache POI) |
| `flying-saucer-pdf` | 9.13.3 | Exportación a PDF (HTML → PDF) |

### 2.4 Bases de Datos

| Dependencia | Scope | Propósito |
|-------------|-------|-----------|
| `h2` | runtime | Base en memoria para desarrollo local |
| `postgresql` | runtime | PostgreSQL para producción / Docker |

---

## 3. Estructura del Proyecto (Screaming Architecture)

```
src/main/java/com/techlab/ecommerce/
├── config/                   # Configuración de frameworks
│   ├── AppConfig.java        # Spring Security: UserDetailsService, AuthProvider, PasswordEncoder
│   ├── CargaDatosConfig.java # Seed data: productos, usuarios, cupones al iniciar
│   ├── CorsConfig.java       # CORS global (permite frontend en dev)
│   ├── CurrentUser.java      # Anotación @CurrentUser para resolver usuario autenticado
│   ├── JwtAuthenticationFilter.java # Filtro OncePerRequestFilter que valida JWT
│   ├── JwtService.java       # Generación y validación de tokens HMAC-SHA256
│   ├── OpenApiConfig.java    # Configuración Swagger con esquema Bearer JWT
│   ├── SecurityConfig.java   # SecurityFilterChain con rutas públicas/protegidas por rol
│   └── WebConfig.java        # WebMvcConfigurer (CORS legacy / config adicional)
│
├── controller/               # Controladores REST
│   ├── AuthController.java           # /auth/login, /register, /forgot-password, /reset-password, /me, /logout
│   ├── ProductoController.java       # CRUD + búsqueda por nombre/categoría
│   ├── CategoriasController.java     # CRUD categorías
│   ├── CarritoController.java        # CRUD carrito + agregar/vaciar productos
│   ├── PedidosController.java        # CRUD pedidos + /mis-pedidos para CLIENTE
│   ├── UsuariosController.java       # CRUD usuarios (ADMIN)
│   ├── RolesController.java          # Consulta de roles
│   ├── CuponController.java          # CRUD cupones + /validar en checkout
│   ├── StockController.java          # Movimientos de stock (ingreso/egreso/ajuste)
│   ├── WebhookController.java        # CRUD webhooks + notificación de eventos
│   ├── AuditoriaController.java      # Consulta de log de auditoría
│   ├── NotificacionController.java   # SSE (Server-Sent Events) en /notificaciones/suscripcion
│   ├── ContactoController.java       # Formulario público + gestión admin
│   ├── ReporteController.java        # Exportación Excel/PDF
│   ├── UploadController.java         # Carga de imágenes
│   └── GlobalExceptionHandler.java   # @RestControllerAdvice — manejo centralizado de errores
│   └── dto/                          # 16 DTOs para requests/responses
│
├── model/                    # Entidades JPA (por dominio)
│   ├── auditoria/Auditoria.java
│   ├── carrito/Carrito.java, CarritoItem.java
│   ├── stock/MovimientoStock.java, TipoMovimiento.java
│   ├── productos/Producto.java, Comida.java, Bebida.java
│   ├── cupon/Cupon.java, TipoDescuento.java
│   ├── categorias/Categoria.java, SubCategoria.java
│   ├── usuarios/Usuario.java, Administrador.java, Cliente.java
│   ├── roles/RolUsuario.java
│   ├── contacto/Contacto.java
│   ├── pedidos/Pedido.java, LineaPedido.java
│   └── webhook/Webhook.java
│
├── repository/               # 10 interfaces Spring Data JPA
├── service/                  # 18 clases con lógica de negocio
└── util/Validador.java       # Validaciones auxiliares
```

---

## 4. Features Implementadas

### 4.1 JWT + Spring Security (Autenticación y Autorización)

**Arquitectura:**

```
Request HTTP → SecurityFilterChain → JwtAuthenticationFilter → SecurityContextHolder
                                           │
                                           ├─ Valida token JWT (HMAC-SHA256)
                                           ├─ Extrae email, id, rol
                                           └─ Setea UserDetails en contexto
```

**Flujo de login:**
1. `POST /auth/login` recibe `{correo, password}`
2. `AuthenticationManager.authenticate()` contra `DaoAuthenticationProvider`
3. Si OK → `JwtService.generarToken(usuario)` genera token con claims: `id`, `email`, `rol`
4. Retorna `{token: "eyJ..."}`

**Flujo de request autenticada:**
1. Cliente envía `Authorization: Bearer <token>`
2. `JwtAuthenticationFilter` extrae el token del header
3. `JwtService.validarToken()` verifica firma y expiración
4. Setea `SecurityContextHolder` con `UsernamePasswordAuthenticationToken`
5. `SecurityFilterChain` aplica reglas de `hasRole()`

**Cadena de seguridad completa:**

```java
// SecurityConfig.java
http.cors(cors -> cors.configurationSource(corsConfigurationSource))
    .csrf(csrf -> csrf.disable())
    .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/**").permitAll()
        .requestMatchers(GET, "/productos/**").permitAll()
        .requestMatchers(POST, "/productos/**").hasAnyRole("ADMINISTRADOR", "INVENTORISTA", ...)
        .requestMatchers(GET, "/pedidos/mis-pedidos").hasAnyRole("CLIENTE", ...)
        // ... más reglas por rol
        .anyRequest().authenticated()
    )
    .authenticationProvider(authProvider)
    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
```

**Usuarios de prueba** (password: `123456`):

| Email | Rol | Acceso |
|-------|-----|--------|
| `admin@test.com` | ADMIN | Todo el sistema |
| `gerente@test.com` | GERENTE | Gestión general |
| `ventas@test.com` | VENTAS | Pedidos |
| `inventorista@test.com` | INVENTORISTA | Productos, stock |
| `analista@test.com` | ANALISTA | Reportes, consultas |
| `cliente@test.com` | CLIENTE | Comprar, ver pedidos propios |

### 4.2 Gestión de Productos (CRUD + Jerarquía de Clases)

**Modelo:**

```java
// Clase base
public class Producto {
    Integer id;
    String nombre;
    BigDecimal precio;
    Integer stock;
    String imagenUrl;
    @ManyToOne Categoria categoria;
}

// Subclases con SINGLE_TABLE
public class Comida extends Producto { int gramos; }
public class Bebida extends Producto { float litros; }
```

**Endpoints:**

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/productos` | Listar todos | Público |
| GET | `/productos/{id}` | Obtener por ID | Público |
| POST | `/productos` | Crear | ADMIN, INVENTORISTA, USUARIO_CARGA, GERENTE |
| PUT | `/productos/{id}` | Actualizar | ADMIN, INVENTORISTA, GERENTE |
| DELETE | `/productos/{id}` | Eliminar | ADMIN, INVENTORISTA, GERENTE |
| GET | `/productos/nombre/{nombre}` | Buscar por nombre | Público |
| GET | `/productos/categoria/{categoria}` | Buscar por categoría (IgnoreCase) | Público |

### 4.3 Categorías (CRUD + SubCategorías)

```java
public class Categoria {
    Integer id;     // ← @JsonProperty("_id") para compatibilidad frontend
    String tipo;    // ← clave única
    String nombre;  // ← visible al usuario
    String descripcion;
}
```

### 4.4 Carrito de Compras

**Modelo:**
```java
public class Carrito {
    Integer id;
    @ManyToMany List<Producto> productos;  // tabla intermedia carrito_productos
}
```

**Control de stock:** Al agregar un producto al carrito, se decrementa el stock. Si stock es 0, lanza `StockInsuficienteException` → 400.

**Endpoints:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/carritos` | Crear carrito vacío |
| GET | `/carritos/{id}` | Obtener carrito con productos |
| POST | `/carritos/{id}/productos/{productoId}` | Agregar producto (decrementa stock) |
| DELETE | `/carritos/{id}/vaciar` | Vaciar carrito |
| DELETE | `/carritos/{id}` | Eliminar carrito |

### 4.5 Pedidos (Con líneas, descuentos y cupones)

**Modelo:**
```java
public class Pedido {
    Integer id;
    LocalDate fecha;
    String cliente;
    String estado;        // "Confirmado", "En Preparación", etc.
    BigDecimal total;     // calculado: suma lineas - descuento
    @OneToMany List<LineaPedido> lineas;
    @ManyToOne Usuario usuario;
    String medioPago;
    BigDecimal descuentoAplicado;
    String codigoCupon;
}

public class LineaPedido {
    Integer id;
    String producto;
    int cantidad;
    BigDecimal precioUnitario;
    BigDecimal subtotal;   // cantidad * precioUnitario
}
```

**Lógica de negocio:** El total se recalcula automáticamente al setear `descuentoAplicado`, y nunca baja de 0.

**Endpoints:**

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/pedidos` | Listar (paginado, filtro por fecha) | VENTAS, GERENTE, ADMIN, ANALISTA |
| GET | `/pedidos/{id}` | Obtener pedido | VENTAS, GERENTE, ADMIN |
| GET | `/pedidos/mis-pedidos` | Pedidos del cliente autenticado | CLIENTE + staff |
| POST | `/pedidos` | Crear pedido (con/sin cupón) | VENTAS, GERENTE, ADMIN |
| PUT | `/pedidos/{id}` | Actualizar estado | GERENTE, ADMIN |

### 4.6 Cupones de Descuento

**Modelo:**
```java
public enum TipoDescuento { PORCENTAJE, MONTO_FIJO }

public class Cupon {
    String codigo;
    TipoDescuento tipo;
    BigDecimal valor;            // 10 (porcentaje) o 500 (monto fijo)
    int usosDisponibles;
    BigDecimal montoMinimo;      // opcional
    LocalDate fechaExpiracion;   // opcional
}
```

**Endpoints:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/cupones/validar` | Validar cupón en checkout (calcula descuento) |
| GET | `/cupones` | Listar cupones (paginado) |
| POST | `/cupones` | Crear cupón |
| DELETE | `/cupones/{id}` | Eliminar cupón |

### 4.7 Stock (Movimientos y Control)

**Modelo:**
```java
public enum TipoMovimiento { INGRESO, EGRESO, AJUSTE }

public class MovimientoStock {
    Integer id;
    @ManyToOne Producto producto;
    TipoMovimiento tipo;
    int cantidad;
    String motivo;
    LocalDateTime fecha;
}
```

**Endpoints:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/stock` | Listar movimientos (paginado) |
| POST | `/stock/ingreso` | Registrar ingreso |
| POST | `/stock/egreso` | Registrar egreso |
| POST | `/stock/ajuste` | Ajustar stock |

### 4.8 Webhooks

**Modelo:**
```java
public class Webhook {
    Integer id;
    String url;         // URL a notificar
    String evento;      // "PEDIDO_CREADO", "STOCK_BAJO"
    boolean activo;
    LocalDateTime createdAt;
}
```

**Endpoints:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/webhooks` | Listar webhooks |
| POST | `/webhooks` | Crear webhook |
| PUT | `/webhooks/{id}` | Actualizar |
| DELETE | `/webhooks/{id}` | Eliminar |

Cuando ocurre un evento (`PEDIDO_CREADO`), `WebhookService` notifica a todas las URLs configuradas para ese evento.

### 4.9 Auditoría

**Modelo:**
```java
public class Auditoria {
    Integer id;
    String accion;        // "CREAR_PRODUCTO", "ELIMINAR_USUARIO"
    String entidad;       // "Producto", "Usuario"
    Integer entidadId;
    String detalle;       // JSON con el cambio
    String usuarioEmail;
    LocalDateTime fecha;
}
```

`AuditoriaService` se inyecta en los servicios de negocio para registrar cada operación significativa.

**Endpoint:** `GET /auditoria?pagina=0&limite=20` (GERENTE, ADMIN)

### 4.10 Notificaciones en Tiempo Real (SSE)

**Endpoint:** `GET /notificaciones/suscripcion` — flujo SSE (Server-Sent Events)

`SseEmitter` mantiene la conexión abierta. El frontend se suscribe y recibe notificaciones push cuando ocurren eventos (pedido creado, stock bajo, etc.).

**Tecnología:** `org.springframework.web.servlet.mvc.method.annotation.SseEmitter`

### 4.11 Recuperación de Contraseña

**Flujo completo:**
1. `POST /auth/forgot-password` — recibe email, genera token JWT con expiración 15min, guarda hash en `Usuario.resetTokenHash` (ideal: enviar email; actual: loguear en consola)
2. `POST /auth/reset-password` — recibe token + nueva contraseña, valida token, actualiza password, limpia `resetTokenHash`
3. **Rate limiting:** `RateLimiterService` limita a 3 intentos por email cada 15 minutos
4. **Token blacklist:** `TokenBlacklistService` invalida tokens en logout (`POST /auth/logout`)

### 4.12 Contacto (Formulario Público)

```java
public class Contacto {
    Integer id;
    String nombre;
    String email;
    String mensaje;
    LocalDateTime createdAt;
    boolean leido;
}
```

**Endpoints:**

| Método | Endpoint | Acceso |
|--------|----------|--------|
| POST | `/contacto` | Público (sin auth) |
| GET | `/contacto` | GERENTE, ADMIN |
| PUT | `/contacto/{id}` | GERENTE, ADMIN |

### 4.13 Exportación Excel / PDF

**Excel:** `Apache POI` genera archivos `.xlsx` con los datos de productos o pedidos filtrados por fecha.

**PDF:** `Flying Saucer` + `OpenPDF` renderiza templates Thymeleaf a PDF.

**Endpoint:** `GET /reportes/{tipo}?formato=excel|pdf&fechaDesde=...&fechaHasta=...`

### 4.14 Importación Masiva de Productos

`POST /productos/importar` acepta un JSON con lista de productos y los crea en lote. Incluye también importación de imágenes macheando por nombre de producto.

### 4.15 Swagger / OpenAPI

`OpenApiConfig.java` configura:
- Título: "Ecommerce API"
- Descripción: endpoints del sistema con seguridad Bearer JWT
- Acceso: `/swagger-ui.html` (público)

### 4.16 GlobalExceptionHandler (Manejo Centralizado de Errores)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    // @Valid falla → 400 con { campo: mensaje }
    MethodArgumentNotValidException → Map<String, String>

    // ProductoNoEncontradoException → 404
    // CategoriaNoEncontradoException → 404
    // StockInsuficienteException → 400
    // CarritoNoEncontradoException → 404
    // TokenExpiradoException → 401
    // CuponInvalidoException → 400
    // HttpMessageNotReadableException → 400
    // DataIntegrityViolationException → 409
    // Exception genérica → 500 con detalle y path
}
```

---

## 5. Modelo de Datos

### 5.1 Jerarquía de Usuarios

```
Usuario (UserDetails) ← SINGLE_TABLE, discriminator: tipo_usuario
├── Cliente
└── Administrador
```

`Usuario` implementa `UserDetails` de Spring Security, integrándose directamente con `DaoAuthenticationProvider`:

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
}
```

### 5.2 Jerarquía de Productos

```
Producto ← SINGLE_TABLE, discriminator: tipo_producto
├── Comida     (+ gramos)
└── Bebida     (+ litros)
```

### 5.3 Relaciones JPA

| Entidad A | Relación | Entidad B | Tabla |
|-----------|----------|-----------|-------|
| Producto | @ManyToOne | Categoria | producto.categoria_id |
| Pedido | @OneToMany | LineaPedido | linea_pedido.pedido_id |
| Pedido | @ManyToOne | Usuario | pedidos.usuario_id |
| Carrito | @ManyToMany | Producto | carrito_productos |
| Carrito | @ManyToOne | Usuario | carritos.usuario_id |

---

## 6. Seguridad

### 6.1 JWT

- **Algoritmo:** HMAC-SHA256 (Keys.hmacShaKeyFor)
- **Claims:** subject (email), id, rol, iat, exp
- **Expiración:** 24h por defecto (configurable via `JWT_EXPIRATION`)
- **Reset token:** 15 minutos
- **Header:** `Authorization: Bearer <token>`

### 6.2 Protección por Roles

| Rol | Permisos |
|-----|----------|
| CLIENTE | Comprar, ver pedidos propios, validar cupones |
| VENTAS | Gestionar pedidos |
| INVENTORISTA | Productos, stock |
| ANALISTA | Reportes, consultas |
| GERENTE | Gestión general (pedidos, cupones, webhooks, auditoría, contacto) |
| ADMINISTRADOR | Todo |

### 6.3 Rate Limiting

`RateLimiterService` implementa un throttle de 3 intentos cada 15 minutos para `POST /auth/forgot-password`, usando un `Map<String, List<Instant>>` en memoria.

### 6.4 Token Blacklist

`TokenBlacklistService` mantiene un `Set<String>` en memoria con los tokens invalidados en logout.

---

## 7. Configuración

### 7.1 application.properties

```properties
spring.application.name=ecommerce

# H2 en memoria para desarrollo local
spring.datasource.url=jdbc:h2:mem:ecommerce
spring.datasource.driver-class-name=org.h2.Driver
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=update

# JWT
ecommerce.jwt.secret=${JWT_SECRET:ecommerce-jwt-secret-key-2026...}
ecommerce.jwt.expiration=${JWT_EXPIRATION:86400000}
```

### 7.2 application-docker.properties

```properties
# PostgreSQL para Docker
spring.datasource.url=jdbc:postgresql://postgres:5432/ecommerce
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

---

## 8. Servicios (Capa de Negocio)

| Servicio | Responsabilidad |
|----------|----------------|
| `ProductoService` | CRUD + búsquedas por nombre/categoría |
| `CategoriaService` | CRUD categorías |
| `CarritoService` | CRUD + agregar producto con control de stock |
| `PedidoService` | CRUD + cálculo de totales + descuentos + cupones |
| `UsuarioService` | CRUD usuarios + cambio de password |
| `RoleService` | Consulta de roles disponibles |
| `CuponService` | CRUD + validación y cálculo de descuento |
| `StockService` | Movimientos de stock (ingreso/egreso/ajuste) |
| `WebhookService` | CRUD + notificación HTTP a URLs externas |
| `AuditoriaService` | Registro de auditoría en base de datos |
| `NotificacionService` | SSE push a clientes conectados |
| `ContactoService` | CRUD consultas de contacto |
| `RateLimiterService` | Throttle de intentos de reset de password |
| `TokenBlacklistService` | Invalidación de tokens JWT en logout |
| `ReporteService` | Generación de datos para Excel/PDF |
| `ExcelExportService` | Exportación a .xlsx con Apache POI |
| `PdfExportService` | Exportación a PDF con Flying Saucer + Thymeleaf |
| `ImportacionService` | Importación masiva de productos |
| `AlmacenamientoService` | Gestión de archivos (imágenes) |
| `CsvExportService` | Exportación a CSV |

---

## 9. Seed Data (CargaDatosConfig)

Al iniciar la aplicación, se crean automáticamente:
- **3 categorías** (BEBIDAS, ALMACEN, GOLOSINAS)
- **5 productos** de ejemplo
- **6 usuarios** (uno por rol, password `123456`)
- **4 cupones** de descuento (DESC10, DESC20, DESC500, DESC1500)

---

## 10. Endpoints Completos

| Método | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/auth/login` | No | — |
| POST | `/auth/register` | No | — |
| POST | `/auth/forgot-password` | No | — |
| POST | `/auth/reset-password` | No | — |
| GET | `/auth/me` | Sí | todos |
| POST | `/auth/logout` | Sí | todos |
| GET | `/productos` | No | — |
| GET | `/productos/{id}` | No | — |
| POST | `/productos` | Sí | ADMIN, INVENTORISTA, USUARIO_CARGA, GERENTE |
| PUT | `/productos/{id}` | Sí | ADMIN, INVENTORISTA, GERENTE |
| DELETE | `/productos/{id}` | Sí | ADMIN, INVENTORISTA, GERENTE |
| POST | `/productos/importar` | Sí | ADMIN, USUARIO_CARGA |
| GET | `/categorias` | No | — |
| POST | `/categorias` | Sí | ADMIN, INVENTORISTA, GERENTE |
| PUT | `/categorias/{id}` | Sí | ADMIN, INVENTORISTA, GERENTE |
| DELETE | `/categorias/{id}` | Sí | ADMIN, INVENTORISTA, GERENTE |
| POST | `/carritos` | No | — |
| GET | `/carritos/{id}` | No | — |
| POST | `/carritos/{id}/productos/{prodId}` | No | — |
| DELETE | `/carritos/{id}/vaciar` | No | — |
| DELETE | `/carritos/{id}` | No | — |
| GET | `/pedidos` | Sí | VENTAS, GERENTE, ADMIN, ANALISTA |
| GET | `/pedidos/mis-pedidos` | Sí | CLIENTE + staff |
| POST | `/pedidos` | Sí | VENTAS, GERENTE, ADMIN |
| PUT | `/pedidos/{id}` | Sí | GERENTE, ADMIN |
| GET | `/usuarios` | Sí | ADMIN |
| POST | `/usuarios` | Sí | ADMIN |
| PUT | `/usuarios/{id}` | Sí | ADMIN |
| DELETE | `/usuarios/{id}` | Sí | ADMIN |
| GET | `/roles` | No | — |
| GET | `/cupones` | Sí | GERENTE, ADMIN |
| POST | `/cupones` | Sí | GERENTE, ADMIN |
| POST | `/cupones/validar` | Sí | CLIENTE, GERENTE, ADMIN |
| DELETE | `/cupones/{id}` | Sí | GERENTE, ADMIN |
| POST | `/stock/ingreso` | Sí | INVENTORISTA, GERENTE, ADMIN |
| POST | `/stock/egreso` | Sí | INVENTORISTA, GERENTE, ADMIN |
| POST | `/stock/ajuste` | Sí | INVENTORISTA, GERENTE, ADMIN |
| GET | `/stock` | Sí | INVENTORISTA, GERENTE, ADMIN |
| GET | `/webhooks` | Sí | GERENTE, ADMIN |
| POST | `/webhooks` | Sí | GERENTE, ADMIN |
| PUT | `/webhooks/{id}` | Sí | GERENTE, ADMIN |
| DELETE | `/webhooks/{id}` | Sí | GERENTE, ADMIN |
| GET | `/auditoria` | Sí | GERENTE, ADMIN |
| GET | `/notificaciones/suscripcion` | Sí | todos |
| POST | `/contacto` | No | — |
| GET | `/contacto` | Sí | GERENTE, ADMIN |
| PUT | `/contacto/{id}` | Sí | GERENTE, ADMIN |
| GET | `/reportes/{tipo}` | Sí | ANALISTA, GERENTE, ADMIN |
| POST | `/productos/upload` | Sí | ADMIN, USUARIO_CARGA |
| POST | `/productos/importar-fotos` | Sí | ADMIN, USUARIO_CARGA |

---

## 11. Cambios Respecto a la de After Lab del Curso.

El After Lab del Curso establecía una estructura base con Producto, Categoria, Carrito y GlobalExceptionHandler. Este  proyecto final agrega:

| Feature | En guía alumno | En proyecto final |
|---------|---------------|-------------------|
| Spring Security | No | SecurityFilterChain + JWT + roles |
| Autenticación | No | JWT (login, register, logout) |
| Roles | No | 6 roles con permisos granulares |
| Usuarios | No | CRUD completo + UserDetails |
| Pedidos | No | CRUD + líneas + descuentos + cupones |
| Cupones | No | % y monto fijo + validación |
| Stock | No | Movimientos con control de egresos |
| Webhooks | No | Notificación HTTP a URLs externas |
| Auditoría | No | Log de acciones con detalle JSON |
| SSE | No | Notificaciones en tiempo real |
| Recuperación password | No | Flujo completo con token 15min |
| Rate limiting | No | 3 intentos / 15 min |
| Token blacklist | No | Logout invalida token |
| Exportación Excel/PDF | No | Apache POI + Flying Saucer |
| Importación masiva | No | JSON + imágenes |
| Swagger | No | OpenAPI + Swagger UI |
| Lombok | Sí (Básico) | En todas las entidades y DTOs |
| GlobalExceptionHandler | Sí (Básico) | 10+ manejadores especializados |
| CORS | Sí | global via CorsConfig + Security |

---

*Proyecto: springboot-productos → Ecommerce Full Stack*
