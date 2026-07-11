# ============================================================
# Dockerfile para springboot-productos (single-module)
# Multi-stage: compila con Maven + JDK, corre con JDK mínimo
# ============================================================

# --- Stage 1: Compilación ---
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copiar pom.xml primero (cache de dependencias)
COPY pom.xml .

# Descargar dependencias (se cachea si el pom no cambia)
RUN mvn dependency:go-offline -q

# Copiar el código fuente
COPY . .

# Compilar y empaquetar (sin tests para acelerar)
RUN mvn package -DskipTests -q

# --- Stage 2: Ejecución ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el JAR del stage anterior
COPY --from=build /app/target/springboot-productos-*.jar app.jar

# Puerto de la app
EXPOSE 8080

# Perfil Docker (usa PostgreSQL) y arranque
ENV SPRING_PROFILES_ACTIVE=docker

ENTRYPOINT ["java", "-jar", "app.jar"]
