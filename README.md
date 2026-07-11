# springboot-productos — Ecommerce Full Stack

Backend del sistema ecommerce con Spring Boot, JWT, roles, y múltiples features.

## Stack

- Java 17, Spring Boot 4.0.6
- Spring Security + JWT (HMAC-SHA256)
- Spring Data JPA + Hibernate
- H2 (desarrollo) / PostgreSQL (producción)
- Lombok, OpenAPI/Swagger, Apache POI, Flying Saucer PDF

## Docs

Ver [`DOCUMENTACION_CAMBIOS.md`](./DOCUMENTACION_CAMBIOS.md) para la documentación completa del proyecto, incluyendo arquitectura, endpoints, y cambios respecto a la guía del alumno.

## Quick Start

```bash
# Desarrollo local (H2 en memoria)
mvn spring-boot:run

# Producción (Docker + PostgreSQL)
docker compose up --build
```

## Endpoints principales

| Recurso | Documentación |
|---------|---------------|
| API | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| H2 Console | `http://localhost:8080/h2-console` |

## Features Agregadas

✅ JWT + Spring Security con 6 roles  
✅ Productos (CRUD + jerarquía Comida/Bebida)  
✅ Categorías + SubCategorías  
✅ Carrito de compras con control de stock  
✅ Pedidos con líneas, descuentos y cupones  
✅ Cupones de descuento (% y monto fijo)  
✅ Stock con movimientos (ingreso/egreso/ajuste)  
✅ Usuarios con CRUD y roles  
✅ Recuperación de contraseña (token 15min)  
✅ Notificaciones SSE en tiempo real  
✅ Webhooks para eventos del sistema  
✅ Auditoría de acciones  
✅ Exportación Excel/PDF  
✅ Importación masiva de productos  
✅ Formulario de contacto público  
✅ OpenAPI / Swagger UI  
✅ GlobalExceptionHandler centralizado
