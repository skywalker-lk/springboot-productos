# ============================================================
# Dockerfile para el frontend React + Vite
# Multi-stage: compila con Node, sirve con Nginx
# ============================================================

# --- Stage 1: Compilación ---
FROM node:22-alpine AS build

WORKDIR /app

# Copiar dependencias primero (cache de node_modules)
COPY package.json package-lock.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Build de producción
# VITE_API_URL apunta al backend expuesto en el host
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Stage 2: Nginx ---
FROM nginx:alpine

# Copiar el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
